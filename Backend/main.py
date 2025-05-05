import time
from dotenv import load_dotenv
from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.staticfiles import StaticFiles
import os
import uuid
import base64
from unstructured.partition.pdf import partition_pdf
from langchain.chains import LLMChain
from langchain.prompts import PromptTemplate
from langchain.schema.messages import HumanMessage, SystemMessage
from langchain.schema.document import Document
from langchain.vectorstores import FAISS
from langchain_together import ChatTogether, TogetherEmbeddings
from pydantic import BaseModel
from typing import List, Optional

from fastapi.middleware.cors import CORSMiddleware


import logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

import os
os.environ["KMP_DUPLICATE_LIB_OK"] = "TRUE"

load_dotenv()


app = FastAPI()

# Allow CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # allow your React frontend
    allow_credentials=False,
    allow_methods=["*"],  # allow all HTTP methods (GET, POST, etc)
    allow_headers=["*"],  # allow all headers
)

app.mount("/static", StaticFiles(directory="static"), name="static")

os.makedirs("static/uploads", exist_ok=True)
os.makedirs("static/images", exist_ok=True)
os.makedirs("static/vectorstore", exist_ok=True)


# Initialize global variables
llm = None
embeddings=None
vectorstore = None

#pydantic models
class QueryRequest(BaseModel):
    query: str


class QueryResponse(BaseModel):
    answer: str
    images: Optional[List[str]] = []




# Initialize the LLM and embeddings
def initialize_models():
    global llm, embeddings

    api_key = os.environ.get("TOGETHER_API_KEY")

    if not api_key:
        raise HTTPException(status_code=500, detail="API key not configured.")
    
    llm = ChatTogether(
         model="meta-llama/Llama-4-Maverick-17B-128E-Instruct-FP8",
        temperature=0,
        max_tokens=None,
        timeout=None,
        max_retries=2,
    )

    embeddings = TogetherEmbeddings(
        model="togethercomputer/m2-bert-80M-8k-retrieval",
    )



# Helper functions
def save_upload_file(upload_file: UploadFile) -> str:
    file_extension = os.path.splitext(upload_file.filename)[1]
    unique_filename = f"{uuid.uuid4()}{file_extension}"
    file_path = os.path.join("static/uploads", unique_filename)
    
    with open(file_path, "wb") as f:
        f.write(upload_file.file.read())
    
    return file_path

def encode_image(image_path: str) -> str:
    with open(image_path, "rb") as f:
        return base64.b64encode(f.read()).decode('utf-8')

def summarize_image(encoded_image: str):
    prompt = [
        SystemMessage(content="You are a bot that is good at analyzing images related to medical field"),
        HumanMessage(content=[
            {
                "type": "text",
                "text": "Describe the contents of this image."
            },
            {
                "type": "image_url",
                "image_url": {
                    "url": f"data:image/jpeg;base64,{encoded_image}"
                },
            },
        ])
    ]
    response = llm.invoke(prompt)
    return response.content





# API endpoints
@app.post("/api/upload")
async def upload_file(file: UploadFile = File(...)):
    global llm, embeddings, vectorstore

    if not llm or not embeddings:
        initialize_models()
    
    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are supported.")


    file_path = save_upload_file(file)

    logger.info(f"Starting to process file: {file.filename}")
     
    
    try: 
        logger.info("Partitioning PDF...")
        start_time = time.time()
        raw_pdf_elements = partition_pdf(
            filename=file_path,
            extract_images_in_pdf=True,
            infer_table_structure=True,
            chunking_strategy="by_title",
            max_characters=4000,
            new_after_n_chars=3800,
            combine_text_under_n_chars=2000,
            extract_image_block_output_dir="static/images",
        )

        logger.info(f"PDF partitioning completed in {time.time() - start_time:.2f} seconds")

        # Get text summaries and table summaries
        text_elements = []
        table_elements = []
        text_summaries = []
        table_summaries = []
        
        summary_prompt = """
        Summarize the following {element_type}:
        {element}
        """
        summary_chain = LLMChain(
            llm=llm,
            prompt=PromptTemplate.from_template(summary_prompt)
        )
        
        logger.info(f"Starting to process {len(raw_pdf_elements)} elements...")

        for e in raw_pdf_elements:
            if 'CompositeElement' in repr(e):
                text_elements.append(e.text)
                summary = summary_chain.invoke({'element_type': 'text', 'element': e.text})
                text_summaries.append(summary['text'])
            
            elif 'Table' in repr(e):
                table_elements.append(e.text)
                summary = summary_chain.invoke({'element_type': 'table', 'element': e.text})
                table_summaries.append(summary['text'])


        logger.info(f"Text and table processing completed in {time.time() - start_time:.2f} seconds")

        # Get image summaries
        image_elements = []
        image_summaries = []

        logger.info("Starting to process images...")
        for image_file in os.listdir("static/images"):
            if image_file.endswith(('.png', '.jpg', '.jpeg')):
                image_path = os.path.join("static/images", image_file)
                encoded_image = encode_image(image_path)
                image_elements.append(encoded_image)
                summary = summarize_image(encoded_image)
                image_summaries.append(summary)
        
        
        logger.info(f"Image processing completed in {time.time() - start_time:.2f} seconds")


        logger.info("Creating documents...")
        # Create Documents
        documents = []
        
        # Add text documents
        for e, s in zip(text_elements, text_summaries):
            doc_id = str(uuid.uuid4())
            doc = Document(
                page_content=s,
                metadata={
                    'id': doc_id,
                    'type': 'text',
                    'original_content': e
                }
            )
            documents.append(doc)

        
        # Add table documents
        for e, s in zip(table_elements, table_summaries):
            doc_id = str(uuid.uuid4())
            doc = Document(
                page_content=s,
                metadata={
                    'id': doc_id,
                    'type': 'table',
                    'original_content': e
                }
            )
            documents.append(doc)


        # Add image documents
        for e, s in zip(image_elements, image_summaries):
            doc_id = str(uuid.uuid4())
            doc = Document(
                page_content=s,
                metadata={
                    'id': doc_id,
                    'type': 'image',
                    'original_content': e
                }
            )
            documents.append(doc)

        logger.info(f"Documents created: {len(documents)}")

        logger.info("Creating embeddings...")
        # Create vector store
        vector_store = FAISS.from_documents(documents=documents, embedding=embeddings)
        vector_store.save_local("vectorstore")
        logger.info("Embeddings created and saved.")
        
        return {
            "status": "success",
            "message": f"PDF processed successfully with {len(documents)} documents extracted",
        }
    
    
    except Exception as e:
        # Delete the uploaded file in case of error
        if os.path.exists(file_path):
            os.remove(file_path)
        
        raise HTTPException(status_code=500, detail=f"Error processing PDF: {str(e)}")



@app.post("/api/query", response_model=QueryResponse)
async def query_pdf(query: QueryRequest):
    global llm, embeddings, vectorstore
    
    if llm is None or embeddings is None:
        initialize_models()

    if vectorstore is None:
        try:
            vectorstore = FAISS.load_local("vectorstore", embeddings, allow_dangerous_deserialization=True)

        except Exception as e:
            raise HTTPException(status_code=400, detail="No PDF has been processed yet. Please upload a PDF first.")
    

    # Create QA chain
    prompt_template = """
    You are an export in the medical field.
    Answer the question based only on the following context, which can include text, images and tables:
    {context}
    Question: {question}
    Don't answer if you are not sure and decline to answer and say "Sorry, I don't have much information about it."
    Just return the helpful answer in as much as detailed possible.
    Answer:
    """
    
    qa_chain = LLMChain(
        llm=llm,
        prompt=PromptTemplate.from_template(prompt_template)
    )


    # Get relevant documents
    relevant_docs = vectorstore.similarity_search(query.query, k=4)
    context = ""
    relevant_images = []
    
    for doc in relevant_docs:
        if doc.metadata['type'] == 'text':
            context += '[text]' + doc.metadata['original_content'] + '\n\n'
        elif doc.metadata['type'] == 'table':
            context += '[table]' + doc.metadata['original_content'] + '\n\n'
        elif doc.metadata['type'] == 'image':
            context += '[image]' + doc.page_content + '\n\n'
            relevant_images.append(doc.metadata['original_content'])
    
    # Generate answer
    result = qa_chain.run({'context': context, 'question': query.query})

    # Save images to serve them via API
    image_urls = []
    for i, encoded_image in enumerate(relevant_images):
        try:
            image_filename = f"result_{i}_{hash(query.query)%10000}.jpg"
            image_path = os.path.join("static/images", image_filename)
            
            # Save the decoded image
            with open(image_path, "wb") as f:
                f.write(base64.b64decode(encoded_image))
            
            # Add the URL path
            image_urls.append(f"/static/images/{image_filename}")
        except Exception as e:
            print(f"Error saving image: {e}")
    
    return QueryResponse(
        answer=result,
        images=image_urls
    )

    if __name__ == "__main__":
        import uvicorn
        uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
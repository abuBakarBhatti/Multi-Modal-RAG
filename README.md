# 🧠 Multimodal RAG (Retrieval-Augmented Generation) App

This is a full-stack **Multimodal Retrieval-Augmented Generation (RAG)** application built with modern tooling and powered by **state-of-the-art multimodal LLMs**.

It enables **contextual question answering** and **interactive document exploration**.

---

## 💡 Problem It Solves

In real-world scenarios, information is often scattered across unstructured documents (PDFs, Word files, images with text, etc.). This application aims to solve:

- ✅ Extracting meaningful context from **unstructured documents**
- ✅ Enabling natural-language **question answering** over documents
- ✅ Combining **pdfs containing images** for richer understanding

---

## 🧰 Tech Stack & Key Libraries

| Layer         | Technology Used |
|---------------|-----------------|
| **Backend**   | [FastAPI](https://fastapi.tiangolo.com/) (Python) |
| **Frontend**  | [React](https://reactjs.org/) + [TypeScript](https://www.typescriptlang.org/) |
| **LLM**       | [LLaMA 4 Maverick](https://platform.together.xyz/) via Together API (or local models via Ollama) |
| **Parsing**   | [Unstructured.io](https://github.com/Unstructured-IO/unstructured) for intelligent document parsing |
| **RAG Logic** | [LangChain](https://www.langchain.com/) for orchestration |
| **Image Support** | Vision-capable LLMs with multimodal context ingestion |

---

## 🚀 Project Structure

```bash
multimodal-rag/
├── backend/               # FastAPI backend
│   ├── main.py
│   ├── requirements.txt
│   └── ...
│
├── frontend/              # React frontend (TypeScript)
│   ├── package.json
│   └── ...
│
└── README.md              # You're reading it!
```

🛠️ Getting Started
1. Backend Setup (FastAPI)
🔹 Step 1: Create and activate a virtual environment

```bash
cd backend
python -m venv venv
source venv/bin/activate  
#Windows:venv\Scripts\activate
```
🔹 Step 2: Install dependencies
```bash 
pip install -r requirements.txt 
```

🔹 Step 3: Set your API key
```bash
Create a .env file inside the backend directory:

TOGETHER_API_KEY=your_api_key_here
```

You can replace the Together API provider with your own LLM provider in main.py, or use a local model via Ollama if preferred.
The default LLM used is:

```model="meta-llama/Llama-4-Maverick-17B-128E-Instruct-FP8"```

⚠️ Ensure your chosen model supports multimodal input.

🔹 Step 4: Run the FastAPI server
```bash

    uvicorn main:app --reload
```


2. Frontend Setup (React with TypeScript)
```bash
cd frontend
npm install
npm run dev

This will start the frontend development server.
```


🧪 Features
Multimodal LLM support (text + image, etc.)

Customizable LLM provider (Together API, Ollama, etc.)

Frontend built with modern React and TypeScript

Simple .env-based configuration for API keys


📌 Notes
This app does not use a database at the moment — it's focused on demonstrating multimodal LLM capability via RAG.

Extend or modify the backend’s main.py to customize your pipeline or LLM routing.


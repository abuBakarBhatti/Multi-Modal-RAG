# 🧠 Multimodal RAG (Retrieval-Augmented Generation) App

## Test commit to verify author change


This is a full-stack **Multimodal RAG** (Retrieval-Augmented Generation) application built using:

- ⚙️ **FastAPI** (Python) for the backend
- ⚛️ **React (TypeScript)** for the frontend
- 🤖 **Multimodal LLMs** (like LLaMA 4 Maverick via Together API or custom local models via Ollama)

The app enables advanced question answering and document interaction using **multimodal large language models**.

---

## 🚀 Project Structure

```bash
your-project/
│
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


🛠️ Getting Started
1. Backend Setup (FastAPI)
🔹 Step 1: Create and activate a virtual environment

cd backend
python -m venv venv
source venv/bin/activate  
#Windows:venv\Scripts\activate

🔹 Step 2: Install dependencies
pip install -r requirements.txt

🔹 Step 3: Set your API key
Create a .env file inside the backend directory:

```TOGETHER_API_KEY=your_api_key_here
```

You can replace the Together API provider with your own LLM provider in main.py, or use a local model via Ollama if preferred.
The default LLM used is:

```model="meta-llama/Llama-4-Maverick-17B-128E-Instruct-FP8"```

⚠️ Ensure your chosen model supports multimodal input.

🔹 Step 4: Run the FastAPI server
    uvicorn main:app --reload



2. Frontend Setup (React with TypeScript)
cd frontend
npm install
npm run dev

This will start the frontend development server.


🧪 Features
Multimodal LLM support (text + image, etc.)

Customizable LLM provider (Together API, Ollama, etc.)

Frontend built with modern React and TypeScript

Simple .env-based configuration for API keys


📌 Notes
This app does not use a database at the moment — it's focused on demonstrating multimodal LLM capability via RAG.

Extend or modify the backend’s main.py to customize your pipeline or LLM routing.


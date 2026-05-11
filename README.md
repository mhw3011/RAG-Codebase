# Codebase RAG AI

AI-powered codebase analysis system using RAG (Retrieval Augmented Generation), vector embeddings, and contextual code querying.

Users can upload a GitHub repository and ask technical questions about the codebase. The system retrieves relevant code chunks using embeddings and generates contextual explanations using OpenAI.

---

# Features

- Upload GitHub repositories
- Intelligent code chunking
- Vector embeddings with OpenAI
- Semantic code search using pgvector
- Context-aware code explanations
- Clickable source references
- Code preview modal with syntax highlighting
- Session-based repository analysis
- File tree viewer
- AI-powered code understanding

---

# Tech Stack

## Frontend

- React
- Vite
- Material UI
- Axios
- react-syntax-highlighter

## Backend

- Node.js
- Express.js
- OpenAI API

## Database

- Supabase PostgreSQL
- pgvector

## AI

- GPT-4o-mini
- text-embedding-3-small

---

# Architecture

```text
Frontend (React)
        ↓
Backend API (Express)
        ↓
Embedding + Retrieval Layer
        ↓
Supabase pgvector
        ↓
OpenAI GPT-4o-mini
```

---

# How It Works

## 1. Repository Upload

- User submits GitHub repository URL
- Repository is cloned temporarily
- Files are scanned recursively

## 2. Code Chunking

Code is split into meaningful chunks:

- functions
- routes
- classes
- utilities

Each chunk stores:

- file path
- function name
- code content

---

## 3. Embedding Generation

Each chunk is converted into vector embeddings using:

```text
text-embedding-3-small
```

Embeddings are stored in Supabase pgvector.

---

## 4. Query Flow

When user asks a question:

1. Query embedding is generated
2. Similar code chunks are retrieved
3. Relevant context is sent to GPT-4o-mini
4. AI generates structured explanation
5. Used source files/functions are returned

---

# Project Structure

```text
project-root/
│
├── backend/
│
├── frontend/
│
├── .gitignore
│
└── README.md
```

---

# Backend Structure

```text
backend/
│
├── src/
│   ├── routes/
│   ├── controllers/
│   ├── services/
│   ├── utils/
│   └── server.js
```

---

# Frontend Structure

```text
frontend/
│
├── src/
│   ├── components/
│   ├── utils/
│   ├── App.jsx
│   └── main.jsx
```

---

# Environment Variables

## Backend `.env`

```env
OPENAI_API_KEY=
SUPABASE_URL=
SUPABASE_KEY=
```

---

# Installation

## Clone Repository

```bash
git clone https://github.com/mhw3011/RAG-Codebase.git
```

---

## Backend Setup

```bash
cd backend
npm install
npm run dev
```

---

## Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

---

# Deployment

## Frontend

Deploy on:

- Vercel

## Backend

Deploy on:

- Render

---

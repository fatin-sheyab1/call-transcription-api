# Call Transcription and PII Extraction API

A backend API for uploading call recordings, transcribing audio, analyzing call transcripts, and extracting Personally Identifiable Information (PII).

The project uses Node.js and Express for the main backend, PostgreSQL with Prisma for data storage, Whisper for speech-to-text transcription, Gemini for transcript analysis, and a custom fine-tuned mBERT model for PII extraction.

## Features

- User registration and login
- JWT authentication
- Upload call recordings
- Asynchronous call transcription
- Store transcripts in PostgreSQL
- Generate call summaries
- Detect call sentiment
- Extract key topics
- Extract PII from transcripts
- Store structured PII as JSON
- Retrieve calls, transcripts, and analysis
- User-based access control
- AI output validation before saving
- Graceful error handling
- Call processing status tracking

## Technologies

### Backend
- Node.js
- Express.js
- Prisma ORM
- PostgreSQL
- BullMQ
- JWT

### AI Services
- Whisper for speech-to-text transcription
- Google Gemini for transcript analysis
- Fine-tuned multilingual BERT (mBERT) for PII extraction
- FastAPI for Python AI services
- PyTorch
- Hugging Face Transformers

## System Architecture

The system consists of four running processes:

1. Node.js API Server - Port 8082
2. Transcription Worker - Processes queued calls
3. PII Extraction FastAPI Service - Port 8000
4. Whisper Transcription FastAPI Service - Port 8001

Basic flow:

Audio Upload
→ Node.js API
→ Processing Queue
→ Transcription Worker
→ Whisper API
→ Transcript
→ Gemini Analysis
→ PII Extraction API
→ PostgreSQL

## PII Model

The PII extraction service uses a custom fine-tuned multilingual BERT model:

`google-bert/bert-base-multilingual-cased`

The model was fine-tuned using the AI4Privacy PII dataset.

Final test performance:

- Accuracy: 97.41%
- Precision: 93.80%
- Recall: 95.18%
- F1 Score: 94.49%

The extracted PII is returned as structured JSON and stored in PostgreSQL.

Example structure:

```json
{
  "pii": [
    {
      "type": "FIRSTNAME",
      "value": "Example"
    },
    {
      "type": "EMAIL",
      "value": "example@example.com"
    }
  ]
}
```

## API Endpoints

### Authentication

```text
POST /auth/register
POST /auth/login
GET  /auth/me
```

### Calls

```text
POST   /calls
GET    /calls
GET    /calls/:id
DELETE /calls/:id
```

### Transcription

```text
POST /calls/:id/process
GET  /calls/:id/transcript
```

### Analysis

```text
POST /calls/:id/analyze
GET  /calls/:id/analysis
```

### PII Extraction

```text
POST /calls/:id/analyze-pii
```

## Call Status

Calls can have the following statuses:

```text
UPLOADED
QUEUED
TRANSCRIBING
TRANSCRIBED
ANALYZING
COMPLETED
FAILED
```

If transcription fails, the call status is changed to `FAILED`.

## Environment Variables

Create a `.env` file in the project root.

Required environment variables include:

```env
DATABASE_URL=your_postgresql_connection_string
JWT_SECRET=your_jwt_secret
GEMINI_API_KEY=your_gemini_api_key
PII_API_URL=http://localhost:8000/extract_pii
```

Do not commit the `.env` file or API keys to GitHub.

## Running the Project

### 1. Install Node.js dependencies

```bash
npm install
```

### 2. Generate Prisma Client

```bash
npx prisma generate
```

### 3. Start the Node.js server

```bash
node server.js
```

The API runs on:

```text
http://localhost:8082
```

### 4. Start the transcription worker

Open another terminal:

```bash
node workers/transcriptionWorker.js
```

### 5. Start the PII Extraction API

Open another terminal from the project root:

```bash
source python-service/venv/bin/activate
uvicorn pii_api:app --host 0.0.0.0 --port 8000
```

### 6. Start the Whisper Transcription API

Open another terminal:

```bash
cd python-service
source venv/bin/activate
uvicorn main:app --host 0.0.0.0 --port 8001
```

## Authentication

Protected endpoints require a JWT token.

Add the token to the request header:

```text
Authorization: Bearer <token>
```

Users can only access calls that belong to their own account.

## Error Handling and Validation

The API validates AI-generated analysis and PII output before saving results to the database.

Internal provider errors are not exposed directly to API users.

If an internal service fails, the API returns a safe error response instead of exposing internal stack traces or provider details.

Sensitive PII should not be printed in application logs.

## Database

PostgreSQL is used as the main database.

Prisma models include:

- User
- Call
- CallAnalysis

`CallAnalysis` stores:

- Summary
- Sentiment
- Key topics
- Structured PII
- Associated call ID

## Project Purpose

This project demonstrates a complete backend pipeline for processing unstructured call recordings and transforming them into structured and searchable information.

It combines speech-to-text processing, generative AI analysis, custom NLP-based PII detection, authentication, asynchronous processing, and database persistence.
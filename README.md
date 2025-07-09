# Image Analyzer Application

A full-stack application that analyzes images, extracts text data, and generates PDF/Word documents from the extracted data. Built with NestJS (backend) and Angular (frontend).

## Features

- Image upload and preview
- Text extraction from images using Tesseract.js
- Export to PDF and Word documents
- Data storage in MySQL database
- Modern and responsive UI

## Project Structure

```
image-analyzer-app/
├── image-analyzer-backend/    # NestJS backend
│   ├── src/
│   │   ├── controllers/      # API endpoints
│   │   ├── services/         # Business logic
│   │   ├── entities/         # Database models
│   │   └── config/          # Configuration files
│   └── uploads/             # File storage
│       ├── images/          # Uploaded images
│       ├── pdf/            # Generated PDFs
│       └── word/           # Generated Word docs
└── image-analyzer-frontend/  # Angular frontend
    └── src/
        └── app/
            └── components/   # Angular components
```

## Prerequisites

- Node.js (v14 or higher)
- MySQL (v8.0 or higher)
- Angular CLI
- NestJS CLI

## Setup Instructions

1. Clone the repository
2. Set up the backend:
   ```bash
   cd image-analyzer-backend
   npm install
   # Configure MySQL connection in src/config/database.config.ts
   npm run start:dev
   ```

3. Set up the frontend:
   ```bash
   cd image-analyzer-frontend
   npm install
   ng serve
   ```

4. Access the application at `http://localhost:4200`

## Environment Setup

Create a `.env` file in the backend directory with the following variables:
```
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=your_username
DB_PASSWORD=your_password
DB_DATABASE=image_analyzer_db
```

## API Endpoints

- `POST /images/upload` - Upload and process an image
- `GET /images` - Get list of processed images
- `GET /images/:id/pdf` - Download PDF for an image
- `GET /images/:id/word` - Download Word document for an image

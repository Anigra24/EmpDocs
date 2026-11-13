# EmpDocs

EmpDocs is a simple employee and document management API made using Node.js, Express and MongoDB.

The project allows users to add and manage employees, upload documents for each employee, view or download those documents, and delete them when needed.

## Features

- Add, view, update and delete employees.
- Search and filter employee records.
- Upload one or multiple documents.
- View and download uploaded documents.
- Preview TXT and CSV files.
- Delete documents.
- Basic validation and error handling.

## Getting Started

First, clone the repository:

```bash
git clone <YOUR_GITHUB_REPOSITORY_URL>
cd empdocs
```

Install the required packages:

```bash
npm install
```

Create a `.env` file using `.env.example`:

```powershell
Copy-Item .env.example .env
```

Make sure MongoDB is running, then start the project:

```bash
npm start
```

The server will run at `http://localhost:5000`.

## File Upload

The project accepts PDF, JPG, JPEG, PNG, TXT and CSV files.

- Maximum file size is 2 MB.
- Up to 5 files can be uploaded at once.
- Other file types are rejected.

## Testing

The Postman collection is included in the project to test the APIs.

The `sample-files` folder contains a TXT file, a CSV file and a DOCX file for testing uploads.


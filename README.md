# PDF Extractor — Frontend

A modern React TypeScript frontend for uploading PDF files and viewing extracted tabular data.

---

## Tech Stack

| Layer      | Technology                                                      |
|------------|-----------------------------------------------------------------|
| Framework  | React 19 + TypeScript                                           |
| Build Tool | Vite 8                                                          |
| Styling    | TailwindCSS                                                     |
| Icons      | Lucide React                                                    |
| HTTP Client| Axios                                                           |

---

## Features

✨ **Beautiful File Upload UI**
- Drag-and-drop support
- File validation (PDF only, max 10MB)
- Real-time upload progress
- Success/error state handling

📊 **Data Listing Screen**
- View all uploaded PDFs
- Expandable table view for extracted data
- Responsive design
- Dark mode support

🎨 **Modern Design**
- Gradient backgrounds
- Smooth animations
- Mobile-friendly
- Accessible components

---

## Setup & Running

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment

```bash
cp .env.example .env
# Edit .env to set your backend API URL (default: http://localhost:3001)
```

### 3. Start development server

```bash
npm run dev
```

The app will start at http://localhost:5173

### 4. Build for production

```bash
npm run build
npm run preview
```

---

## Project Structure

```
src/
├── components/
│   ├── FileUpload.tsx      # File upload component with drag-and-drop
│   └── DataListing.tsx     # Data table listing component
├── services/
│   └── api.ts              # API service layer for backend communication
├── App.tsx                 # Main app component with tab navigation
├── index.css               # TailwindCSS styles
└── main.tsx                # App entry point
```

---

## API Configuration

The frontend connects to the backend API via the `VITE_API_URL` environment variable.

Default: `http://localhost:3001`

Make sure your backend is running before using the frontend.

---

## Validation Rules

**File Upload:**
- Only PDF files accepted
- Maximum file size: 10MB
- File type validation on client-side
- Additional server-side validation

---

## Usage

1. **Upload Tab**: Drag and drop a PDF file or click to browse
2. **View Data Tab**: See all uploaded PDFs and their extracted data
3. Click on any item to expand and view the full table

---

## Development

Built with React 19, TypeScript, and modern tooling for a fast development experience with HMR (Hot Module Replacement).

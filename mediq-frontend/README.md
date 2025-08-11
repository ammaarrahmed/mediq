# MedIQ Frontend

MedIQ is an AI-powered healthcare assistant that helps patients and healthcare providers manage medical information, documents, and communications.

## Features

- **Authentication**: Login/signup system with role-based access (patient/doctor)
- **Document Processing**: Upload and analyze medical documents with AI extraction
- **Chat System**: Talk to an AI assistant about your health and medical documents
- **Medical Analysis**: Analyze symptoms and get diagnostic guidance
- **User Profiles**: Manage account information and healthcare details

## Getting Started

### Prerequisites

- Node.js 18+ and npm/pnpm
- Backend API (deployed on Render.com)

### Installation

1. Clone the repository
2. Install dependencies:

```bash
pnpm install
```

3. Create a `.env.local` file with your backend URL:

```bash
NEXT_PUBLIC_API_URL=https://your-backend-url-on-render.com
```

4. Run the development server:

```bash
pnpm dev
```

## Deployment

### Deploying to Vercel (Recommended)

1. Push your code to a GitHub repository
2. Sign up for [Vercel](https://vercel.com) 
3. Import the GitHub repository
4. Add environment variables:
   - `NEXT_PUBLIC_API_URL`: Your backend API URL
5. Deploy!

### Deploying to Render.com

1. Sign up for [Render](https://render.com)
2. Create a new Web Service
3. Connect to your GitHub repository
4. Configure the service:
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
   - **Environment Variables**: 
     - `NEXT_PUBLIC_API_URL`: Your backend API URL
5. Deploy

## Backend Integration

This frontend connects to a FastAPI backend with the following features:
- Authentication system with JWT
- Document processing with OCR
- AI chat using Mistral-7B model
- Medical analysis system
- User profile management

Make sure your backend is properly deployed before connecting the frontend.

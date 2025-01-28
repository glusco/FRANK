# Student Q&A Platform

A 24/7 platform where students can ask questions and receive answers from classmates.

## Features

- User authentication and authorization
- Question posting with tags and attachments
- Answer system with acceptance and voting
- File upload support
- User reputation system

## Setup

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file with the following variables:
   ```
   MONGODB_URI=your_mongodb_uri
   JWT_SECRET=your_jwt_secret
   CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
   CLOUDINARY_API_KEY=your_cloudinary_api_key
   CLOUDINARY_API_SECRET=your_cloudinary_api_secret
   ```
4. Start the server:
   ```bash
   npm start
   ```

## API Endpoints

### Users
- POST /api/users/register - Register a new user
- POST /api/users/login - Login user
- GET /api/users/profile - Get user profile
- PUT /api/users/profile - Update user profile

### Questions
- POST /api/questions - Create a question
- GET /api/questions - Get all questions
- GET /api/questions/:id - Get a specific question
- PUT /api/questions/:id - Update a question
- DELETE /api/questions/:id - Delete a question
- POST /api/questions/:id/vote - Vote on a question

### Answers
- POST /api/answers/:questionId - Create an answer
- PUT /api/answers/:id - Update an answer
- DELETE /api/answers/:id - Delete an answer
- POST /api/answers/:id/vote - Vote on an answer
- POST /api/answers/:id/accept - Accept an answer

### File Upload
- POST /api/upload - Upload a file

## Technologies Used

- Node.js
- Express
- MongoDB
- Mongoose
- JWT
- Cloudinary
- Render (Deployment) 
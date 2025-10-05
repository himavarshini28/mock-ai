# AI Interview Assistant

A modern, full-stack web application that helps developers practice and improve their technical interview skills using AI-powered feedback and analysis.

## 🚀 Features

### Frontend Features
- **Clean, Modern UI**: Built with React 18, TypeScript, and Tailwind CSS
- **Responsive Design**: Mobile-first approach with white, orange, and black color scheme
- **State Management**: Redux Toolkit for efficient state management
- **Form Validation**: React Hook Form with Zod validation
- **Animations**: Smooth animations using Framer Motion
- **Real-time Notifications**: Toast notifications for user feedback

### Backend Features
- **AI-Powered Resume Extraction**: Advanced resume parsing with confidence scoring
- **Intelligent Question Generation**: Context-aware interview questions based on candidate profile
- **Explainable AI Scoring**: Detailed feedback with 4-dimensional scoring breakdown
- **Robust File Validation**: Enterprise-grade security for file uploads
- **RESTful API**: Clean, well-documented API endpoints

## 🏗️ Architecture

### Frontend Stack
- **React 18** with TypeScript
- **Redux Toolkit** for state management
- **React Router** for navigation
- **Tailwind CSS** for styling
- **Vite** as build tool
- **Framer Motion** for animations
- **React Hook Form** + **Zod** for forms

### Backend Stack
- **Node.js** with TypeScript
- **Express.js** framework
- **MongoDB** with Mongoose ODM
- **Google Gemini Pro** AI integration
- **Multer** for file uploads
- **PDF/DOCX** parsing capabilities

## 🎨 Design System

### Color Palette
- **Primary Orange**: `#f97316` (primary-500)
- **White**: `#ffffff` (backgrounds, cards)
- **Black/Neutral**: `#171717` to `#fafafa` (text, borders)

### Typography
- **Font**: Inter (Google Fonts)
- **Weights**: 300, 400, 500, 600, 700

### Components
- Consistent button styles (`btn-primary`, `btn-secondary`)
- Input field styling (`input-field`)
- Card layouts (`card`)
- Responsive containers (`container-max`, `section-padding`)

## 📱 User Experience

### Landing Page
- Hero section with clear value proposition
- Feature highlights with icons
- How-it-works section
- Statistics and social proof
- Clean navigation and CTA buttons

### Authentication
- Modern login/register forms
- Form validation with error handling
- Password visibility toggle
- Smooth transitions

### Dashboard
- Statistics overview
- Quick actions for resume upload and interview creation
- Recent interviews list
- Progress tracking

### Interview Experience
- Real-time progress tracking
- Question-by-question flow
- Answer submission with feedback
- Interview session management

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- MongoDB instance
- Google Gemini API key

### Backend Setup
1. Navigate to server directory:
   ```bash
   cd server
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create `.env` file:
   ```env
   PORT=5000
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret
   GEMINI_API_KEY=your_gemini_api_key
   ```

4. Start the server:
   ```bash
   npm run dev
   ```

### Frontend Setup
1. Navigate to client directory:
   ```bash
   cd client
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create `.env` file:
   ```env
   VITE_API_URL=http://localhost:5000/api
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

### Access the Application
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000/api

## 📊 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login

### Candidates
- `POST /api/candidates/upload-resume` - Upload and parse resume
- `GET /api/candidates` - Get all candidates
- `GET /api/candidates/:id` - Get candidate by ID

### Interviews
- `POST /api/interviews` - Create new interview
- `GET /api/interviews` - Get all interviews
- `GET /api/interviews/:id` - Get interview by ID
- `POST /api/interviews/:id/answer` - Submit answer

## 🎯 Key Differentiators

### 1. Reliable Resume Extraction
- **AI + Fallback**: Primary AI extraction with regex fallback
- **Confidence Scoring**: 0-100% confidence ratings
- **Source Tracking**: Tracks extraction method used

### 2. Transparent AI Scoring
- **Explainable AI**: Detailed reasoning for each score
- **4-Dimensional Analysis**: Technical accuracy, clarity, completeness, depth
- **Actionable Feedback**: Specific improvement suggestions

### 3. Robust File Validation
- **Security First**: MIME type validation, file sanitization
- **Size Limits**: Configurable upload limits
- **Format Support**: PDF, DOC, DOCX with proper parsing

### 4. Production-Ready Quality
- **TypeScript**: Full type safety across the stack
- **Error Handling**: Comprehensive error management
- **Validation**: Input validation at all levels
- **Security**: Helmet, CORS, rate limiting

## 🔧 Development

### Code Quality
- ESLint configuration for consistent code style
- TypeScript for type safety
- Modular architecture with clear separation of concerns
- Error boundaries and proper error handling

### Performance
- Lazy loading of components
- Optimized bundle sizes
- Efficient state management
- Responsive images and assets

### Security
- JWT authentication
- File upload validation
- CORS configuration
- Rate limiting
- Input sanitization

## 📈 Future Enhancements

### Planned Features
- **Video Interviews**: Webcam integration for practice
- **Interview Analytics**: Detailed performance analytics
- **Company-Specific Questions**: Questions tailored to specific companies
- **Mock Interview Scheduling**: Calendar integration
- **Progress Tracking**: Long-term improvement tracking

### Technical Improvements
- **Testing Suite**: Comprehensive unit and integration tests
- **Docker Configuration**: Containerized deployment
- **CI/CD Pipeline**: Automated testing and deployment
- **API Documentation**: Swagger/OpenAPI documentation

## 📄 License

This project is built for educational and portfolio purposes.

## 👥 Contact

For questions or collaboration opportunities, please reach out through the project repository.
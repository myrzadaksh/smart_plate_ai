# 🥗 SmartPlate AI - Fullstack Recipe Generator

https://frontend-f4tx.onrender.com

A smart recipe generator powered by Artificial Intelligence (Google Gemini API) that helps users plan meals based on the ingredients available in their pantry.

## 🛠 Tech Stack

### Frontend
- **React 18** (TypeScript)
- **Vite** (Build Tool)
- **Tailwind CSS** (Styling)
- **Lucide React** (Icon Pack)
- **Axios** (API Requests)

### Backend
- **Node.js & Express**
- **TypeScript**
- **Sequelize ORM** (PostgreSQL)
- **Google Generative AI** (Gemini API Integration)

## 🚀 Key Features
- **Pantry Inventory**: Track your ingredients with expiration date monitoring.
- **AI Recipe Generation**: Create custom recipes based on specific ingredients and dietary preferences.
- **Meal Planner**: Organize and schedule your meals for the entire week.
- **Smart Shopping List**: Automatically generate a list of missing ingredients for your planned meals.
- **Authentication**: Secure user accounts with JWT-based sessions.

## 📦 Getting Started

### 1. Clone the Repository
```bash
git clone [https://github.com/myrzadaksh/smart_plate_ai.git](https://github.com/myrzadaksh/smart_plate_ai.git)
cd smart_plate_ai
```
### 2. Install Dependencies
```bash
cd backend
npm install
```

For frontend

```bash
cd ../frontend/smart_plate_ai
npm install
```

### 3. Environment Variables (.env)
Create a .env file in both the /backend and /frontend/smart_plate_ai folders.

Backend: Add your DATABASE_URL, JWT_SECRET, and GEMINI_API_KEY.

Frontend: Add VITE_API_URL=http://localhost:8000/api.

### 4. Run the Project (Development Mode)

```bash
cd backend
npm run dev
```

Start frontend
```bash
cd frontend/smart_plate_ai
npm run dev
```

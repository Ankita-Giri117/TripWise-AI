# TripWise-AI — Smart Full-Stack AI Travel Planner

TripWise-AI is a full-stack AI-powered travel planning application built with React (Vite, Tailwind CSS, Lucide React) on the frontend and Java Spring Boot 3 with PostgreSQL and OpenRouter AI on the backend.

---

## 🚀 Production Deployment Guide

### 1. Frontend Deployment (e.g. Vercel, Netlify)

#### Build Command
```bash
npm run build
```
#### Output Directory
`dist`

#### Environment Variables (Public)
| Variable Name | Type | Description | Example |
| --- | --- | --- | --- |
| `VITE_API_BASE_URL` | Public | Deployed Spring Boot backend API URL. If using local proxy, leave unset. | `https://api.yourdomain.com/api` |

> ⚠️ **IMPORTANT**: Never put backend secrets (JWT secrets, DB credentials, AI API keys) in frontend environment variables. `VITE_` variables are visible in client-side JavaScript bundles.

---

### 2. Backend Deployment (e.g. Render, Railway, AWS, Heroku)

#### Build Command
```bash
./mvnw clean package -DskipTests
```
#### Output Artifact
`target/backend-0.0.1-SNAPSHOT.jar`

#### Execution Command
```bash
java -jar target/backend-0.0.1-SNAPSHOT.jar
```

#### Environment Variables

| Variable Name | Classification | Description | Example Placeholder |
| --- | --- | --- | --- |
| `PORT` | Public | Port on which the Spring Boot server listens (assigned automatically by cloud platforms) | `8080` |
| `SPRING_PROFILES_ACTIVE` | Public | Active Spring profile for deployment | `prod` |
| `TRIPWISE_DB_URL` | **SECRET** | PostgreSQL JDBC connection URL | `jdbc:postgresql://your-db-host:5432/your_db` |
| `TRIPWISE_DB_USERNAME` | **SECRET** | PostgreSQL database username | `db_user` |
| `TRIPWISE_DB_PASSWORD` | **SECRET** | PostgreSQL database password | `your_secure_db_password` |
| `TRIPWISE_JWT_SECRET` | **SECRET** | Base64-encoded secret key for signing JWT tokens (min 256-bit) | `your_base64_encoded_jwt_secret` |
| `TRIPWISE_OPENROUTER_API_KEY` | **SECRET** | OpenRouter API Key for AI Itinerary & Assistant features | `sk-or-v1-your_openrouter_api_key` |
| `TRIPWISE_AI_MODEL` | Public | AI Model identifier on OpenRouter | `openrouter/free` |
| `TRIPWISE_ALLOWED_ORIGINS` | Public | Comma-separated list of allowed frontend domain URLs for CORS | `https://your-app.vercel.app` |

---

## 💻 Local Development Setup

1. **Backend**:
   - Copy `backend/application.properties.example` to `backend/src/main/resources/application-local.properties`.
   - Fill in your local PostgreSQL credentials, JWT secret, and OpenRouter API key.
   - Run: `.\mvnw.cmd spring-boot:run`

2. **Frontend**:
   - Copy `frontend/.env.example` to `frontend/.env.local`.
   - Run: `npm run dev`

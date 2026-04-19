# 🚀 FinTrack Deployment Guide (Docker + Vercel)

Follow this guide to deploy your full-stack application for **$0/month**.

---

## 🏗️ Project Architecture
- **Backend:** Java Spring Boot (**Docker**) -> **Render.com**
- **Frontend:** React (Vite) -> **Vercel**
- **Database:** MongoDB (Atlas) -> **MongoDB Cloud**

---

## 1. Database: MongoDB Atlas
1. Sign up at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas/register).
2. Create a **Free Shared Cluster** (M0).
3. **Network Access:** Add `0.0.0.0/0`.
4. **Connection String:** Copy the Java driver URI.
   - Example: `mongodb+srv://<user>:<password>@cluster.xxxx.mongodb.net/fintrack?retryWrites=true&w=majority`

---

## 2. Backend: Render.com (Docker)
1. Sign up at [Render.com](https://render.com).
2. Click **New** -> **Web Service** and connect your repo.
3. **Configuration Settings:**
   - **Runtime:** `Docker`
   - **Docker Context:** `backend` (Crucial!)
   - **Docker Command:** Leave empty.
4. **Environment Variables:**
   | Key | Value |
   | :--- | :--- |
   | `MONGODB_URI` | *Your MongoDB Atlas URI* |
   | `GEMINI_API_KEY` | *Your Google AI API Key* |
   | `APP_CORS_ORIGIN` | `https://your-frontend.vercel.app` |
   | `SERVER_PORT` | `10000` |

---

## 3. Frontend: Vercel
1. Sign up at [Vercel.com](https://vercel.com).
2. **Configuration Settings:**
   - **Root Directory:** `frontend`
   - **Framework Preset:** `Vite`
3. **Environment Variables:**
   | Key | Value |
   | :--- | :--- |
   | `VITE_API_BASE_URL` | `https://your-backend.onrender.com` |
   | `VITE_USER_ID` | `demo-user` |

---

## 🛠️ ChatGPT Instructions
> "I want to deploy a full-stack project. I have a Java Spring Boot backend in a `/backend` folder with a Dockerfile, and a React/Vite frontend in a `/frontend` folder. 
>
> **Please guide me through:**
> 1. Setting up MongoDB Atlas.
> 2. Deploying the backend to Render.com using **Docker runtime** (Context: `backend`).
> 3. Deploying the frontend to Vercel.
> 4. Setting up the environment variables (MONGODB_URI, GEMINI_API_KEY, VITE_API_BASE_URL, etc.)."

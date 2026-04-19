# 🚀 FinTrack Native Deployment Guide (Non-Docker)

Follow this guide to deploy your full-stack application using native runtimes for **$0/month**. This guide is optimized to be shared with ChatGPT for step-by-step assistance.

---

## 🏗️ Project Architecture
- **Backend:** Java Spring Boot (Native Maven Runtime) -> **Render.com**
- **Frontend:** React (Vite) -> **Vercel**
- **Database:** MongoDB (Atlas) -> **MongoDB Cloud**

---

## 1. Database: MongoDB Atlas
1. Sign up at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas/register).
2. Create a **Free Shared Cluster** (M0).
3. **Network Access:** Add `0.0.0.0/0` (Allows Render to connect).
4. **Database Access:** Create a user/password.
5. **Connection String:** Click **Connect** -> **Drivers** -> **Java**. Copy the URI.
   - Example: `mongodb+srv://<user>:<password>@cluster.xxxx.mongodb.net/fintrack?retryWrites=true&w=majority`
   - *Keep this ready for Step 2.*

---

## 2. Backend: Render.com (Native Java)
1. Sign up at [Render.com](https://render.com).
2. Click **New** -> **Web Service** and connect your GitHub repo.
3. **Configuration Settings:**
   - **Runtime:** `Java`
   - **Root Directory:** `backend`
   - **Build Command:** `./mvnw clean package -DskipTests`
   - **Start Command:** `java -jar target/*.jar`
4. **Environment Variables (Advanced -> Add Environment Variable):**
   | Key | Value |
   | :--- | :--- |
   | `MONGODB_URI` | *Your MongoDB Atlas URI* |
   | `GEMINI_API_KEY` | *Your Google AI API Key* |
   | `APP_CORS_ORIGIN` | `https://your-frontend.vercel.app` (Update after Vercel deploy) |
   | `SERVER_PORT` | `10000` |

---

## 3. Frontend: Vercel
1. Sign up at [Vercel.com](https://vercel.com).
2. Click **Add New** -> **Project** and import your repo.
3. **Configuration Settings:**
   - **Root Directory:** `frontend`
   - **Framework Preset:** `Vite` (Detected automatically)
4. **Environment Variables:**
   | Key | Value |
   | :--- | :--- |
   | `VITE_API_BASE_URL` | `https://your-backend.onrender.com` (Get from Render dashboard) |
   | `VITE_USER_ID` | `demo-user` |

---

## 🛠️ ChatGPT Instructions
*Copy and paste the text below to ChatGPT for help:*

> "I want to deploy a full-stack project. I have a Java Spring Boot backend in a `/backend` folder and a React/Vite frontend in a `/frontend` folder. I want to deploy the backend to Render.com (using native Java runtime, not Docker) and the frontend to Vercel. I have a MongoDB Atlas cluster for the database.
>
> **Here are the requirements:**
> 1. Backend build command: `./mvnw clean package -DskipTests`
> 2. Backend start command: `java -jar target/*.jar`
> 3. I need to set `MONGODB_URI`, `GEMINI_API_KEY`, `APP_CORS_ORIGIN`, and `SERVER_PORT` on Render.
> 4. I need to set `VITE_API_BASE_URL` and `VITE_USER_ID` on Vercel.
>
> Please walk me through each step, starting with MongoDB Atlas connection string setup."

---

## ⚠️ Important Troubleshooting
- **CORS Errors:** If your frontend can't talk to the backend, ensure `APP_CORS_ORIGIN` on Render exactly matches your Vercel URL (e.g., `https://my-app.vercel.app` with NO trailing slash).
- **Cold Starts:** Render's free tier sleeps after 15 mins. The first load will take ~30 seconds.
- **Root Directory:** Ensure you set the "Root Directory" correctly in both Render and Vercel, or the build will fail.

# 🚀 IT Performance Evaluation System

A comprehensive performance evaluation system designed for IT departments. This application allows for the management and assessment of employee performance through a modern web interface backed by a robust API.

## 🏗️ Architecture

The project is split into two main components:

- **Backend (API)**: Built with .NET 8, utilizing Entity Framework Core for data access and SQL Server as the database.
- **Frontend (Web)**: A modern, responsive web application built with React 19 and Vite.

## 🛠️ Technologies Used

### Backend (.NET API)
- **Framework**: .NET 8 (ASP.NET Core Web API)
- **Database**: SQL Server
- **ORM**: Entity Framework Core
- **Authentication**: JWT (JSON Web Tokens)
- **Documentation**: Swagger UI

### Frontend (React Web)
- **Framework**: React 19
- **Build Tool**: Vite
- **Styling**: CSS Modules / Modern CSS
- **HTTP Client**: Axios
- **Charts**: Recharts
- **Notifications**: React Hot Toast

## ⚙️ Prerequisites

Before you begin, ensure you have met the following requirements:
- **.NET SDK 8.0** or later installed.
- **Node.js** (v18 or later recommended) installed.
- **SQL Server** (LocalDB, Express, or Developer edition) installed and running.

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/kayrabacak/Performance-Evaluation-System.git
cd Performance-Evaluation-System
```

### 2. Backend Setup (ITPerformance.API)

Navigate to the API directory:
```bash
cd ITPerformance.API
```

**Configuration:**
Update the `appsettings.json` file with your database connection string and JWT secret key if necessary.
*(Note: Sensitive configuration should be in `appsettings.Development.json` or User Secrets for local development)*.

**Run Migrations & Update Database:**
```bash
dotnet ef database update
```

**Start the API:**
```bash
dotnet run
```
The API will start (usually on `http://localhost:5296` or similar). You can access the Swagger UI at `/swagger` to test endpoints.

### 3. Frontend Setup (ITPerformance.Web)

Open a new terminal and navigate to the Web directory:
```bash
cd ITPerformance.Web
```

**Install Dependencies:**
```bash
npm install
```

**Start the Development Server:**
```bash
npm run dev
```
The application will launch in your browser (usually at `http://localhost:5173`).

## 🔐 Security Note

This repository is configured to exclude sensitive files like `.env` and local user settings. 
- **Frontend**: Create a `.env` file in `ITPerformance.Web` if your logic requires environment variables (e.g., `VITE_API_BASE_URL=http://localhost:5296`).
- **Backend**: Ensure your `appsettings.json` or `User Secrets` are correctly configured for your local SQL Server instance.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

# AI-Powered Garbage Detection and Reporting System

## Overview

This project is an AI-powered garbage detection and reporting system that allows users to report waste accumulation using a mobile app. It combines a YOLO-based object detection model, a FastAPI backend, and a React Native + Expo client with typed navigation, report history, and annotated result views.

## Research Objective

This project investigates the use of YOLO-based object detection for automated garbage identification and reporting in urban environments. The long-term objective is to evaluate model performance, improve detection accuracy through experimentation, and document findings in a research-oriented setting.

## Current MVP Scope

This project implements the citizen reporting and AI-based waste detection core of a larger Smart Solid Waste Management System.

**Implemented:**

- Citizen mobile application with image capture, location tagging, and report review
- Geotagged complaint reporting
- YOLO-based garbage detection with bounding boxes
- FastAPI backend with report management
- PostgreSQL persistence
- Annotated original and detection image views in the app

**Planned Enhancements:**

- Municipal dashboard for complaint tracking
- Vehicle routing and tracking
- Route optimization algorithms
- Automated alerts and enforcement notifications
- Advanced analytics and monitoring
- Multi-role authentication and authorization
- Real-time status update workflow
- Cloud deployment infrastructure
- Push notifications for users
- Geospatial visualization and mapping
- Multi-class waste type classification

## Main Components

- Mobile app: React Native + Expo
- Backend API: FastAPI + PostgreSQL
- ML pipeline: YOLO training and inference
- Uploaded images and annotated outputs served from the backend

## Dataset

The training dataset comes from Roboflow and is not meant to be committed to this repository. Download it separately from:

https://universe.roboflow.com/garbage-detection-czeg5/garbage_detection-wvzwv

If you want to train or retrain the model locally, place the downloaded dataset in the `dataset/` folder after cloning the repo.

## Features

### Mobile App

- Capture or upload images
- Capture GPS location
- Analyze images on upload
- View submitted reports
- View report details
- View original and annotated images
- Pull-to-refresh support
- Status tracking

### Backend

- REST API with FastAPI
- PostgreSQL integration
- YOLO model inference
- Image storage and serving
- Report management endpoints
- Static file serving for uploads

### Machine Learning

- YOLO-based garbage detection
- Bounding box generation
- Confidence scoring
- Custom trained model support

## Project Structure

```text
garbage-detection/
|-- app/
|   |-- src/
|   |   |-- screens/
|   |   |-- navigation/
|   |   |-- services/
|   |   |-- types/
|   |   |-- config/
|   |   |-- components/
|   |   `-- constants/
|   |-- App.tsx
|   |-- package.json
|   `-- app.json
|
|-- server/
|   |-- routers/
|   |-- services/
|   |-- schemas/
|   |-- models/
|   |-- app.py
|   |-- config.py
|   |-- database.py
|   `-- requirements.txt
|
|-- ml_training/
|-- ml_models/
|-- uploads/
|   |-- original/
|   `-- annotated/
|-- runs/
|-- weights/
|-- .gitignore
`-- README.md
```

## Technology Stack

### Frontend

- React Native
- Expo
- React Navigation
- Axios
- Expo Image Picker
- Expo Location

### Backend

- FastAPI
- SQLAlchemy
- PostgreSQL
- Uvicorn

### Machine Learning

- YOLO
- PyTorch
- OpenCV

## Prerequisites

Install the following:

- Python 3.11+
- PostgreSQL
- Node.js LTS
- npm
- Expo Go for Android or iOS

Recommended before starting:

- A trained YOLO model saved as `ml_models/best.pt`
- A local PostgreSQL database created for the project

## Backend Setup

### 1. Go to the server folder

```bash
cd server
```

### 2. Create a virtual environment

```bash
python -m venv .venv
```

Activate it:

Windows:

```bash
.venv\Scripts\activate
```

Linux or macOS:

```bash
source .venv/bin/activate
```

### 3. Install dependencies

```bash
pip install -r requirements.txt
```

### 4. Configure environment variables

Create a `.env` file in the repository root, not inside `server`.

Example:

```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=garbage_detection
DB_USER=postgres
DB_PASSWORD=your_password
```

### 5. Create the database

```sql
CREATE DATABASE garbage_detection;
```

Important:

- The backend code currently does not auto-create tables.
- Make sure the `reports` table is created before starting the app, either with a migration or a manual SQL script.

### 6. Add the trained model

Place the trained YOLO model in:

```text
ml_models/
```

Expected file:

```text
ml_models/best.pt
```

### 7. Start the backend

From the `server` directory:

```bash
uvicorn app:app --reload
```

Backend URL:

```text
http://127.0.0.1:8000
```

Swagger docs:

```text
http://127.0.0.1:8000/docs
```

Health check:

```http
GET /health
```

## Mobile App Setup

### 1. Go to the app folder

```bash
cd app
```

### 2. Install dependencies

```bash
npm install
```

### 3. Backend URL configuration

The app now generates its API URL automatically when you start Expo.

Use one of these commands from the `app` folder:

```bash
npm start
```

or

```bash
npm run android
```

or

```bash
npm run ios
```

or

```bash
npm run web
```

The generated URL is written to `app/src/config/generatedApi.ts` and is ignored by git.

If you move between networks or devices, rerun Expo so the generated URL is refreshed.

### 4. Start Expo

```bash
npx expo start
```

Scan the QR code using Expo Go.

Make sure:

- Phone and PC are on the same Wi-Fi network
- Backend is running
- If the app is already open, reload it after restarting Expo so the generated API URL is refreshed

## API Endpoints

### Detect Garbage

```http
POST /detect
```

Detect garbage in an uploaded image using the YOLO model.

**Request:**

- `file` (multipart/form-data): Image file to analyze
- `latitude` (float): GPS latitude coordinate
- `longitude` (float): GPS longitude coordinate

**Response:** Detection results with bounding boxes and confidence scores

### Get All Reports

```http
GET /reports
```

Retrieve all submitted garbage reports.

### Get Report Details

```http
GET /reports/{report_id}
```

Fetch detailed information about a specific report including detection results and images.

### Update Report Status

```http
PATCH /reports/{report_id}/status
```

Update the status of a report (e.g., pending, resolved, in-progress).

## Reporting Workflow

The typical user flow for reporting garbage:

```
User
  ├─> Select/capture image
  ├─> Capture GPS location
  ├─> Submit report to backend
  │    ├─> YOLO model analyzes image
  │    ├─> Generates bounding boxes and confidence scores
  │    └─> Stores annotated result
  └─> Browse all reports
      └─> View detection details with annotations
```

## Development Notes

**Repository Notes:**

- Empty directories are marked with `.gitkeep` files, allowing contributors to clone and begin working immediately without initialization scripts.
- Git ignores large artifacts including model files, training outputs, dataset folders, evaluation outputs, and upload directories.

**Setup Tips:**

- Use a `.env` file for local configuration; never commit secrets.
- Ensure PostgreSQL is running before starting the backend.
- Test the mobile app on a physical device or emulator on the same network as the backend server.
- Place any trained model artifacts at `ml_models/best.pt`.
- Place any project-specific run outputs in `runs/` or `weights/` only if they are meant to stay local.
- The trained model is not shipped with the repo, so someone on the team must provide `ml_models/best.pt` before inference will work.

**Development Notes:**

- Run `npm run typecheck` from the `app` folder to validate the Expo client.
- Run `uvicorn app:app --reload` from the `server` folder to start the API.
- The mobile app uses typed navigation, shared status types, and safe URL joining for report images.

## License

This project is intended for academic and research purposes.

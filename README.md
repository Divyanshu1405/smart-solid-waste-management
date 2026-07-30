# AI-Powered Garbage Detection and Reporting System

## Project Summary

This repository contains a citizen reporting app for waste detection, plus the ML and backend pieces that support it.

The key shift in the current setup is that the mobile app now talks to a deployed municipal dashboard instead of a local FastAPI server during normal usage. That dashboard owns the backend workflow for authentication, persistence, image storage, and ML inference.

## Live Dashboard

- Dashboard: [https://waste-detection-nexty.vercel.app](https://waste-detection-nexty.vercel.app)
- API base URL used by the app: `https://waste-detection-nexty.vercel.app`

## Separation of Concerns

### Mobile App

The `app/` folder is the citizen-facing client.

It is responsible for:

- Signing users in and handling email verification
- Capturing or uploading waste photos
- Collecting GPS location with each report
- Sending reports to the deployed dashboard backend
- Showing report history, status, and detail views
- Presenting clean, citizen-friendly UI copy

### Deployed Dashboard / Backend

The live dashboard is the system of record for reports.

It is responsible for:

- Accepting report submissions from the mobile app
- Running the detection and storage workflow
- Persisting report data and images
- Returning report history and report details
- Serving the citizen-specific report feed

### Local Server Code

The `server/` folder remains in this repo as the FastAPI implementation used for local development, experimentation, and reference.

It is useful when you want to inspect backend behavior, adapt endpoints, or run the API locally against PostgreSQL and a trained model.

### ML Assets

The `ml_training/`, `ml_models/`, `runs/`, `weights/`, and `uploads/` folders support the detection workflow.

They contain or reference:

- YOLO training and evaluation artifacts
- The trained model used for inference
- Annotated image outputs
- Upload directories for original and processed images

## How the App Works

1. The citizen signs in to the mobile app.
2. The user captures or selects a photo of waste.
3. The app attaches location data and submits the report.
4. The deployed dashboard processes the image and stores the result.
5. The app fetches and displays the citizen's report history and status updates.

## Features

### Mobile Experience

- Sign in and email verification
- Image capture and gallery upload
- Automatic GPS tagging
- Report submission to the live dashboard backend
- Report list, detail view, and detection confidence display
- Pull-to-refresh support
- Short, cleaner citizen-facing copy

### Backend Workflow

- Deployed API for report creation and retrieval
- Report status tracking
- Image storage and serving
- ML inference and result persistence
- Citizen-scoped report access

### Machine Learning

- YOLO-based garbage detection
- Bounding box generation
- Confidence scoring
- Custom model support

## Repository Layout

```text
garbage-detection/
|-- app/                    # React Native + Expo client
|-- server/                 # FastAPI backend source for local/reference use
|-- ml_training/            # Training scripts and experiments
|-- ml_models/              # Saved model artifacts
|-- uploads/                # Original and annotated image outputs
|-- runs/                   # Training/inference run outputs
|-- weights/                # Additional model weights
`-- README.md
```

## Mobile App Setup

### 1. Install dependencies

```bash
cd app
npm install
```

### 2. Start Expo

```bash
npm start
```

Or run a platform directly:

```bash
npm run android
npm run ios
npm run web
```

### 3. Backend configuration

The app is already configured to talk to the deployed dashboard.

If you need to inspect or change the API base URL, see:

- `app/src/config/api.ts`

## Optional Local Backend Setup

If you want to run the FastAPI backend locally, you will need:

- Python 3.11+
- PostgreSQL
- A trained YOLO model in `ml_models/best.pt`
- A local `.env` file with database credentials

This local backend is not required for the normal app flow against the live dashboard.

## Dataset

The training dataset comes from Roboflow and is not meant to be committed to this repository. Download it separately from:

https://universe.roboflow.com/garbage-detection-czeg5/garbage_detection-wvzwv

If you want to train or retrain the model locally, place the downloaded dataset in the `dataset/` folder after cloning the repo.

## Technology Stack

### Client

- React Native
- Expo
- React Navigation
- Axios
- Expo Image Picker
- Expo Location

### Local Backend

- FastAPI
- PostgreSQL
- Uvicorn

### Machine Learning

- YOLO
- PyTorch
- OpenCV

## Development Notes

- Run `npm run typecheck` from the `app` folder to validate the Expo client.
- The deployed backend base URL is defined in `app/src/config/api.ts`.
- The mobile app uses typed navigation, shared status types, and safe URL joining for report images.
- If the live backend URL changes, update `app/src/config/api.ts` and the Live Dashboard section above.

## License

This project is intended for academic and research purposes.

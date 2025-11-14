# Fuel EU Maritime Compliance Platform

## Overview
The Fuel EU Maritime Compliance Platform is designed to facilitate compliance with the Fuel EU Maritime Regulation (EU) 2023/1805. This platform consists of a frontend dashboard built with React, TypeScript, and TailwindCSS, and a backend API developed using Node.js, TypeScript, and PostgreSQL. The application provides functionalities for managing routes, compliance balance, banking, and pooling.

## Architecture Summary
The project follows a hexagonal architecture (Ports & Adapters / Clean Architecture) to ensure a clear separation of concerns. The core of the application contains domain entities, application logic, and ports, while the adapters handle the user interface and infrastructure interactions.

### Frontend Structure
- **Core**: Contains domain entities, application use cases, and ports.
- **Adapters**: 
  - **UI**: React components and hooks implementing inbound ports.
  - **Infrastructure**: API clients implementing outbound ports.
- **Shared**: Contains shared constants and utility functions.

### Backend Structure
- **Core**: Contains domain models, application use cases, and ports for repositories.
- **Adapters**: 
  - **Inbound**: HTTP routes for managing requests.
  - **Outbound**: Implementations for interacting with PostgreSQL.
- **Infrastructure**: Database client and server setup.

## Setup & Run Instructions

### Frontend
1. Navigate to the `frontend` directory.
2. Install dependencies:
   ```
   npm install
   ```
3. Start the development server:
   ```
   npm run dev
   ```

### Backend
1. Navigate to the `backend` directory.
2. Install dependencies:
   ```
   npm install
   ```
3. Set up the database by running migrations and seeding data.
4. Start the backend server:
   ```
   npm run dev
   ```

## How to Execute Tests

- For the backend, run:
  ```
  npm test
  ```

## Screenshots or Sample Requests/Responses

- **Routes Tab**: Displays a table of routes with options to filter and set baselines.
- **Compare Tab**: Shows a comparison of baseline vs. other routes with visual charts.
- **Banking Tab**: Manages compliance balance banking operations.
- **Pooling Tab**: Handles pooling of ships and compliance balance adjustments.

<img width="1691" height="770" alt="image" src="https://github.com/user-attachments/assets/8b213e07-500e-41c4-aee9-4ea4449de7ec" />
****************************************************************************************************************************************
<img width="1635" height="686" alt="image" src="https://github.com/user-attachments/assets/38985383-7c7c-4d76-9d2e-a9ff92c3388b" />
****************************************************************************************************************************************
<img width="1186" height="837" alt="image" src="https://github.com/user-attachments/assets/bf91e324-dfe1-44aa-9d2c-b59fb569de80" />





# Name and Address Database

A full-stack application with a Flask backend and a React (Vite) frontend.

## Features

- **Dual Database Storage**: Stores data in **MongoDB** (Atlas) and **Neo4j** (Graph).
- **Graph Search**: Finds neighbors/family members living at the same address using Neo4j graph relationships.
- **Frontend**: Built with React, Tailwind CSS, and Framer Motion for a premium UI.

## Project Structure

- `backend/`: Flask API (Port 8080).
- `frontend/`: React application (Vite default port).
- `start.sh`: **Recommended** startup script (handles virtualenv and concurrent execution).

## Prerequisites

1.  **Python 3.x** and `venv` module.
2.  **Node.js** and `npm`.
3.  **MongoDB Atlas** Cluster (Connection string in `backend/.env`).
4.  **Neo4j** Instance (Connection credentials in `backend/.env`).

## Getting Started

1.  **Setup Environment**:
    Ensure you have `backend/.env` with:

    ```env
    MONGO_URI=your_mongodb_uri
    NEO4J_URI=bolt://localhost:7687
    NEO4J_USER=neo4j
    NEO4J_PASSWORD=your_password
    ```

2.  **Run the Application**:
    The easiest way to start is using the provided script from the root directory:
    ```bash
    ./start.sh
    ```
    This script will:
    - Activate the Python virtual environment.
    - Start the Flask backend on port **8080**.
    - Start the React frontend.

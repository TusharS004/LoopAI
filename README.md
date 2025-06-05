# LoopAI

# Data Ingestion API

## Overview

This API provides a system for ingesting batches of data IDs with prioritized processing. It accepts ingestion requests with a list of IDs and a priority level, splits them into batches, processes them asynchronously while respecting rate limits and priorities, and allows querying ingestion status.

---

## Design Choices

### 1. Priority-Based Queue Management

- Incoming ingestion requests are queued based on priority levels (`HIGH`, `MEDIUM`, `LOW`).
- Higher priority batches jump ahead in the processing queue to ensure urgent tasks are handled first.
- This design ensures fairness and responsiveness under load.

### 2. Batch Splitting

- Each ingestion request’s list of IDs is split into batches of size 3.
- This simulates chunked processing, which improves scalability and error isolation.

### 3. Asynchronous Batch Processing

- Batches are processed asynchronously with a fixed delay (e.g., 5 seconds per batch).
- This imitates real-world processing delays and rate limiting.
- The processing status (`yet_to_start`, `triggered`, `completed`) is updated per batch.

### 4. Status Tracking

- Each ingestion request and its batches have unique IDs.
- Status endpoints provide real-time insights into ingestion and batch processing states.
- Useful for monitoring and debugging.

### 5. In-Memory Storage

- For simplicity, data is stored in-memory using JavaScript objects.
- Suitable for prototyping and small-scale use.
- For production, persistent storage (e.g., a database) should replace this.

### 6. Express Framework & REST API

- Uses Express for HTTP request handling.
- Clear RESTful endpoints for ingestion (`POST /ingest`) and status (`GET /status/:id`).
- Easy to extend with authentication, logging, or additional features.

### 7. Testing

- Tests written with Jest and Supertest validate endpoint functionality.
- Tests cover ingestion, status retrieval, priority handling, and batch processing order.
- Enables confidence in system correctness and future changes.

---

## How to Use

1.  **POST /ingest** with JSON payload:

    ```json
    {
      "ids": [1, 2, 3, 4, 5],
      "priority": "MEDIUM"
    }
    ```

2.  **\*GET /status** with unique-id:

    ```json
    {
      "ingestion_id": "<unique-id>"
    }
    ```

3.   ```json
    {
        "ingestion_id": "<unique-id>",
        "status": "completed",
        "batches": [
            {
                "batch_id": "<batch-id>",
                "ids": [1, 2, 3],
                "status": "completed"
            }
        ]
    }```

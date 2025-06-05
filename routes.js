import express from 'express';
import { enqueueRequest } from './queueManager.js';
import { createIngestion, getIngestionStatus } from './ingestionStore.js';
import { v4 as uuidv4 } from 'uuid';

const router = express.Router();

const VALID_PRIORITIES = ['HIGH', 'MEDIUM', 'LOW'];

router.post('/ingest', (req, res) => {
  const { ids, priority } = req.body;

  if (!ids || !Array.isArray(ids) || ids.length === 0) {
    return res.status(400).json({ error: "ids array is required" });
  }

  if (!priority || !VALID_PRIORITIES.includes(priority)) {
    return res.status(400).json({ error: "priority must be one of HIGH, MEDIUM, LOW" });
  }

  const ingestionId = uuidv4();

  const batches = [];
  for (let i = 0; i < ids.length; i += 3) {
    const batchIds = ids.slice(i, i + 3);
    batches.push({
      batch_id: uuidv4(),
      ids: batchIds,
      priority,
      createdAt: Date.now(),
    });
  }

  createIngestion(ingestionId, batches);

  batches.forEach(batch => {
    enqueueRequest({
      ingestionId,
      batchId: batch.batch_id,
      ids: batch.ids,
      priority: batch.priority,
      createdAt: batch.createdAt,
    });
  });

  res.json({ ingestion_id: ingestionId });
});

router.get('/status/:id', (req, res) => {
  const ingestion = getIngestionStatus(req.params.id);
  if (!ingestion) {
    return res.status(404).json({ error: 'Ingestion ID not found' });
  }

  res.json({
    ingestion_id: req.params.id,
    status: ingestion.status,
    batches: ingestion.batches.map(batch => ({
      batch_id: batch.batch_id,
      ids: batch.ids,
      status: batch.status,
    })),
  });
});

export default router;

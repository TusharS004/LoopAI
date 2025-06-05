import express from "express";
const router = express.Router();
import {enqueueRequest, getStatus} from './queueManager.js'; // Import your service functions


router.post('/ingest', async (req, res) => {
    try {
        const { ids, priority } = req.body;
        if (!Array.isArray(ids) || !['HIGH', 'MEDIUM', 'LOW'].includes(priority)) {
            return res.status(400).json({ error: 'Invalid input' });
        }

        const ingestionId = await enqueueRequest(ids, priority);
        res.json({ ingestion_id: ingestionId });
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
});

router.get('/status/:id', (req, res) => {
    const status = getStatus(req.params.id);
    if (!status) return res.status(404).json({ error: 'Ingestion ID not found' });
    res.json(status);
});

export default router;

// 7101ea01-57e5-49cd-baf4-f59fa41d43a5
// 1bb5fc62-9d9d-4526-b84b-73fe57b66c05
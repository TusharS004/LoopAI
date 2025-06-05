import { v4 as uuidv4 } from 'uuid';
import { createIngestion, updateBatchStatus, getIngestionStatus } from './ingestionStore.js';
import { batchIds } from './utils.js';

const jobQueue = [];
const PRIORITY_ORDER = { HIGH: 1, MEDIUM: 2, LOW: 3 };

export async function enqueueRequest(ids, priority) {
    const ingestionId = uuidv4();
    const batches = batchIds(ids);

    createIngestion(ingestionId, batches);

    const timestamp = Date.now();

    for (const batch of batches) {
        jobQueue.push({
            priority,
            timestamp,
            ingestionId,
            batch
        });
    }

    return ingestionId;
}

export function getStatus(ingestionId) {
    return getIngestionStatus(ingestionId);
}

export function sortQueue() {
    jobQueue.sort((a, b) => {
        if (PRIORITY_ORDER[a.priority] !== PRIORITY_ORDER[b.priority]) {
            return PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority];
        }
        return a.timestamp - b.timestamp;
    });
}

export function startWorker() {
    setInterval(async () => {
        if (jobQueue.length === 0) return;

        sortQueue();

        const jobs = jobQueue.splice(0, 1);
        const { ingestionId, batch } = jobs[0];

        updateBatchStatus(ingestionId, batch.batch_id, 'triggered');

        console.log(`Processing batch ${batch.batch_id} with ids:`, batch.ids);
        await new Promise(res => setTimeout(res, 2000)); // Simulate delay
        console.log(`Completed batch ${batch.batch_id}`);

        updateBatchStatus(ingestionId, batch.batch_id, 'completed');

    }, 5000);
}

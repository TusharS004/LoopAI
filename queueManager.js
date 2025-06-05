import { updateBatchStatus } from './ingestionStore.js';

const PRIORITY_LEVELS = { HIGH: 3, MEDIUM: 2, LOW: 1 };

let batchQueue = [];
let isProcessing = false;
let lastProcessedTime = 0;

export function enqueueRequest(batch) {
  batchQueue.push(batch);
  sortQueue();
  processNext();
}

function sortQueue() {
  batchQueue.sort((a, b) => {
    // Sort by priority DESC, then createdAt ASC
    if (PRIORITY_LEVELS[b.priority] !== PRIORITY_LEVELS[a.priority]) {
      return PRIORITY_LEVELS[b.priority] - PRIORITY_LEVELS[a.priority];
    }
    return a.createdAt - b.createdAt;
  });
}

async function processNext() {
  if (isProcessing) return;
  if (batchQueue.length === 0) return;

  const now = Date.now();
  const elapsed = now - lastProcessedTime;

  if (elapsed < 5000) {
    // Wait remaining time before processing next batch
    setTimeout(processNext, 5000 - elapsed);
    return;
  }

  isProcessing = true;
  lastProcessedTime = Date.now();

  const batch = batchQueue.shift();

  // Mark batch as triggered
  updateBatchStatus(batch.ingestionId, batch.batchId, 'triggered');

  try {
    // Simulate external API call delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    // After processing complete
    updateBatchStatus(batch.ingestionId, batch.batchId, 'completed');
  } catch (error) {
    updateBatchStatus(batch.ingestionId, batch.batchId, 'failed');
  }

  isProcessing = false;
  processNext();
}

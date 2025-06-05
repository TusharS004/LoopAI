const store = {};

export function createIngestion(id, batches) {
  store[id] = {
    status: 'yet_to_start',
    batches: batches.map(batch => ({
      batch_id: batch.batch_id,
      ids: batch.ids,
      status: 'yet_to_start',
      priority: batch.priority,
      createdAt: batch.createdAt,
    })),
  };
  console.log('Ingestion created in store:', store[id]);
}

export function getIngestionStatus(id) {
  return store[id];
}

export function updateBatchStatus(ingestionId, batchId, status) {
  const ingestion = store[ingestionId];
  if (!ingestion) return;

  const batch = ingestion.batches.find(b => b.batch_id === batchId);
  if (!batch) return;

  batch.status = status;

  const statuses = ingestion.batches.map(b => b.status);

  if (statuses.every(s => s === 'yet_to_start')) {
    ingestion.status = 'yet_to_start';
  } else if (statuses.some(s => s === 'triggered')) {
    ingestion.status = 'triggered';
  } else if (statuses.every(s => s === 'completed')) {
    ingestion.status = 'completed';
  }
}

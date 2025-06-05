const store = {};

export function createIngestion(id, batches) {
    store[id] = {
        status: 'yet_to_start',
        batches: batches.map(batch => ({
            batch_id: batch.batch_id,
            ids: batch.ids,
            status: 'yet_to_start'
        }))
    };
}

export function updateBatchStatus(ingestionId, batchId, status) {
    const ingestion = store[ingestionId];
    const batch = ingestion?.batches.find(b => b.batch_id === batchId);
    if (batch) batch.status = status;

    const statuses = ingestion.batches.map(b => b.status);
    if (statuses.every(s => s === 'completed')) ingestion.status = 'completed';
    else if (statuses.some(s => s === 'triggered')) ingestion.status = 'triggered';
    else ingestion.status = 'yet_to_start';
}

export function getIngestionStatus(id) {
    return store[id];
}

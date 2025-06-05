import { v4 as uuidv4 } from 'uuid';

export function batchIds(ids, batchSize = 3) {
    const batches = [];
    for (let i = 0; i < ids.length; i += batchSize) {
      batches.push({
        ids: ids.slice(i, i + batchSize)
      });
    }
    return batches;
  }

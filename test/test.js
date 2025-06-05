import { jest, describe, test, expect } from '@jest/globals';
import request from 'supertest';
import app from '../index.js'; 

describe('Data Ingestion API', () => {
  jest.setTimeout(30000);

  test('POST /ingest returns ingestion_id', async () => {
    const res = await request(app)
      .post('/ingest')
      .send({ ids: [1, 2, 3, 4, 5], priority: 'MEDIUM' })
      .set('Accept', 'application/json');

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('ingestion_id');
  });

  test('GET /status/:id returns ingestion status', async () => {
    const postRes = await request(app)
      .post('/ingest')
      .send({ ids: [6, 7, 8, 9], priority: 'HIGH' })
      .set('Accept', 'application/json');

    const ingestionId = postRes.body.ingestion_id;
    expect(ingestionId).toBeDefined();

    const getRes = await request(app).get(`/status/${ingestionId}`);

    expect(getRes.status).toBe(200);
    expect(getRes.body).toHaveProperty('ingestion_id', ingestionId);
    expect(getRes.body).toHaveProperty('status');
    expect(Array.isArray(getRes.body.batches)).toBe(true);
  });
});

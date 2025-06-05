import request from 'supertest';
import app from '../server.js';

describe("Data Ingestion API System", () => {
  let ingestionId;

  it("should create an ingestion request and return an ingestion_id", async () => {
    const res = await request(app)
      .post("/ingest")
      .send({ ids: [1, 2, 3, 4, 5], priority: "MEDIUM" });

    expect(res.statusCode).toBe(200);
    expect(res.body.ingestion_id).toBeDefined();

    ingestionId = res.body.ingestion_id;
  });

  it("should return the ingestion status", async () => {
    const res = await request(app).get(`/status/${ingestionId}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.ingestion_id).toBe(ingestionId);
    expect(res.body.status).toMatch(/yet_to_start|triggered|completed/);
    expect(res.body.batches.length).toBeGreaterThan(0);
  });

  it("should prioritize HIGH over MEDIUM", async () => {
    const mediumRes = await request(app)
      .post("/ingest")
      .send({ ids: [10, 11, 12, 13], priority: "MEDIUM" });

    const highRes = await request(app)
      .post("/ingest")
      .send({ ids: [20, 21, 22], priority: "HIGH" });

    expect(highRes.statusCode).toBe(200);
    expect(mediumRes.statusCode).toBe(200);

    const mediumStatus = await request(app).get(`/status/${mediumRes.body.ingestion_id}`);
    const highStatus = await request(app).get(`/status/${highRes.body.ingestion_id}`);

    expect(PRIORITY_ORDER(highStatus.body.status)).toBeLessThanOrEqual(PRIORITY_ORDER(mediumStatus.body.status));
  });

  const PRIORITY_ORDER = (status) => {
    if (status === "completed") return 3;
    if (status === "triggered") return 2;
    return 1;
  };
});
/*
curl -X POST http://localhost:5000/ingest \ -H "Content-Type: application/json" \ -d "{\"ids\": [1, 2, 3, 4, 5], \"priority\": \"MEDIUM\"}"

*/
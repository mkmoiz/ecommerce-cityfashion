import request from 'supertest';
import app from '../app.js';

describe('GET /health', () => {
  it('responds with json and status ok', async () => {
    const response = await request(app)
      .get('/health')
      .expect('Content-Type', /json/)
      .expect(200);

    expect(response.body).toEqual({ status: 'ok' });
  });
});

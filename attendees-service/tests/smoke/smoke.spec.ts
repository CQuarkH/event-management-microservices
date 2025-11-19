import request from 'supertest';
import app from '../../src/app';
import axios from 'axios';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('Smoke Test: Flujo completo de Asistente', () => {
  let createdId: string;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('Debe registrar un asistente (Integra BD + Notif)', async () => {
    const mockCreated = { id: 'smoke-1', name: 'Smoke Test User', email: 'smoke@test.com' };

    mockedAxios.post.mockImplementation((url) => {
      if (url && String(url).includes('/attendees')) return Promise.resolve({ data: mockCreated });
      if (url && String(url).includes('/notifications')) return Promise.resolve({ data: { status: 'sent' } });
      return Promise.reject(new Error('Unexpected POST ' + url));
    });

    const res = await request(app)
      .post('/api/attendees')
      .send({
        name: 'Smoke Test User',
        email: 'smoke@test.com'
      });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('id');
    createdId = res.body.id;
  });

  it('Debe confirmar al asistente', async () => {
    const updated = { id: 'smoke-1', name: 'Smoke Test User', email: 'smoke@test.com', status: 'confirmed' };

    mockedAxios.patch.mockImplementation((url) => {
      if (url && String(url).includes('/status')) return Promise.resolve({ data: updated });
      return Promise.reject(new Error('Unexpected PATCH ' + url));
    });
    mockedAxios.post.mockResolvedValue({ data: { status: 'sent' } });

    const res = await request(app)
      .patch(`/api/attendees/${createdId}/confirm`)
      .send();

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('confirmed');
  });
});
import request from 'supertest';
import app from '../../src/app';
import axios from 'axios';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('Smoke Test: Flujo completo de Asistente', () => {
  let createdId: string;

  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('Debe registrar un asistente (Integra BD + Notif)', async () => {
    mockedAxios.post.mockImplementation((url: any, data?: any) => {
      if (typeof url === 'string' && url.includes('/attendees')) {
        return Promise.resolve({ data: { id: 'smoke-1', ...(data as any) } });
      }
      return Promise.resolve({ data: { ok: true } });
    });

    const res = await request(app)
      .post('/api/attendees')
      .send({
        name: 'Smoke Test User',
        email: 'smoke@test.com',
        phone: '123456789'
      });

    if (res.status !== 201) {
      console.error('Smoke register failed response:', res.status, res.body);
    }

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('id');
    createdId = res.body.id;
  });

  it('Debe confirmar al asistente', async () => {
    expect(createdId).toBeDefined();

    mockedAxios.patch.mockImplementationOnce((url: any, data?: any) => {
      if (typeof url === 'string' && url.includes('/status')) {
        return Promise.resolve({ data: { id: createdId, status: (data as any).status, name: 'Smoke Test User', email: 'smoke@test.com' } });
      }
      return Promise.reject(new Error('Unexpected patch'));
    });

    mockedAxios.post.mockImplementationOnce((url, data) => Promise.resolve({ data: { ok: true } }));

    const res = await request(app)
      .patch(`/api/attendees/${createdId}/confirm`)
      .send();

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('confirmed');
  });

  it('Debe obtener los datos actualizados del asistente', async () => {
    expect(createdId).toBeDefined();

    mockedAxios.get.mockImplementationOnce((url: any) => {
      return Promise.resolve({ data: { id: createdId, name: 'Smoke Test User', email: 'smoke@test.com', status: 'confirmed' } });
    });

    const res = await request(app)
      .get(`/api/attendees/${createdId}`);

    expect(res.status).toBe(200);
    expect(res.body.id).toBe(createdId);
    expect(res.body.status).toBe('confirmed');
  });
});
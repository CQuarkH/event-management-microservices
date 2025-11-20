// Mock the AttendeesService used by controllers
jest.mock('../../../src/services/attendees.service', () => {
  const registerAttendee = jest.fn();
  const getAttendee = jest.fn();
  const confirmAttendance = jest.fn();
  const updateAttendee = jest.fn();
  const cancelAttendance = jest.fn();

  class AttendeesService {
    registerAttendee = registerAttendee;
    getAttendee = getAttendee;
    confirmAttendance = confirmAttendance;
    updateAttendee = updateAttendee;
    cancelAttendance = cancelAttendance;
  }

  return {
    AttendeesService,
    __mocks__: { registerAttendee, getAttendee, confirmAttendance, updateAttendee, cancelAttendance }
  };
});

import request from 'supertest';
import app from '../../../src/app';

const svcModule: any = require('../../../src/services/attendees.service');
const mockedService = svcModule.__mocks__ as any;

describe('Attendees Controller', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('POST /api/attendees -> register', async () => {
    const payload = { name: 'Alice', email: 'alice@example.com' };
    mockedService.registerAttendee.mockResolvedValue({ id: '1', ...payload });

    const res = await request(app).post('/api/attendees').send(payload).expect(201);
    expect(res.body).toMatchObject({ id: '1', name: 'Alice', email: 'alice@example.com' });
    expect(mockedService.registerAttendee).toHaveBeenCalledWith(payload);
  });

  test('GET /api/attendees/:id -> getOne success', async () => {
    const attendee = { id: '1', name: 'Bob' };
    mockedService.getAttendee.mockResolvedValue(attendee);

    const res = await request(app).get('/api/attendees/1').expect(200);
    expect(res.body).toEqual(attendee);
    expect(mockedService.getAttendee).toHaveBeenCalledWith('1');
  });

  test('GET /api/attendees/:id -> getOne not found', async () => {
    mockedService.getAttendee.mockImplementation(() => { throw new Error('Not found'); });

    const res = await request(app).get('/api/attendees/does-not-exist').expect(404);
    expect(res.body).toHaveProperty('error');
  });

  test('PATCH /api/attendees/:id/confirm -> confirm', async () => {
    const updated = { id: '1', status: 'confirmed' };
    mockedService.confirmAttendance.mockResolvedValue(updated);

    const res = await request(app).patch('/api/attendees/1/confirm').expect(200);
    expect(res.body).toEqual(updated);
    expect(mockedService.confirmAttendance).toHaveBeenCalledWith('1');
  });

  test('PUT /api/attendees/:id -> update', async () => {
    const payload = { name: 'Updated' };
    const updated = { id: '1', name: 'Updated' };
    mockedService.updateAttendee.mockResolvedValue(updated);

    const res = await request(app).put('/api/attendees/1').send(payload).expect(200);
    expect(res.body).toEqual(updated);
    expect(mockedService.updateAttendee).toHaveBeenCalledWith('1', payload);
  });

  test('DELETE /api/attendees/:id -> cancel', async () => {
    const updated = { id: '1', status: 'unconfirmed' };
    mockedService.cancelAttendance.mockResolvedValue(updated);

    const res = await request(app).delete('/api/attendees/1').expect(200);
    expect(res.body).toEqual(updated);
    expect(mockedService.cancelAttendance).toHaveBeenCalledWith('1');
  });
});

import axios from 'axios';
import { AttendeesService } from '../../src/services/attendees.service';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('AttendeesService Unit', () => {
  const service = new AttendeesService();

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('registerAttendee -> crea asistente y envía notificación', async () => {
    const mockData = { id: '1', name: 'Seba', email: 'seba@test.com' };
    
    mockedAxios.post.mockImplementation((url) => {
        if (url.includes('attendees')) return Promise.resolve({ data: mockData });
        if (url.includes('notifications')) return Promise.resolve({ data: { status: 'sent' } });
        return Promise.reject();
    });

    const result = await service.registerAttendee({ name: 'Seba', email: 'seba@test.com' });

    expect(result).toEqual(mockData);
    expect(mockedAxios.post).toHaveBeenCalledWith(expect.stringContaining('/attendees'), expect.any(Object));
    expect(mockedAxios.post).toHaveBeenCalledWith(expect.stringContaining('/notifications/send'), expect.any(Object));
  });

  test('getAttendee -> obtiene asistente por id', async () => {
    const mockData = { id: '1', name: 'Seba', email: 'seba@test.com' };
    mockedAxios.get.mockResolvedValue({ data: mockData });

    const result = await service.getAttendee('1');
    expect(result).toEqual(mockData);
    expect(mockedAxios.get).toHaveBeenCalledWith(expect.stringContaining('/attendees/1'));
  });

  test('confirmAttendance -> confirma y envía notificación', async () => {
    const updated = { id: '1', name: 'Seba', email: 'seba@test.com', status: 'confirmed' };
    mockedAxios.patch.mockResolvedValue({ data: updated });
    mockedAxios.post.mockResolvedValue({ data: { status: 'sent' } });

    const result = await service.confirmAttendance('1');
    expect(result).toEqual(updated);
    expect(mockedAxios.patch).toHaveBeenCalledWith(expect.stringContaining('/attendees/1/status'), expect.objectContaining({ status: 'confirmed' }));
    expect(mockedAxios.post).toHaveBeenCalledWith(expect.stringContaining('/notifications/send'), expect.any(Object));
  });

  test('updateAttendee -> actualiza campos del asistente', async () => {
    const updated = { id: '1', name: 'Seba Updated', email: 'seba@test.com' };
    mockedAxios.put.mockResolvedValue({ data: updated }); // Asumiendo PUT en el servicio

    const result = await service.updateAttendee('1', { name: 'Seba Updated' });
    expect(result).toEqual(updated);
    expect(mockedAxios.put).toHaveBeenCalledWith(expect.stringContaining('/attendees/1'), expect.objectContaining({ name: 'Seba Updated' }));
  });

  test('cancelAttendance -> marca como unconfirmed y notifica', async () => {
    const updated = { id: '1', name: 'Seba', email: 'seba@test.com', status: 'unconfirmed' };
    mockedAxios.patch.mockResolvedValue({ data: updated });
    mockedAxios.post.mockResolvedValue({ data: { status: 'sent' } });

    const result = await service.cancelAttendance('1');
    expect(result).toEqual(updated);
    expect(mockedAxios.patch).toHaveBeenCalledWith(expect.stringContaining('/attendees/1/status'), expect.objectContaining({ status: 'unconfirmed' }));
    expect(mockedAxios.post).toHaveBeenCalledWith(expect.stringContaining('/notifications/send'), expect.any(Object));
  });
});
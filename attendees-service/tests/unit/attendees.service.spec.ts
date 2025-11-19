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
});
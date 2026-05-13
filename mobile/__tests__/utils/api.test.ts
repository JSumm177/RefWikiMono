import { Platform } from 'react-native';

// Initial mocks
jest.mock('react-native', () => ({
  Platform: {
    OS: 'ios',
  },
}));

jest.mock('../../utils/ip', () => ({
  LOCAL_IP: 'localhost',
}));

describe('getBaseUrl', () => {
  const originalDev = (global as any).__DEV__;

  beforeEach(() => {
    jest.resetModules();
  });

  afterAll(() => {
    (global as any).__DEV__ = originalDev;
  });

  it('returns the local IP URL when LOCAL_IP is set and not localhost in dev mode', () => {
    (global as any).__DEV__ = true;
    jest.doMock('../../utils/ip', () => ({
      LOCAL_IP: '192.168.1.100',
    }));

    const { getBaseUrl } = require('../../utils/api');
    expect(getBaseUrl()).toBe('http://192.168.1.100:8080');
  });

  it('returns the Android simulator URL when on Android and LOCAL_IP is localhost in dev mode', () => {
    (global as any).__DEV__ = true;
    jest.doMock('react-native', () => ({
      Platform: { OS: 'android' },
    }));
    jest.doMock('../../utils/ip', () => ({
      LOCAL_IP: 'localhost',
    }));

    const { getBaseUrl } = require('../../utils/api');
    expect(getBaseUrl()).toBe('http://10.0.2.2:8080');
  });

  it('returns localhost when on iOS and LOCAL_IP is localhost in dev mode (Edge Case)', () => {
    (global as any).__DEV__ = true;
    jest.doMock('react-native', () => ({
      Platform: { OS: 'ios' },
    }));
    jest.doMock('../../utils/ip', () => ({
      LOCAL_IP: 'localhost',
    }));

    const { getBaseUrl } = require('../../utils/api');
    expect(getBaseUrl()).toBe('http://localhost:8080');
  });

  it('returns localhost when not in dev mode', () => {
    (global as any).__DEV__ = false;
    jest.doMock('react-native', () => ({
      Platform: { OS: 'android' },
    }));
    jest.doMock('../../utils/ip', () => ({
      LOCAL_IP: '192.168.1.100',
    }));

    const { getBaseUrl } = require('../../utils/api');
    expect(getBaseUrl()).toBe('http://localhost:8080');
  });
});

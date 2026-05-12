import { Platform } from 'react-native';

// Mock LOCAL_IP from the ip module
jest.mock('../../utils/ip', () => ({
  LOCAL_IP: 'localhost',
}));

// Mock react-native Platform
jest.mock('react-native', () => ({
  Platform: {
    OS: 'ios',
  },
}));

describe('getBaseUrl', () => {
  let getBaseUrl: () => string;
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
    getBaseUrl = require('../../utils/api').getBaseUrl;
    expect(getBaseUrl()).toBe('http://192.168.1.100:8080');
  });

  it('returns the Android simulator URL when on Android and LOCAL_IP is localhost in dev mode', () => {
    (global as any).__DEV__ = true;
    jest.doMock('../../utils/ip', () => ({
      LOCAL_IP: 'localhost',
    }));
    Platform.OS = 'android';
    getBaseUrl = require('../../utils/api').getBaseUrl;
    expect(getBaseUrl()).toBe('http://10.0.2.2:8080');
  });

  it('returns localhost when on iOS and LOCAL_IP is localhost in dev mode (Edge Case)', () => {
    (global as any).__DEV__ = true;
    jest.doMock('../../utils/ip', () => ({
      LOCAL_IP: 'localhost',
    }));
    Platform.OS = 'ios';
    getBaseUrl = require('../../utils/api').getBaseUrl;
    expect(getBaseUrl()).toBe('http://localhost:8080');
  });

  it('returns localhost when not in dev mode', () => {
    (global as any).__DEV__ = false;
    // Even if LOCAL_IP is set and platform is android, production should default to localhost
    jest.doMock('../../utils/ip', () => ({
      LOCAL_IP: '192.168.1.100',
    }));
    Platform.OS = 'android';
    getBaseUrl = require('../../utils/api').getBaseUrl;
    expect(getBaseUrl()).toBe('http://localhost:8080');
  });
});

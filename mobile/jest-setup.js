/* global jest */
jest.mock('expo-secure-store', () => ({
  setItemAsync: jest.fn(() => Promise.resolve(null)),
  getItemAsync: jest.fn(() => Promise.resolve(null)),
  deleteItemAsync: jest.fn(() => Promise.resolve(null)),
}));

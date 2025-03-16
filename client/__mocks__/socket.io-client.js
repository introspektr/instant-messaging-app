const mockSocket = {
  on: jest.fn(),
  emit: jest.fn(),
  disconnect: jest.fn(),
  off: jest.fn()
};

const io = jest.fn(() => mockSocket);

export { io };
export default io; 
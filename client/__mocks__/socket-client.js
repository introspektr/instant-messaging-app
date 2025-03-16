const mockSocket = {
  on: function() {},
  emit: function() {},
  disconnect: function() {}
};

export const io = function() { return mockSocket; };
export default mockSocket;

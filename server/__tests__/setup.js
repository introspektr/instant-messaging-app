const mongoose = require('mongoose');

beforeAll(async () => {
  // Use the in-memory MongoDB instance URL provided by jest-mongodb
  await mongoose.connect(process.env.MONGO_URL);
});

afterAll(async () => {
  await mongoose.connection.close();
});

// Adding a dummy test to prevent Jest error about empty test suite
describe('Database connection', () => {
  it('should connect to MongoDB', () => {
    expect(mongoose.connection.readyState).toBe(1);
  });
}); 
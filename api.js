const axios = require('axios');

async function fetchUser(userId, options = { timeout: undefined }) {
  try {
    const response = await axios.get(
      `https://jsonplaceholder.typicode.com/users/${userId}`,
      { timeout: options.timeout }
    );
    return response.data;
  } catch (error) {
    console.error('Error fetching user:', error);
    throw error;
  }
}

async function createUser(userData) {
  try {
    const response = await axios.post(
      'https://jsonplaceholder.typicode.com/users',
      userData
    );
    return response.data;
  } catch (error) {
    throw error;
  }
}

module.exports = { fetchUser, createUser };

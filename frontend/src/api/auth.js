import API from './axios';

export const registerApi = async (name, email, password) => {
  const response = await API.post('/auth/register', { name, email, password });
  return response.data;
};

export const loginApi = async (email, password) => {
  const response = await API.post('/auth/login', { email, password });
  return response.data;
};

export const getCurrentUserApi = async () => {
  const response = await API.get('/users/me');
  return response.data;
};

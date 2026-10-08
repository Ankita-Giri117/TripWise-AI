import API from './axios';

export const getTripsApi = async () => {
  const response = await API.get('/trips');
  return response.data;
};

export const getTripByIdApi = async (id) => {
  const response = await API.get(`/trips/${id}`);
  return response.data;
};

export const createTripApi = async (tripData) => {
  const response = await API.post('/trips', tripData);
  return response.data;
};

export const updateTripApi = async (id, tripData) => {
  const response = await API.put(`/trips/${id}`, tripData);
  return response.data;
};

export const deleteTripApi = async (id) => {
  const response = await API.delete(`/trips/${id}`);
  return response.data;
};

export const generateItineraryApi = async (id) => {
  const response = await API.post(`/trips/${id}/itinerary/generate`);
  return response.data;
};

export const getSavedItineraryApi = async (id) => {
  const response = await API.get(`/trips/${id}/itinerary`);
  return response.data;
};

export const askAssistantApi = async (id, message) => {
  const response = await API.post(`/trips/${id}/assistant`, { message });
  return response.data;
};

export const getExpensesApi = async (tripId) => {
  const response = await API.get(`/trips/${tripId}/expenses`);
  return response.data;
};

export const createExpenseApi = async (tripId, expenseData) => {
  const response = await API.post(`/trips/${tripId}/expenses`, expenseData);
  return response.data;
};

export const updateExpenseApi = async (tripId, expenseId, expenseData) => {
  const response = await API.put(`/trips/${tripId}/expenses/${expenseId}`, expenseData);
  return response.data;
};

export const deleteExpenseApi = async (tripId, expenseId) => {
  const response = await API.delete(`/trips/${tripId}/expenses/${expenseId}`);
  return response.data;
};



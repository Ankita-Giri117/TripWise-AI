import API from './axios';

export const getChecklistApi = async (tripId) => {
  const response = await API.get(`/trips/${tripId}/checklist`);
  return response.data;
};

export const createChecklistItemApi = async (tripId, itemData) => {
  const response = await API.post(`/trips/${tripId}/checklist`, itemData);
  return response.data;
};

export const updateChecklistItemApi = async (tripId, itemId, itemData) => {
  const response = await API.put(`/trips/${tripId}/checklist/${itemId}`, itemData);
  return response.data;
};

export const deleteChecklistItemApi = async (tripId, itemId) => {
  const response = await API.delete(`/trips/${tripId}/checklist/${itemId}`);
  return response.data;
};

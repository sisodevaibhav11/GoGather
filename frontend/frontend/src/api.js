import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
    withCredentials: true,
});

export const googleAuth = (credential) => api.post('/auth/google', { credential });
export const fetchCurrentUser = () => api.get('/auth/me');
export const logoutUser = () => api.post('/auth/logout');
export const updateProfile = (payload) => api.patch('/auth/profile', payload);

export const fetchTrips = () => api.get('/trips');
export const createTrip = (payload) => api.post('/trips', payload);
export const fetchTripDetails = (tripId) => api.get(`/trips/${tripId}`);
export const fetchTripMatches = (tripId) => api.get(`/trips/${tripId}/matches`);
export const updateTripStatus = (tripId, status) => api.patch(`/trips/${tripId}/status`, { status });
export const fetchSharedTrip = (shareCode) => api.get(`/trips/share/${shareCode}`);
export const updateTrip = (tripId, payload) => api.patch(`/trips/${tripId}`, payload);
export const deleteTrip = (tripId) => api.delete(`/trips/${tripId}`);

export const fetchLocationSuggestions = (query) => api.get(`/locations/geocode?query=${encodeURIComponent(query)}`);
export const requestConnection = (payload) => api.post('/connections', payload);
export const fetchNotifications = () => api.get('/connections/notifications');
export const submitReport = (payload) => api.post('/reports', payload);
export const askAiAssistant = (payload) => api.post('/ai-assist', payload);
export const createGroup = (payload) => api.post('/groups', payload);
export const joinGroup = (groupId, payload) => api.post(`/groups/${groupId}/join`, payload);
export const getGroup = (groupId) => api.get(`/groups/${groupId}`);
export const getMyGroups = () => api.get('/groups/mine');

export default api;

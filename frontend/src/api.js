import axios from 'axios';

const rawBaseURL = (import.meta.env.VITE_API_BASE_URL || '/api').trim();

const normalizeBaseURL = (value) => {
    const trimmed = value.replace(/\/+$/, '');

    if (!trimmed) {
        return '/api';
    }

    if (trimmed === '/api' || trimmed.endsWith('/api')) {
        return trimmed;
    }

    if (/^https?:\/\//i.test(trimmed)) {
        return `${trimmed}/api`;
    }

    return trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
};

const baseURL = normalizeBaseURL(rawBaseURL);

if (import.meta.env.PROD) {
    console.info(`[api] Using API base URL: ${baseURL}`);
}

const api = axios.create({
    baseURL,
    withCredentials: true,
});

api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (!error.response) {
            console.error(
                `[api] Request to "${(error.config?.baseURL || '') + (error.config?.url || '')}" failed with ` +
                'no response. This usually means: the backend URL is wrong/unreachable, or the backend ' +
                "rejected the request via CORS because its FRONTEND_URL doesn't match this site's origin."
            );
        }
        return Promise.reject(error);
    },
);

export const googleAuth = (credential) => api.post('/auth/google', { credential });
export const signupWithPassword = (payload) => api.post('/auth/signup', payload);
export const loginWithPassword = (payload) => api.post('/auth/login', payload);
export const fetchCurrentUser = () => api.get('/auth/me');
export const logoutUser = () => api.post('/auth/logout');
export const updateProfile = (payload) => api.patch('/auth/profile', payload);

export const fetchTrips = () => api.get('/trips');
export const fetchPublicTrips = (transportType) => api.get(`/trips/public${transportType ? `?transportType=${encodeURIComponent(transportType)}` : ''}`);
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
export const submitIssue = (payload) => api.post('/reports/issue', payload);
export const askAiAssistant = (payload) => api.post('/ai-assist', payload);
export const createGroup = (payload) => api.post('/groups', payload);
export const joinGroup = (groupId, payload) => api.post(`/groups/${groupId}/join`, payload);
export const getGroup = (groupId) => api.get(`/groups/${groupId}`);
export const getMyGroups = () => api.get('/groups/mine');

export default api;

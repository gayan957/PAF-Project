import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:8080/api',
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
    }
});

// Response interceptor for handling 401s
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && error.response.status === 401) {
            // Optional: Handle token expiration or unauthorized access globally
            console.error("Unauthorized. Redirecting to login...");
        }
        return Promise.reject(error);
    }
);

export default api;

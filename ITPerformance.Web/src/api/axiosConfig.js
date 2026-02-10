import axios from 'axios';

// Backend API'mızın temel adresi
const API_BASE_URL = 'http://localhost:5124';

// Yeni bir axios örneği (instance) oluşturuyoruz.
const apiClient = axios.create({
    baseURL: API_BASE_URL,
});

// Bu, apiClient ile yapılan HER istekten ÖNCE çalışan bir "durdurucudur" (interceptor).
apiClient.interceptors.request.use(
    (config) => {
        // localStorage'dan token'ı alıyoruz.
        const token = localStorage.getItem('authToken');
        // Eğer token varsa, isteğin Authorization başlığına ekliyoruz.
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default apiClient;

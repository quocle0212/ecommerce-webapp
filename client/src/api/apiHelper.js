import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000/api/v1';

const api = axios.create({
    baseURL: API_BASE_URL,
	headers: {
		Accept: "application/json,*"
	}
});

api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

api.interceptors.response.use(
    (response) => {
        // Kiểm tra nếu API trả về status "error" trong response body
        if (response.data.status === 'error') {
            // Reject promise nếu API trả về lỗi
            return Promise.reject({
                ...response.data,
                message: response.data.message,
                status: response.data.status,
            });
        }

        // Chuẩn hóa phản hồi trả về cho trường hợp thành công
        return {
            data: response.data.data,
            status: response.data.status,
            statusText: response.statusText,
            message: response.data.message,
        };
    },
    (error) => {
        if (error.response && error.response.status === 401) {
            localStorage.removeItem('token');
            console.info("===========[] ===========[window.location.href LOGIN] : ");
            window.location.href = '/login';
        }

        // Tạo error object với thông tin chi tiết
        const errorData = {
            ...error?.response?.data || {},
            message: error.response?.data?.message || error.message,
            status: error.response?.status || "error",
        };

        // Reject promise để Redux thunk có thể catch được lỗi
        return Promise.reject(errorData);
    }
);

const apiHelper = {
    get: (url, config = {}) => api.get(url, config),
    post: (url, data, config = {}) => api.post(url, data, config),
    put: (url, data, config = {}) => api.put(url, data, config),
    delete: (url, config = {}) => api.delete(url, config),
};

export default apiHelper;

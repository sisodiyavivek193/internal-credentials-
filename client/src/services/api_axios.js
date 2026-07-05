import axios from "axios";

const api = axios.create({
    baseURL: "/api",
    withCredentials: true,
});

// 🔥 Error Handling Interceptor
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (!error.response) {
            // Server Down / Network Error
            console.error("❌ Server is not reachable!");
        } else if (error.response.status === 404) {
            console.error("❌ API Not Found (404)");
        } else if (error.response.status === 500) {
            console.error("❌ Internal Server Error (500)");
        } else if (error.response.status === 401) {
            console.error("⚠️ Unauthorized (401) — Login required");
        } else if (error.response.status === 403) {
            console.error("⛔ Forbidden (403) — Access denied");
        } else {
            console.error(`⚠️ Error: ${error.response.status}`);
        }

        return Promise.reject(error);
    }
);

export default api;

import axios from "axios";

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || "/api",
    withCredentials: true,
});

// 📱 Cookie ke saath-saath Authorization header bhi bhejo — iOS Safari/Chrome
// cross-site cookies block kar dete hain, isliye token fallback zaroori hai
api.interceptors.request.use((config) => {
    const token = localStorage.getItem("auth_token");
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// 🔥 Error Handling Interceptor + Auto-refresh on 401
let isRefreshing = false;
let refreshQueue = [];

api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        if (!error.response) {
            console.error("❌ Server is not reachable!");
            return Promise.reject(error);
        }

        // 401 mila aur ye pehli retry try nahi hai, aur ye khud /auth/refresh ya /auth/login call nahi hai
        if (
            error.response.status === 401 &&
            !originalRequest._retry &&
            !originalRequest.url?.includes("/auth/refresh") &&
            !originalRequest.url?.includes("/auth/login") &&
            !originalRequest.url?.includes("/auth/verify-2fa")
        ) {
            const refreshToken = localStorage.getItem("refresh_token");
            if (!refreshToken) {
                return Promise.reject(error);
            }

            if (isRefreshing) {
                // Ek refresh already chal raha hai — usi ke complete hone ka wait karo
                return new Promise((resolve, reject) => {
                    refreshQueue.push({ resolve, reject, originalRequest });
                });
            }

            originalRequest._retry = true;
            isRefreshing = true;

            try {
                const { data } = await api.post("/auth/refresh", { refreshToken });
                localStorage.setItem("auth_token", data.token);
                isRefreshing = false;

                // Jitne bhi requests wait kar rahi thi, unhe naye token ke saath retry karo
                refreshQueue.forEach(({ resolve, originalRequest: req }) => {
                    req.headers.Authorization = `Bearer ${data.token}`;
                    resolve(api(req));
                });
                refreshQueue = [];

                originalRequest.headers.Authorization = `Bearer ${data.token}`;
                return api(originalRequest);
            } catch (refreshError) {
                isRefreshing = false;
                refreshQueue.forEach(({ reject }) => reject(refreshError));
                refreshQueue = [];

                // Refresh bhi fail ho gaya — ab sach mein login karna padega
                localStorage.removeItem("auth_token");
                localStorage.removeItem("refresh_token");
                localStorage.removeItem("role");
                window.location.href = "/login";
                return Promise.reject(refreshError);
            }
        }

        if (error.response.status === 404) {
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

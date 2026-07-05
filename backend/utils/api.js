const BASE_URL = "http://localhost:5000/api";

export async function apiRequest(endpoint, method = "GET", body) {
    const token =
        typeof window !== "undefined"
            ? localStorage.getItem("token")
            : null;

    const headers = {
        "Content-Type": "application/json",
    };

    // 🔐 token sirf protected routes ke liye
    if (!endpoint.startsWith("/auth") && token) {
        headers.Authorization = `Bearer ${token}`;
    }

    const res = await fetch(`${BASE_URL}${endpoint}`, {
        method,
        headers,
        body: body ? JSON.stringify(body) : null,
    });

    let data;
    try {
        data = await res.json();
    } catch {
        data = { message: "Invalid server response" };
    }

    // 🔥 AUTO LOGOUT ONLY WHEN TOKEN IS REALLY INVALID
    if (
        res.status === 401 &&
        data?.message === "Invalid token"
    ) {
        console.warn("Invalid token → auto logout");
        localStorage.removeItem("token");
        window.location.href = "/login";
        return;
    }

    if (!res.ok) {
        return data;
    }

    return data;
}

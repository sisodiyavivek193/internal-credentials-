const BASE_URL = "http://localhost:5000/api"; // ✅ Dono laptop par hain toh localhost best hai

export async function apiRequest(endpoint, method = "GET", body) {
    console.log(`➡️ API CALL: ${method} ${endpoint}`);

    try {
        const res = await fetch(`${BASE_URL}${endpoint}`, {
            method,
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: body ? JSON.stringify(body) : null,
        });

        const data = await res.json().catch(() => null);
        console.log("⬅️ RESPONSE:", data);

        if (!res.ok) {
            return {
                error: true,
                message: data?.message || "Something went wrong",
                status: res.status
            };
        }

        return data;
    } catch (err) {
        console.error("❌ NETWORK ERROR:", err);
        return { error: true, message: "Server se connect nahi ho paya. Check if Backend is running." };
    }
}
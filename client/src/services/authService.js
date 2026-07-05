import api from "./api_axios";

export async function getMe() {
    try {
        const res = await api.get("/auth/me");
        return { auth: true, ...res.data };
    } catch (e) {
        return { auth: false };
    }
}

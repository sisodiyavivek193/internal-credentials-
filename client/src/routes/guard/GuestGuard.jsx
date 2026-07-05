import { getMe } from "@/services/authService";
import { useEffect, useState } from "react";
import { useRouter } from "@/routes/hooks";

export default function GuestGuard({ children }) {
    const [loading, setLoading] = useState(true);
    const [auth, setAuth] = useState(false);
    const router = useRouter();

    useEffect(() => {
        async function check() {
            const res = await getMe();
            setAuth(res.auth);
            setLoading(false);
        }
        check();
    }, []);

    if (loading) return <div>Loading...</div>;

    if (auth) {
        router.replace("/dashboard");
        return null;
    }

    return children;
}

import { getMe } from "@/services/authService";
import { useEffect, useState } from "react";
import { useRouter } from "@/routes/hooks";

export default function AuthGuard({ children, allowedRoles }) {
    const [loading, setLoading] = useState(true);
    const [authData, setAuthData] = useState({ auth: false, role: null });
    const router = useRouter();

    useEffect(() => {
        async function check() {
            const res = await getMe();
            setAuthData(res);
            setLoading(false);
        }
        check();
    }, []);

    if (loading) return <div>Loading...</div>;

    if (!authData.auth) {
        router.replace("/login");
        return null;
    }

    if (allowedRoles && !allowedRoles.includes(authData.role)) {
        router.replace("/not-authorized");
        return null;
    }

    return children;
}




// ----------------------------------------------------------------------

import LoadingScreen from "@/components/loading/LoadingScreen";
import { usePathname } from "@/routes/hooks";
import { Suspense } from "react";
import { Outlet } from "react-router-dom";
import Login from "../Login";
import TwoFactorVerify from "../TwoFactorVerify";

// Suspense wrapper for Outlet
function SuspenseOutlet() {
    const pathname = usePathname();
    return (
        <Suspense key={pathname} fallback={<LoadingScreen />}>
            <Outlet />
        </Suspense>
    );
}


export const authRoutes = [
    {
        path: '/',
        element: <SuspenseOutlet />,
        children: [
            { element: <Login />, index: true },
            { path: 'login', element: <Login /> },
            { path: 'otp/:userId', element: <TwoFactorVerify /> },
        ],
    },
];

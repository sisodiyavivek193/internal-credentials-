import { Suspense } from "react";
import { Outlet } from "react-router-dom";
import { usePathname } from "@/routes/hooks";
import UserLayout from "@/layouts/UserLayout";
import LoadingScreen from "@/components/loading/LoadingScreen";
import AuthGuard from "@/routes/guard/AuthGuard";
import { SidebarProvider } from "@/components/ui/sidebar";

import UserCredentials from "../credentials/table/page";
import Tasks from "../Tasks";
import Apps from "../Apps";
import Chats from "../Chats";

function SuspenseOutlet() {
    const pathname = usePathname();
    return (
        <Suspense key={pathname} fallback={<LoadingScreen />}>
            <Outlet />
        </Suspense>
    );
}

// 🔒 Sirf normal role users (admin nahi) yahan aa sakte hai.
// Login/2FA ke baad non-admin role already "/dashboard" par redirect hota hai
// (dekho: pages/auth/TwoFactorVerify.jsx), isliye humne wahi path use kiya hai.
const userDashboardLayout = () => (
    <AuthGuard allowedRoles={["uiux", "seo", "developer"]}>
        <SidebarProvider>
            <UserLayout>
                <SuspenseOutlet />
            </UserLayout>
        </SidebarProvider>
    </AuthGuard>
);

export const userDashboardRoutes = [
    {
        path: 'dashboard',
        element: userDashboardLayout(),
        children: [
            { index: true, element: <UserCredentials /> },
            { path: "tasks", element: <Tasks /> },
            { path: "apps", element: <Apps /> },
            { path: "chats", element: <Chats /> },
        ],
    },
];

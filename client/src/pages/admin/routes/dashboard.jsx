import { Suspense, lazy } from "react";
import { Outlet } from "react-router-dom";
import { usePathname } from "@/routes/hooks";
import AdminLayout from "@/layouts/AdminLayout";
import LoadingScreen from "@/components/loading/LoadingScreen";
import AuthGuard from "@/routes/guard/AuthGuard";

import AdminDashboard from "../AdminDashboard";
import Users from "../Users";
import { SidebarProvider } from "@/components/ui/sidebar";
import AddCredentialForm from "../credentials/AddCredentialForm";
import Credentials from "../credentials/table/page";
import AddUserForm from "../Users/AddUserForm";
import Tasks from "@/pages/user/Tasks";
import Apps from "@/pages/user/Apps";
import Chats from "@/pages/user/Chats";
import AuditLogs from "../AuditLogs";
// import Tasks from "../Tasks";
// import Apps from "../Apps";
// import Chats from "../Chats";

function SuspenseOutlet() {
    const pathname = usePathname();
    return (
        <Suspense key={pathname} fallback={<LoadingScreen />}>
            <Outlet />
        </Suspense>
    );
}

const dashboardLayout = () => (
    <AuthGuard allowedRoles={["admin"]}>
        <SidebarProvider>
            <AdminLayout>
                <SuspenseOutlet />
            </AdminLayout>
        </SidebarProvider>
    </AuthGuard>
);

export const dashboardRoutes = [
    {
        path: 'admin',
        element: dashboardLayout(),
        children: [
            { index: true, element: <AdminDashboard /> },
            { path: "users", element: <Users /> },
            { path: "user", element: <AddUserForm /> },
            { path: "user/:userId", element: <AddUserForm /> },
            { path: "credentials", element: <Credentials /> },
            { path: "credential", element: <AddCredentialForm /> },
            { path: "credential/:userId", element: <AddCredentialForm /> },
            { path: "audit-logs", element: <AuditLogs /> },
            { path: "tasks", element: <Tasks /> },
            { path: "apps", element: <Apps /> },
            { path: "chats", element: <Chats /> }
        ],
    },
];
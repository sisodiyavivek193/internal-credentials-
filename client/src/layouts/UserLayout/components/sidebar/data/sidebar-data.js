import {
    Lock,
    ListTodo,
    Package,
    MessagesSquare,
} from 'lucide-react'

// 🔒 Normal role users (uiux / seo / developer) ke liye sidebar.
// Sirf inhi cheezo ka access hai:
// - My Credentials (read-only, role-wise filtered)
// - Tasks / Apps / Chats (static template pages)
// Users management ya kisi bhi tarah ka "Add/Edit/Delete" yahan nahi hai
// kyunki normal user sirf apna role-based data dekh sakta hai.

export const sidebarData = {
    navGroups: [
        {
            title: 'General',
            items: [
                {
                    title: 'My Credentials',
                    url: '/dashboard',
                    icon: Lock,
                },
                {
                    title: 'Tasks',
                    url: '/dashboard/tasks',
                    icon: ListTodo,
                },
                {
                    title: 'Apps',
                    url: '/dashboard/apps',
                    icon: Package,
                },
                {
                    title: 'Chats',
                    url: '/dashboard/chats',
                    badge: '3',
                    icon: MessagesSquare,
                },
            ],
        },
    ],
}

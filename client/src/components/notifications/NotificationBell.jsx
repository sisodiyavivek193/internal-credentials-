import React, { useEffect, useState, useCallback } from "react";
import { Bell, BellOff, BellRing, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuTrigger,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import api from "@/services/api_axios";
import {
    isPushSupported,
    getPushPermission,
    isPushSubscribed,
    enablePushNotifications,
    disablePushNotifications,
} from "@/services/pushService";

// Poll interval for the unread badge (ms). Simple + reliable — no websocket setup needed.
const POLL_INTERVAL = 20000;

function timeAgo(dateString) {
    const diffMs = Date.now() - new Date(dateString).getTime();
    const mins = Math.floor(diffMs / 60000);
    if (mins < 1) return "just now";
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    return `${days}d ago`;
}

export default function NotificationBell() {
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(false);
    const [open, setOpen] = useState(false);
    const [pushEnabled, setPushEnabled] = useState(false);
    const [pushBusy, setPushBusy] = useState(false);
    const [confirmClearOpen, setConfirmClearOpen] = useState(false);

    useEffect(() => {
        isPushSubscribed().then(setPushEnabled);
    }, []);

    const togglePush = async () => {
        setPushBusy(true);
        try {
            if (pushEnabled) {
                await disablePushNotifications();
                setPushEnabled(false);
            } else {
                const ok = await enablePushNotifications();
                setPushEnabled(ok);
            }
        } finally {
            setPushBusy(false);
        }
    };

    const fetchUnreadCount = useCallback(async () => {
        try {
            const res = await api.get("/notifications/unread-count");
            setUnreadCount(res.data?.unreadCount || 0);
        } catch (err) {
            // Silent fail — badge just won't update, no need to alarm the user
        }
    }, []);

    const fetchNotifications = useCallback(async () => {
        setLoading(true);
        try {
            const res = await api.get("/notifications?limit=10");
            setNotifications(res.data?.data || []);
            setUnreadCount(res.data?.unreadCount || 0);
        } catch (err) {
            console.error("Fetch notifications error:", err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchUnreadCount();
        const interval = setInterval(fetchUnreadCount, POLL_INTERVAL);
        return () => clearInterval(interval);
    }, [fetchUnreadCount]);

    const handleOpenChange = (isOpen) => {
        setOpen(isOpen);
        if (isOpen) fetchNotifications();
    };

    const markOneAsRead = async (id) => {
        try {
            await api.patch(`/notifications/${id}/read`);
            setNotifications((prev) =>
                prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
            );
            setUnreadCount((prev) => Math.max(0, prev - 1));
        } catch (err) {
            console.error("Mark read error:", err);
        }
    };

    const markAllAsRead = async () => {
        try {
            await api.patch("/notifications/read-all");
            setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
            setUnreadCount(0);
        } catch (err) {
            console.error("Mark all read error:", err);
        }
    };

    const deleteOne = async (id, wasUnread, e) => {
        e.stopPropagation(); // dropdown item ka onClick (markAsRead) trigger na ho
        try {
            await api.delete(`/notifications/${id}`);
            setNotifications((prev) => prev.filter((n) => n._id !== id));
            if (wasUnread) setUnreadCount((prev) => Math.max(0, prev - 1));
        } catch (err) {
            console.error("Delete notification error:", err);
        }
    };

    const deleteAll = async () => {
        try {
            await api.delete("/notifications");
            setNotifications([]);
            setUnreadCount(0);
        } catch (err) {
            console.error("Delete all notifications error:", err);
        } finally {
            setConfirmClearOpen(false);
        }
    };

    return (
        <DropdownMenu open={open} onOpenChange={handleOpenChange}>
            <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon" className="relative">
                    <Bell className="h-4 w-4" />
                    {unreadCount > 0 && (
                        <Badge
                            variant="destructive"
                            className="absolute -top-1.5 -right-1.5 h-5 min-w-5 rounded-full px-1 text-[10px] flex items-center justify-center"
                        >
                            {unreadCount > 9 ? "9+" : unreadCount}
                        </Badge>
                    )}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
                <div className="flex items-center justify-between px-2 py-1.5">
                    <DropdownMenuLabel className="p-0">Notifications</DropdownMenuLabel>
                    <div className="flex items-center gap-2">
                        {isPushSupported() && getPushPermission() !== "denied" && (
                            <button
                                onClick={(e) => {
                                    e.preventDefault();
                                    togglePush();
                                }}
                                disabled={pushBusy}
                                title={pushEnabled ? "Disable browser push notifications" : "Enable browser push notifications"}
                                className="text-muted-foreground hover:text-foreground disabled:opacity-50"
                            >
                                {pushEnabled ? <BellRing className="h-3.5 w-3.5" /> : <BellOff className="h-3.5 w-3.5" />}
                            </button>
                        )}
                        {unreadCount > 0 && (
                            <button
                                onClick={markAllAsRead}
                                className="text-xs text-muted-foreground hover:text-foreground underline"
                            >
                                Mark all read
                            </button>
                        )}
                        {notifications.length > 0 && (
                            <AlertDialog open={confirmClearOpen} onOpenChange={setConfirmClearOpen}>
                                <AlertDialogTrigger asChild>
                                    <button
                                        onClick={(e) => e.preventDefault()}
                                        className="text-xs text-muted-foreground hover:text-destructive underline"
                                    >
                                        Clear all
                                    </button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                        <AlertDialogTitle>Delete all notifications?</AlertDialogTitle>
                                        <AlertDialogDescription>
                                            This will permanently remove all your notifications. This action cannot be undone.
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                        <AlertDialogAction onClick={deleteAll}>Delete all</AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        )}
                    </div>
                </div>
                <DropdownMenuSeparator />

                <ScrollArea className="max-h-80">
                    {loading && (
                        <div className="px-3 py-6 text-center text-sm text-muted-foreground">
                            Loading...
                        </div>
                    )}

                    {!loading && notifications.length === 0 && (
                        <div className="px-3 py-6 text-center text-sm text-muted-foreground">
                            No notifications yet
                        </div>
                    )}

                    {!loading &&
                        notifications.map((n) => (
                            <DropdownMenuItem
                                key={n._id}
                                onClick={() => !n.isRead && markOneAsRead(n._id)}
                                className={`group relative flex flex-col items-start gap-0.5 whitespace-normal py-2 pr-7 ${
                                    !n.isRead ? "bg-accent/60" : ""
                                }`}
                            >
                                <button
                                    onClick={(e) => deleteOne(n._id, !n.isRead, e)}
                                    title="Delete notification"
                                    className="absolute right-1.5 top-1.5 rounded p-0.5 text-muted-foreground opacity-0 hover:text-destructive hover:bg-destructive/10 group-hover:opacity-100"
                                >
                                    <X className="h-3.5 w-3.5" />
                                </button>
                                <div className="flex w-full items-center justify-between gap-2">
                                    <span className="text-sm font-medium">{n.title}</span>
                                    {!n.isRead && (
                                        <span className="h-2 w-2 shrink-0 rounded-full bg-blue-500" />
                                    )}
                                </div>
                                <span className="text-xs text-muted-foreground">{n.message}</span>
                                <span className="text-[10px] text-muted-foreground">
                                    {timeAgo(n.createdAt)}
                                </span>
                            </DropdownMenuItem>
                        ))}
                </ScrollArea>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}

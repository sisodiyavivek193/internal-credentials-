import React, { useEffect, useState } from "react";
import {
    Table,
    TableHeader,
    TableBody,
    TableRow,
    TableHead,
    TableCell,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import api from "@/services/api_axios";

const ACTION_COLORS = {
    ADD_PROJECT: "default",
    UPDATE_PROJECT: "secondary",
    DELETE: "destructive",
    REVOKE: "destructive",
    RESTORE: "secondary",
    BULK_DELETE: "destructive",
    BULK_REVOKE: "destructive",
    BULK_RESTORE: "secondary",
    PASSWORD_COPY: "outline",
    VIEW_ALL_PASSWORDS: "outline",
    LOGIN_SUCCESS_2FA: "default",
    LOGOUT_SUCCESS: "outline",
    CREATE_USER: "default",
    UPDATE_USER: "secondary",
    DELETE_USER: "destructive",
    REVOKE_USER: "destructive",
    RESTORE_USER: "secondary",
    BULK_DELETE_USERS: "destructive",
    BULK_REVOKE_USERS: "destructive",
    BULK_RESTORE_USERS: "secondary",
};

export default function AuditLogs() {
    const [logs, setLogs] = useState([]);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [loading, setLoading] = useState(false);
    const [userIdFilter, setUserIdFilter] = useState("");

    const LIMIT = 20;

    const fetchLogs = async () => {
        setLoading(true);
        try {
            const params = { page, limit: LIMIT };
            if (userIdFilter) params.userId = userIdFilter;

            const res = await api.get("/admin/audit-logs", { params });
            setLogs(res.data?.data || []);
            setTotalPages(res.data?.pagination?.totalPages || 1);
        } catch (error) {
            console.error("Failed to fetch audit logs:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLogs();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [page]);

    const handleSearch = (e) => {
        e.preventDefault();
        setPage(1);
        fetchLogs();
    };

    return (
        <div>
            <div className="mb-4 flex items-center justify-between">
                <h1 className="text-2xl font-bold">Audit Logs</h1>
            </div>

            <form onSubmit={handleSearch} className="mb-4 flex gap-2">
                <Input
                    placeholder="Filter by user id..."
                    value={userIdFilter}
                    onChange={(e) => setUserIdFilter(e.target.value)}
                    className="max-w-xs"
                />
                <Button type="submit">Filter</Button>
                {userIdFilter && (
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                            setUserIdFilter("");
                            setPage(1);
                            setTimeout(fetchLogs, 0);
                        }}
                    >
                        Clear
                    </Button>
                )}
            </form>

            <Separator className="mb-4" />

            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Date</TableHead>
                            <TableHead>Actor Role</TableHead>
                            <TableHead>Action</TableHead>
                            <TableHead>Project / Target</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading && (
                            <TableRow>
                                <TableCell colSpan={4} className="text-center py-6 text-muted-foreground">
                                    Loading...
                                </TableCell>
                            </TableRow>
                        )}
                        {!loading && logs.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={4} className="text-center py-6 text-muted-foreground">
                                    No audit logs found
                                </TableCell>
                            </TableRow>
                        )}
                        {!loading &&
                            logs.map((log) => (
                                <TableRow key={log._id}>
                                    <TableCell className="whitespace-nowrap text-sm">
                                        {new Date(log.createdAt).toLocaleString()}
                                    </TableCell>
                                    <TableCell className="capitalize">{log.actorRole}</TableCell>
                                    <TableCell>
                                        <Badge variant={ACTION_COLORS[log.action] || "outline"}>
                                            {log.action}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>{log.projectName || "N/A"}</TableCell>
                                </TableRow>
                            ))}
                    </TableBody>
                </Table>
            </div>

            <div className="mt-4 flex items-center justify-between">
                <Button
                    variant="outline"
                    disabled={page <= 1}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                >
                    Previous
                </Button>
                <span className="text-sm text-muted-foreground">
                    Page {page} of {totalPages}
                </span>
                <Button
                    variant="outline"
                    disabled={page >= totalPages}
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                >
                    Next
                </Button>
            </div>
        </div>
    );
}

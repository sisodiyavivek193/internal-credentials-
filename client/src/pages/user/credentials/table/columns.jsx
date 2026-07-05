import React from 'react';
import { Badge } from '@/components/ui/badge';
import Details from './Details';

// 🔒 Read-only columns for normal role users.
// No "select" checkbox column and NO "actions" column
// (no edit / revoke / delete) — user can only VIEW their own role's credentials.
export const columns = () => {
    return [
        {
            accessorKey: 'projectName',
            header: 'Project Name',
        },
        {
            accessorKey: 'roles',
            header: 'Roles',
            cell: ({ row }) => {
                const variations = row.original.roles || [];
                return (
                    <div className="flex gap-1 flex-wrap">
                        {variations.map((r, i) => (
                            <Badge key={i} variant="outline">{r}</Badge>
                        ))}
                    </div>
                );
            }
        },
        {
            accessorKey: 'projectUrl',
            header: 'Project Url',
        },
        {
            header: 'Date',
            id: 'date',
            cell: ({ row }) => {
                const date = new Date(row.original.createdAt);
                const formatted = date.toLocaleDateString('en-US', {
                    day: '2-digit',
                    month: 'long',
                    year: 'numeric'
                });
                return <>{formatted}</>;
            },
        },
        {
            header: 'Details',
            id: 'details',
            cell: ({ row }) => (
                <Details data={row.original} />
            ),
        },
    ];
}

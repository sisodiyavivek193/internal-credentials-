import React from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import CellAction from './cell-action';
import { Badge } from '@/components/ui/badge';
import Details from './Details';

export const columns = ({ onRefresh }) => {
    return [
        {
            id: 'select',
            header: ({ table }) => (
                <Checkbox
                    checked={
                        table.getIsAllPageRowsSelected() ||
                        (table.getIsSomePageRowsSelected() && 'indeterminate')
                    }
                    onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
                    aria-label='Select all'
                    className='translate-y-2'
                />
            ),
            cell: ({ row }) => (
                <Checkbox
                    checked={row.getIsSelected()}
                    onCheckedChange={(value) => row.toggleSelected(!!value)}
                    aria-label='Select row'
                    className='translate-y-2'
                />
            ),
            enableSorting: false,
            enableHiding: false,
            meta: {
                rowClass: (row) => !row.original.isActive ? "opacity-50" : ""
            },
        },
        {
            accessorKey: 'projectName',
            header: '   ',
        },
        {
            accessorKey: 'roles',
            header: 'roles',
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
            header: 'projSectUrl',
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
        {
            header: 'Actions',
            id: 'actions',
            cell: ({ row }) => <CellAction data={row.original} onRefresh={onRefresh} />,
        },
    ];
}
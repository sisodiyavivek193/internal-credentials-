import { useId, useState } from "react"
import {
    useReactTable,
    getCoreRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    flexRender,
    getSortedRowModel,
    getFacetedUniqueValues
} from '@tanstack/react-table';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { ScrollArea, ScrollBar } from './scroll-area';
import { DataTablePagination } from "./DataTablePagination";
import { cn } from "@/lib/utils";

function DataTable({ columns, data, searchKey, toolbar, pagination, setPagination }) {

    const id = useId()
    const [columnFilters, setColumnFilters] = useState([])
    const [columnVisibility, setColumnVisibility] = useState({})

    const table = useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        enableSortingRemoval: false,
        onColumnFiltersChange: setColumnFilters,
        onColumnVisibilityChange: setColumnVisibility,
        getFilteredRowModel: getFilteredRowModel(),
        getFacetedUniqueValues: getFacetedUniqueValues(),
        // Server Side Mode
        manualPagination: true,
        pageCount: pagination.totalPages,
        state: {
            pagination: {
                pageIndex: pagination.page - 1,
                pageSize: pagination.limit,
            },
            columnFilters,
            columnVisibility,
        },

        onPaginationChange: (updater) => {
            const prev = {
                pageIndex: pagination.page - 1,
                pageSize: pagination.limit,
            };

            const next = typeof updater === "function" ? updater(prev) : updater;

            setPagination((p) => ({
                ...p,
                page: next.pageIndex + 1,
                limit: next.pageSize,
            }));
        },
    });

    return (
        <>

            {toolbar && toolbar(table, searchKey)}

            <ScrollArea type="always" className="max-h-[calc(80vh-220px)] min-w-max rounded-md border md:h-[calc(85dvh-200px)]">
                <Table className="relative">
                    <TableHeader className="bg-gray-50 sticky top-0 z-10">
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id}>
                                {headerGroup.headers.map((header) => {
                                    return (
                                        <TableHead
                                            key={header.id}
                                            colSpan={header.colSpan}
                                            className={cn(
                                                header.column.columnDef.meta?.className,
                                                header.column.columnDef.meta?.thClassName
                                            )}
                                        >
                                            {header.isPlaceholder
                                                ? null
                                                : flexRender(
                                                    header.column.columnDef.header,
                                                    header.getContext()
                                                )}
                                        </TableHead>
                                    )
                                })}
                            </TableRow>
                        ))}
                    </TableHeader>

                    {/* <TableBody>
                        {table.getRowModel().rows.length ? (
                            table.getRowModel().rows.map((row) => (
                                <TableRow
                                    key={row.id}
                                    data-state={row.getIsSelected() ? 'selected' : undefined}
                                // className={!row.original.isActive ? "opacity-50" : ""}
                                >
                                    {row.getVisibleCells().map((cell) => (
                                        <TableCell key={cell.id}>
                                            {flexRender(
                                                cell.column.columnDef.cell,
                                                cell.getContext()
                                            )}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell
                                    colSpan={columns.length}
                                    className="h-24 text-center"
                                >
                                    No results.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody> */}


                    <TableBody>
                        {table.getRowModel().rows.length ? (
                            table.getRowModel().rows.map((row) => {
                                // --- DYNAMIC ROW CLASS LOGIC ---
                                // Ye line har column check karegi aur meta.rowClass ko execute karegi
                                const dynamicClasses = row.getVisibleCells().map(cell =>
                                    cell.column.columnDef.meta?.rowClass?.(row)
                                ).filter(Boolean); // null values hata dega

                                return (
                                    <TableRow
                                        key={row.id}
                                        className={cn(
                                            ...dynamicClasses, // Saari dynamic classes yahan apply ho jayengi
                                        )}
                                    >
                                        {row.getVisibleCells().map((cell) => (
                                            <TableCell key={cell.id}>
                                                {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                            </TableCell>
                                        ))}
                                    </TableRow>
                                );
                            })
                        ) : (
                            <TableRow>
                                <TableCell colSpan={columns.length} className="h-24 text-center">
                                    No results.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>

                </Table>
                <ScrollBar orientation="horizontal" />
                <ScrollBar orientation="vertical" />
            </ScrollArea >

            <div className="flex justify-end pt-4">
                <DataTablePagination
                    table={table} />
            </div>
        </>
    );
}

export default DataTable;
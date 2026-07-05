import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger
} from "@/components/ui/alert-dialog"

import {
    Popover,
    PopoverTrigger,
    PopoverContent
} from "@/components/ui/popover"

import {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuLabel,
    DropdownMenuItem,
    DropdownMenuSeparator
} from "@/components/ui/dropdown-menu"

import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList
} from "@/components/ui/command"

import {
    ListFilter,
    Trash,
    CircleX,
    Check,
    Settings2,
    ChevronsUpDown,
    ArrowUpDown,
    CircleAlert,
} from "lucide-react"

import { cn, toSentenceCase } from "@/lib/utils"
import { useRef, useId } from "react"
import api from "@/services/api_axios"

export function DataTableToolbar({ table, onRefresh }) {
    const inputRef = useRef(null)
    const triggerRef = useRef(null)
    const id = useId()

    // Selected rows logic
    const selectedRows = table.getSelectedRowModel().rows;
    const selectedCount = selectedRows.length;
    const selected = selectedRows.map(r => r.original);

    const hasRevoked = selected.some(r => r.isActive === false);
    const hasActive = selected.some(r => r.isActive === true);

    const mixed = hasRevoked && hasActive;

    // Helper
    const getIds = () => selectedRows.map(r => r.original._id)

    // API actions
    const handleDelete = async () => {
        try {
            await api.post("/admin/users/bulk-delete", {
                ids: getIds()
            });
            onRefresh();
            table.resetRowSelection();
        } catch (err) {
            console.error("BULK DELETE ERROR:", err);
        }
    }

    const handleRevoke = async () => {
        try {
            await api.post("/admin/users/bulk-revoke", {
                ids: getIds()
            });
            onRefresh();
            table.resetRowSelection();
        } catch (err) {
            console.error("BULK REVOKE ERROR:", err);
        }
    }

    const handleUnrevoke = async () => {
        try {
            await api.post("/admin/users/bulk-restore", {
                ids: getIds()
            });
            onRefresh();
            table.resetRowSelection();
        } catch (err) {
            console.error("BULK UNREVOKE ERROR:", err);
        }
    }


    return (
        <div className="flex py-5 flex-wrap items-center justify-between gap-3">

            {/* LEFT SIDE - FILTER */}
            <div className="flex items-center gap-3">
                <div className="relative">
                    <Input
                        id={`${id}-input`}
                        ref={inputRef}
                        className={cn(
                            "peer min-w-60 ps-9",
                            Boolean(table.getColumn("email")?.getFilterValue()) && "pe-9"
                        )}
                        value={table.getColumn("email")?.getFilterValue() ?? ""}
                        onChange={(e) => table.getColumn("email")?.setFilterValue(e.target.value)}
                        placeholder="Filter by name or email..."
                        type="text"
                    />
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground/80">
                        <ListFilter size={16} />
                    </div>
                    {Boolean(table.getColumn("email")?.getFilterValue()) && (
                        <button
                            className="absolute inset-y-0 right-0 flex w-9 items-center justify-center"
                            onClick={() => {
                                table.getColumn("email")?.setFilterValue("")
                                inputRef.current?.focus()
                            }}
                        >
                            <CircleX size={16} />
                        </button>
                    )}
                </div>
            </div>


            {/* RIGHT SIDE BUTTONS */}
            <div className="flex items-center gap-3">
                {selectedCount > 0 && (
                    <>
                        {/* DELETE */}
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button variant="outline">
                                    <Trash size={16} className="mr-2" />
                                    Delete ({selectedCount})
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <div className="flex items-start gap-3">
                                    <CircleAlert size={22} className="opacity-80 mt-1" />
                                    <div>
                                        <AlertDialogHeader>
                                            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                            <AlertDialogDescription>
                                                This action cannot be undone.
                                            </AlertDialogDescription>
                                        </AlertDialogHeader>
                                    </div>
                                </div>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>

                        {/* REVOKE */}
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button variant="outline" disabled={mixed || !hasActive}>
                                    Revoke ({selectedCount})
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>Confirm Revoke?</AlertDialogTitle>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction onClick={handleRevoke}>Revoke</AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>

                        {/* UNREVOKE */}
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button variant="outline" disabled={mixed || !hasRevoked}>
                                    Unrevoke ({selectedCount})
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>Confirm Unrevoke?</AlertDialogTitle>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction onClick={handleUnrevoke}>Unrevoke</AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    </>
                )}

                {/* VIEW COLUMNS */}
                <Popover modal>
                    <PopoverTrigger asChild>
                        <Button
                            ref={triggerRef}
                            aria-label="Toggle columns"
                            variant="outline"
                            size="sm"
                            className="ml-auto hidden h-8 gap-2 lg:flex"
                        >
                            <Settings2 className="size-4" />
                            View
                            <ChevronsUpDown className="ml-auto size-4 opacity-50" />
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent align="end" className="w-44 p-0" onCloseAutoFocus={() => triggerRef.current?.focus()}>
                        <Command>
                            <CommandInput placeholder="Search columns..." />
                            <CommandList>
                                <CommandEmpty>No columns found.</CommandEmpty>
                                <CommandGroup>
                                    {table.getAllColumns()
                                        .filter(col => col.getCanHide())
                                        .map(col => (
                                            <CommandItem
                                                key={col.id}
                                                onSelect={() => col.toggleVisibility(!col.getIsVisible())}
                                            >
                                                {toSentenceCase(col.id)}
                                                <Check className={cn("ml-auto size-4", col.getIsVisible() ? "opacity-100" : "opacity-0")} />
                                            </CommandItem>
                                        ))}
                                </CommandGroup>
                            </CommandList>
                        </Command>
                    </PopoverContent>
                </Popover>

                {/* SORT */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline">
                            <ArrowUpDown className="mr-2 size-4 opacity-60" />
                            Sort
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Sort by</DropdownMenuLabel>
                        {table.getAllColumns()
                            .filter(col => col.getCanSort())
                            .map(col => (
                                <DropdownMenuItem key={col.id} onClick={() => col.toggleSorting(col.getIsSorted() === "asc")}>
                                    {col.id}
                                    {col.getIsSorted() === "asc" && " (asc)"}
                                    {col.getIsSorted() === "desc" && " (desc)"}
                                </DropdownMenuItem>
                            ))}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => table.resetSorting()}>
                            Reset sorting
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </div>
    )
}

import { Input } from "@/components/ui/input"
import { ListFilter, CircleX } from "lucide-react"
import { cn } from "@/lib/utils"
import { useRef, useId } from "react"

// 🔒 Read-only toolbar — sirf search hai.
// Koi bulk delete / revoke / restore nahi hai kyunki normal role user
// sirf apna data dekh sakta hai, kisi bhi tarah ka action nahi le sakta.
export function DataTableToolbar({ table }) {
    const inputRef = useRef(null)
    const id = useId()

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
                            Boolean(table.getColumn("projectName")?.getFilterValue()) && "pe-9"
                        )}
                        value={table.getColumn("projectName")?.getFilterValue() ?? ""}
                        onChange={(e) => table.getColumn("projectName")?.setFilterValue(e.target.value)}
                        placeholder="Filter by project name..."
                        type="text"
                    />
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground/80">
                        <ListFilter size={16} />
                    </div>
                    {Boolean(table.getColumn("projectName")?.getFilterValue()) && (
                        <button
                            className="absolute inset-y-0 right-0 flex w-9 items-center justify-center"
                            onClick={() => {
                                table.getColumn("projectName")?.setFilterValue("")
                                inputRef.current?.focus()
                            }}
                        >
                            <CircleX size={16} />
                        </button>
                    )}
                </div>
            </div>
        </div>
    )
}

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Edit, RefreshCw, Trash, Trash2, Undo } from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { toast } from 'sonner';
import api from '@/services/api_axios';
import { useRouter } from '@/routes/hooks';

const CellAction = ({ data, onRefresh }) => {
    const [loading, setLoading] = useState(false);
    const [deleteOpen, setDeleteOpen] = useState(false);
    const [revokeOpen, setRevokeOpen] = useState(false);

    const router = useRouter();

    const onDeleteConfirm = async () => {
        setLoading(true);
        try {
            await api.delete(`/admin/users/${data._id}`);
            toast.success("Deleted");

            // 👇 refresh the table
            onRefresh && onRefresh();

            setDeleteOpen(false);
        } catch (err) {
            toast.error("Delete failed!");
        }
        setLoading(false);
    };

    const onRevokeConfirm = async () => {
        setLoading(true);
        try {
            if (data.isActive) {
                await api.patch(`/admin/users/${data._id}/revoke`);
            } else {
                await api.patch(`/admin/users/${data._id}/restore`);
            }
            toast.success(data.isActive ? "Revoked!" : "Restored!");

            // 👇 refresh the table
            onRefresh && onRefresh();

        } catch (err) {
            toast.error("Failed...");
        }

        setLoading(false);
        setRevokeOpen(false);
    };

    const navigateToUpdatePage = () => {
        router.push(`/admin/user/${data._id}`);
    };

    return (

        <div className="space-x-3 w-18">

            <Button variant='outline' onClick={navigateToUpdatePage} size='icon'>
                <Edit className="h-4 w-4" />
            </Button>

            {/* 👉 REVOKE BUTTON */}
            <Button
                variant='outline'
                size='icon'
                onClick={() => setRevokeOpen(true)}
            >
                {
                    data.isActive ? (
                        <>
                            <Undo className="w-4 h-4" />
                            <span className='sr-only'>Revoke</span>
                        </>
                    ) : (
                        <>
                            <RefreshCw className="w-4 h-4" />
                            <span className='sr-only'>Restore</span>
                        </>
                    )
                }
            </Button>

            {/* 👉 DELETE BUTTON */}
            < Button variant='outline' size='icon' onClick={() => setDeleteOpen(true)}>
                <Trash2 className="h-4 w-4 text-red-500" />
            </Button >


            <Dialog open={revokeOpen} onOpenChange={setRevokeOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>
                            {data.isActive ? "Confirm Revoke" : "Confirm Restore"}
                        </DialogTitle>
                        <DialogDescription>
                            {data.isActive
                                ? "Are you sure you want to revoke this user's access?"
                                : "Are you sure you want to restore this user's access?"
                            }
                        </DialogDescription>
                    </DialogHeader>

                    <div className="flex justify-end gap-3 mt-4">
                        <Button variant="outline" onClick={() => setRevokeOpen(false)}>
                            Cancel
                        </Button>

                        <Button
                            variant={"default"}
                            onClick={onRevokeConfirm}
                            disabled={loading}
                        >
                            {loading
                                ? data.isActive ? "Revoking..." : "Restoring..."
                                : data.isActive ? "Revoke" : "Restore"
                            }
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>

            {/* === DELETE DIALOG === */}
            <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Confirm Delete</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete this user? This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="flex justify-end gap-3 mt-4">
                        <Button variant="outline" onClick={() => setDeleteOpen(false)}>
                            Cancel
                        </Button>
                        <Button variant="destructive" onClick={onDeleteConfirm} disabled={loading}>
                            <Trash size={16} />
                            {loading ? "Deleting..." : "Delete"}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div >

    );
};

export default CellAction;

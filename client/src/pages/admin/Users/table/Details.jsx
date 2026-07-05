import React, { useState } from "react";

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import api from "@/services/api_axios";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckIcon, CopyIcon, Eye, Loader2, RefreshCw } from "lucide-react";
import { toast } from "sonner";

import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger
} from "@/components/ui/tabs";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

// 🔐 Ek random, reasonably strong password generate karta hai (client-side only)
const generatePassword = (length = 12) => {
    const chars =
        "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$%";
    let pwd = "";
    for (let i = 0; i < length; i++) {
        pwd += chars[Math.floor(Math.random() * chars.length)];
    }
    return pwd;
};

const Details = ({ data }) => {
    const [open, setOpen] = useState(false);
    const [viewItem, setViewItem] = useState(null);
    const [qrData, setQrData] = useState(null);
    const [qrLoading, setQrLoading] = useState(false);
    const [qrError, setQrError] = useState(null);

    // 🔐 Reset password state
    const [newPassword, setNewPassword] = useState(null); // sirf reset hone ke baad ek baar ke liye set hota hai
    const [resetLoading, setResetLoading] = useState(false);
    const [copied, setCopied] = useState(false);

    const handleCopy = async (value) => {
        await navigator.clipboard.writeText(value);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
    };

    const handleResetPassword = async (userId) => {
        setResetLoading(true);
        try {
            const generated = generatePassword();
            await api.put(`/admin/users/${userId}`, { password: generated });
            setNewPassword(generated); // ek baar ke liye plaintext dikhane/copy karne ke liye
            toast.success(`Naya password: ${generated}`, {
                description: "Isse abhi copy/save kar lo, dobara plaintext me nahi dikhega. 2FA alag hai, dobara setup nahi karna padega.",
                duration: 15000,
            });
        } catch (err) {
            toast.error(err.response?.data?.message || "Password reset fail ho gaya");
        } finally {
            setResetLoading(false);
        }
    };

    const openDetails = async (item) => {
        setViewItem(item); // row data se turant kuch dikha dein (email/role/status)
        setOpen(true); // open dialog
        setQrData(null);
        setQrError(null);
        setQrLoading(true);
        setNewPassword(null); // pichla generated password hide kar do jab naya user open ho

        // 👉 Full user details (twoFactorEnabled, updatedAt, etc.) fetch karein
        try {
            const detailRes = await api.get(`/admin/users/${item._id}`);
            setViewItem(detailRes.data);
        } catch (err) {
            // agar ye fail ho jaye toh bhi row data se kaam chal jayega
        }

        // 👉 QR Code alag se fetch karein
        try {
            const res = await api.get(`/admin/users/${item._id}/qrcode`);
            setQrData(res.data);
        } catch (err) {
            setQrError(
                err.response?.data?.message || "Failed to load QR code"
            );
        } finally {
            setQrLoading(false);
        }
    };

    const formatDate = (value) => {
        if (!value) return "N/A";
        return new Date(value).toLocaleDateString("en-US", {
            day: "2-digit",
            month: "long",
            year: "numeric",
        });
    };

    return (
        <>
            <Button variant='outline' size='icon' onClick={() => openDetails(data)}>
                <Eye className="h-4 w-4" />
            </Button>

            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent className="max-w-lg p-0 bg-white overflow-hidden z-50">

                    <DialogHeader className="px-6 pt-6 pb-4 border-b">
                        <DialogTitle className="text-xl font-bold">
                            {viewItem?.email}
                        </DialogTitle>
                    </DialogHeader>

                    <div className="px-6 py-4">
                        <Tabs defaultValue="details">
                            <TabsList className="grid grid-cols-2">
                                <TabsTrigger value="details">Details</TabsTrigger>
                                <TabsTrigger value="qrcode">QR Code</TabsTrigger>
                            </TabsList>

                            <ScrollArea className="h-[calc(85dvh-300px)] rounded-md p-3 border">

                                {/* === USER DETAILS TAB === */}
                                <TabsContent value="details" className="space-y-3 mt-4">

                                    {/* === RESET PASSWORD (top, so it's visible without scrolling) === */}
                                    <div className="border rounded-lg p-3 text-sm space-y-3">
                                        <div className="flex items-center justify-between gap-2">
                                            <span className="font-semibold">Login Password:</span>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                disabled={resetLoading}
                                                onClick={() => handleResetPassword(viewItem?._id)}
                                            >
                                                <RefreshCw className={`h-4 w-4 mr-1 ${resetLoading ? "animate-spin" : ""}`} />
                                                Reset Password
                                            </Button>
                                        </div>

                                        {!newPassword && (
                                            <p className="text-xs text-gray-500">
                                                Password hashed hai, isliye copy nahi ho sakta. Reset karne par
                                                naya password ek baar yahan (aur toast me) dikhega — 2FA alag
                                                hai, dobara setup nahi karna padega.
                                            </p>
                                        )}

                                        {newPassword && (
                                            <div className="grid grid-cols-3 items-center gap-2 bg-gray-50 rounded-md px-3 py-2">
                                                <span className="font-semibold">New Pass:</span>
                                                <span className="break-all">{newPassword}</span>
                                                <Button
                                                    variant="outline"
                                                    onClick={() => handleCopy(newPassword)}
                                                    className="justify-self-end"
                                                >
                                                    {copied ? (
                                                        <CheckIcon className="stroke-green-600 dark:stroke-green-400" />
                                                    ) : (
                                                        <CopyIcon />
                                                    )}
                                                </Button>
                                            </div>
                                        )}
                                    </div>

                                    <div className="border rounded-lg p-3 text-sm space-y-3">

                                        <div className="grid grid-cols-3 items-center gap-2">
                                            <span className="font-semibold">Email:</span>
                                            <span className="col-span-2 break-all">{viewItem?.email}</span>
                                        </div>

                                        <div className="grid grid-cols-3 items-center gap-2">
                                            <span className="font-semibold">Role:</span>
                                            <span className="col-span-2">
                                                <Badge variant="outline">{viewItem?.role}</Badge>
                                            </span>
                                        </div>

                                        <div className="grid grid-cols-3 items-center gap-2">
                                            <span className="font-semibold">Status:</span>
                                            <span className="col-span-2">
                                                <Badge variant={viewItem?.isActive ? "outline" : "destructive"}>
                                                    {viewItem?.isActive ? "Active" : "Revoked"}
                                                </Badge>
                                            </span>
                                        </div>

                                        <div className="grid grid-cols-3 items-center gap-2">
                                            <span className="font-semibold">2FA:</span>
                                            <span className="col-span-2">
                                                <Badge variant="outline">
                                                    {viewItem?.twoFactorEnabled ? "Enabled" : "Disabled"}
                                                </Badge>
                                            </span>
                                        </div>

                                        <div className="grid grid-cols-3 items-center gap-2">
                                            <span className="font-semibold">Created:</span>
                                            <span className="col-span-2">{formatDate(viewItem?.createdAt)}</span>
                                        </div>

                                        <div className="grid grid-cols-3 items-center gap-2">
                                            <span className="font-semibold">Updated:</span>
                                            <span className="col-span-2">{formatDate(viewItem?.updatedAt)}</span>
                                        </div>
                                    </div>
                                </TabsContent>

                                {/* === QR CODE TAB === */}
                                <TabsContent value="qrcode" className="mt-4">
                                    {qrLoading && (
                                        <div className="flex flex-col items-center justify-center gap-2 text-sm text-gray-500 py-10">
                                            <Loader2 className="h-5 w-5 animate-spin" />
                                            Generating QR code...
                                        </div>
                                    )}

                                    {!qrLoading && qrError && (
                                        <div className="text-red-500 text-sm text-center py-10">
                                            {qrError}
                                        </div>
                                    )}

                                    {!qrLoading && !qrError && qrData?.qrCodeImage && (
                                        <div className="flex flex-col items-center gap-3 py-2">
                                            <img
                                                src={qrData.qrCodeImage}
                                                alt="2FA QR Code"
                                                className="w-48 h-48 border rounded-lg p-2 bg-white"
                                            />
                                            <p className="text-xs text-gray-500 text-center px-4">
                                                Scan this code with an Authenticator app (Google Authenticator / Authy)
                                                to set up or re-link 2FA for <span className="font-medium">{qrData.email}</span>.
                                            </p>
                                            {qrData.secret && (
                                                <div className="text-xs bg-gray-50 border rounded-md px-3 py-2 break-all text-center">
                                                    <span className="font-semibold">Manual key: </span>
                                                    {qrData.secret}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </TabsContent>

                                <ScrollBar orientation="horizontal" />
                            </ScrollArea>
                        </Tabs>
                    </div>
                </DialogContent >
            </Dialog>
        </>
    );
};

export default Details;

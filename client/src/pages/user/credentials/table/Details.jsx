import React, { useState } from "react";

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CheckIcon, CopyIcon, Eye, EyeOff } from "lucide-react";

import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger
} from "@/components/ui/tabs";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

// 🔒 Read-only version of the admin "Details" popup.
// Backend (`/credentials`) already returns the decrypted password
// filtered for the logged-in user's role, so no extra API call is made here.
// User can only VIEW and COPY — there is no edit/add option.
const Details = ({ data }) => {
    const [open, setOpen] = useState(false);
    const [copiedKey, setCopiedKey] = useState(null);
    const [visibleKey, setVisibleKey] = useState(null);

    const logins = Array.isArray(data?.credentials) ? data.credentials : [];

    const handleCopy = async (key, value) => {
        await navigator.clipboard.writeText(value || "");
        setCopiedKey(key);
        setTimeout(() => setCopiedKey(null), 1500);
    };

    return (
        <>
            <Button variant='outline' size='icon' onClick={() => setOpen(true)}>
                <Eye className="h-4 w-4" />
            </Button>

            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent className="max-w-lg p-0 bg-white overflow-hidden z-50">

                    <DialogHeader className="px-6 pt-6 pb-4 border-b">
                        <DialogTitle className="text-xl font-bold">
                            {data?.projectName}
                        </DialogTitle>
                    </DialogHeader>

                    <div className="px-6 py-4">
                        <Tabs defaultValue="creds">
                            <TabsList className="grid grid-cols-2">
                                <TabsTrigger value="creds">Credentials</TabsTrigger>
                                <TabsTrigger value="notes">Notes</TabsTrigger>
                            </TabsList>

                            <ScrollArea className="h-[calc(85dvh-300px)] rounded-md p-3 border">

                                <TabsContent value="creds" className="space-y-3 mt-4">
                                    {logins.length > 0 && logins.map((l, i) => (
                                        <div key={i} className="border rounded-lg p-3 text-sm space-y-2">

                                            {/* USER */}
                                            <div className="grid grid-cols-3 items-center gap-2">
                                                <span className="font-semibold">User:</span>
                                                <span className="truncate">{l.username}</span>

                                                <Button
                                                    variant="outline"
                                                    onClick={() => handleCopy(`user-${i}`, l.username)}
                                                    className="justify-self-end"
                                                >
                                                    {copiedKey === `user-${i}` ? <CheckIcon className='stroke-green-600 dark:stroke-green-400' /> : <CopyIcon />}
                                                </Button>
                                            </div>

                                            {/* PASS */}
                                            <div className="grid grid-cols-3 items-center gap-2">
                                                <span className="font-semibold">Pass:</span>
                                                <span className="truncate flex items-center gap-2">
                                                    {visibleKey === `pass-${i}` ? l.password : '••••••••'}
                                                    <button
                                                        type="button"
                                                        onClick={() => setVisibleKey(visibleKey === `pass-${i}` ? null : `pass-${i}`)}
                                                        className="text-muted-foreground"
                                                    >
                                                        {visibleKey === `pass-${i}` ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                                                    </button>
                                                </span>

                                                <Button
                                                    variant="outline"
                                                    onClick={() => handleCopy(`pass-${i}`, l.password)}
                                                    className="justify-self-end"
                                                >
                                                    {copiedKey === `pass-${i}` ? <CheckIcon className='stroke-green-600 dark:stroke-green-400' /> : <CopyIcon />}
                                                </Button>
                                            </div>
                                        </div>
                                    ))}

                                    {logins.length === 0 && (
                                        <div className="text-gray-500 text-sm">No credentials found for your role</div>
                                    )}
                                </TabsContent>

                                <TabsContent value="notes" className="mt-4">
                                    <div
                                        className="p-3 bg-yellow-50 rounded-lg text-sm"
                                        dangerouslySetInnerHTML={{
                                            __html: data?.projectNotes || "No notes"
                                        }}
                                    />
                                </TabsContent>

                                <ScrollBar orientation="horizontal" />
                            </ScrollArea>
                        </Tabs>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
};

export default Details;

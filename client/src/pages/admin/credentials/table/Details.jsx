import React, { useState } from "react";

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import api from "@/services/api_axios";
import { Button } from "@/components/ui/button";
import { CheckIcon, CopyIcon, Eye } from "lucide-react";

import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger
} from "@/components/ui/tabs";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

const Details = ({ data }) => {
    const [open, setOpen] = useState(false);
    const [viewItem, setViewItem] = useState(null);
    const [extraLogins, setExtraLogins] = useState([]);
    const [copiedKey, setCopiedKey] = useState(null);

    const handleCopy = async (key, value) => {
        await navigator.clipboard.writeText(value);
        setCopiedKey(key);
        setTimeout(() => setCopiedKey(null), 1500);
    };


    const openDetails = async (item) => {
        setViewItem(item);
        setOpen(true); // open dialog
        const res = await api.get(`/admin/credentials/${item._id}/list`);
        console.log("🚀 ~ openDetails ~ res:", res.data)


        setExtraLogins(Array.isArray(res.data) ? res.data : []);
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
                                    {/* Extra Logins */}


                                    {extraLogins.length > 0 && extraLogins.map((l, i) => (
                                        <div key={i} className="border rounded-lg p-3 text-sm space-y-2">

                                            {/* USER */}
                                            <div className="grid grid-cols-3 items-center gap-2">
                                                <span className="font-semibold">User:</span>
                                                <span>{l.username}</span>

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
                                                <span>••••••••</span>

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

                                    {extraLogins.length === 0 && (
                                        <div className="text-gray-500 text-sm">No extra logins found</div>
                                    )}
                                </TabsContent>

                                <TabsContent value="notes" className="mt-4">
                                    <div
                                        className="p-3 bg-yellow-50 rounded-lg text-sm"
                                        dangerouslySetInnerHTML={{
                                            __html: viewItem?.projectNotes || "No notes"
                                        }}
                                    />
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

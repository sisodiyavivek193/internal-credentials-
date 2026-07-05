import React, { useState } from 'react';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { Send } from 'lucide-react';

// 🧩 Static template page — dummy conversations & messages only, no backend/socket.
const conversations = [
    { id: 1, name: 'Project Lead', initials: 'PL', last: 'Sounds good, thanks!', unread: 2 },
    { id: 2, name: 'Design Team', initials: 'DT', last: 'Uploaded the new mockups', unread: 0 },
    { id: 3, name: 'Support', initials: 'SP', last: 'Let us know if anything comes up', unread: 1 },
];

const dummyMessages = [
    { fromMe: false, text: 'Hey, can you check the latest update?' },
    { fromMe: true, text: 'Sure, taking a look now.' },
    { fromMe: false, text: 'Sounds good, thanks!' },
];

const Chats = () => {
    const [activeId, setActiveId] = useState(conversations[0].id);
    const active = conversations.find((c) => c.id === activeId);

    return (
        <div>
            <div className="mb-4">
                <h1 className="text-3xl font-bold">Chats</h1>
                <p className="text-muted-foreground text-sm mt-1">
                    A simple static preview of the chat experience.
                </p>
            </div>

            <Separator className="mb-6" />

            <div className="grid grid-cols-1 md:grid-cols-3 border rounded-lg overflow-hidden">
                {/* Conversation list */}
                <div className="border-r">
                    <ScrollArea className="h-[60vh]">
                        {conversations.map((c) => (
                            <button
                                key={c.id}
                                onClick={() => setActiveId(c.id)}
                                className={cn(
                                    'w-full flex items-center gap-3 p-3 text-left hover:bg-accent transition-colors',
                                    activeId === c.id && 'bg-accent'
                                )}
                            >
                                <div className="h-9 w-9 shrink-0 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-semibold">
                                    {c.initials}
                                </div>
                                <div className="min-w-0 flex-1">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-medium truncate">{c.name}</span>
                                        {c.unread > 0 && (
                                            <span className="ml-2 rounded-full bg-primary text-primary-foreground text-[10px] px-1.5 py-0.5">
                                                {c.unread}
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-xs text-muted-foreground truncate">{c.last}</p>
                                </div>
                            </button>
                        ))}
                    </ScrollArea>
                </div>

                {/* Message thread */}
                <div className="md:col-span-2 flex flex-col h-[60vh]">
                    <div className="p-3 border-b font-medium">{active?.name}</div>

                    <ScrollArea className="flex-1 p-4">
                        <div className="space-y-3">
                            {dummyMessages.map((m, i) => (
                                <div
                                    key={i}
                                    className={cn('flex', m.fromMe ? 'justify-end' : 'justify-start')}
                                >
                                    <div
                                        className={cn(
                                            'max-w-[70%] rounded-lg px-3 py-2 text-sm',
                                            m.fromMe
                                                ? 'bg-primary text-primary-foreground'
                                                : 'bg-muted'
                                        )}
                                    >
                                        {m.text}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </ScrollArea>

                    <div className="p-3 border-t flex items-center gap-2">
                        <Input placeholder="Type a message... (static demo)" disabled />
                        <Button size="icon" disabled>
                            <Send className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Chats;

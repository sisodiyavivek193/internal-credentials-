import React from 'react';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Circle, CircleCheck, Clock } from 'lucide-react';

// 🧩 Static template page — no API calls, no real data.
// Sirf UI structure dikhane ke liye hai jo baad me real data se connect ho sakta hai.
const columnsData = [
    {
        key: 'todo',
        title: 'To Do',
        icon: Circle,
        color: 'text-muted-foreground',
        tasks: [
            { title: 'Review project brief', tag: 'General' },
            { title: 'Update profile details', tag: 'Account' },
            { title: 'Check assigned credentials', tag: 'Access' },
        ],
    },
    {
        key: 'progress',
        title: 'In Progress',
        icon: Clock,
        color: 'text-yellow-600',
        tasks: [
            { title: 'Prepare weekly report', tag: 'Reporting' },
            { title: 'Sync with team lead', tag: 'General' },
        ],
    },
    {
        key: 'done',
        title: 'Done',
        icon: CircleCheck,
        color: 'text-green-600',
        tasks: [
            { title: 'Onboarding checklist', tag: 'Account' },
            { title: 'Setup 2FA', tag: 'Security' },
        ],
    },
];

const Tasks = () => {
    return (
        <div>
            <div className="mb-4">
                <h1 className="text-3xl font-bold">Tasks</h1>
                <p className="text-muted-foreground text-sm mt-1">
                    A simple static overview of your tasks.
                </p>
            </div>

            <Separator className="mb-6" />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {columnsData.map((col) => (
                    <div key={col.key} className="space-y-3">
                        <div className={`flex items-center gap-2 font-semibold ${col.color}`}>
                            <col.icon className="h-4 w-4" />
                            <span>{col.title}</span>
                            <Badge variant="outline">{col.tasks.length}</Badge>
                        </div>

                        {col.tasks.map((task, i) => (
                            <Card key={i} className="py-3">
                                <CardHeader className="px-4 gap-1">
                                    <CardTitle className="text-sm font-medium">
                                        {task.title}
                                    </CardTitle>
                                    <Badge variant="secondary" className="w-fit text-xs">
                                        {task.tag}
                                    </Badge>
                                </CardHeader>
                            </Card>
                        ))}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Tasks;

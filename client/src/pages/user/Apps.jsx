import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import {
    LayoutGrid,
    Figma,
    Github,
    Mail,
    Calendar,
    FileText,
} from 'lucide-react';

// 🧩 Static template page — sirf dummy app tiles, koi backend call nahi.
const apps = [
    { name: 'Figma', description: 'Design files & prototypes', icon: Figma },
    { name: 'GitHub', description: 'Code repositories', icon: Github },
    { name: 'Mail', description: 'Team email inbox', icon: Mail },
    { name: 'Calendar', description: 'Meetings & schedule', icon: Calendar },
    { name: 'Docs', description: 'Shared documents', icon: FileText },
    { name: 'More Apps', description: 'Coming soon', icon: LayoutGrid },
];

const Apps = () => {
    return (
        <div>
            <div className="mb-4">
                <h1 className="text-3xl font-bold">Apps</h1>
                <p className="text-muted-foreground text-sm mt-1">
                    Quick links to your everyday tools.
                </p>
            </div>

            <Separator className="mb-6" />

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {apps.map(({ name, description, icon: Icon }) => (
                    <Card key={name} className="cursor-pointer hover:shadow-md transition-shadow">
                        <CardHeader className="flex flex-row items-center gap-3">
                            <div className="rounded-lg border p-2">
                                <Icon className="h-5 w-5" />
                            </div>
                            <div>
                                <CardTitle className="text-sm font-medium">{name}</CardTitle>
                                <CardDescription className="text-xs">{description}</CardDescription>
                            </div>
                        </CardHeader>
                    </Card>
                ))}
            </div>
        </div>
    );
};

export default Apps;

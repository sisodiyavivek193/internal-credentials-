import React from 'react';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
} from '@/components/ui/sidebar'

import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area'
import { sidebarData } from './data/sidebar-data'
import { NavGroup } from './NavGroup';
import { Link } from 'react-router-dom';

const AppSidebar = () => {
    return (
        <Sidebar className="h-screen flex flex-col">
            <SidebarHeader className="px-4 py-3 shadow">
                <Link to="/" className="flex items-center justify-center">
                    <img
                        src="/img/Logo.svg"
                        alt="Innovative Glance"
                        className="h-10 w-auto object-contain"
                        draggable="false"
                    />
                </Link>
            </SidebarHeader>


            <ScrollArea type="always" className="flex-1 h-[calc(100vh-120px)]">
                <SidebarContent className="pr-2">
                    {sidebarData.navGroups.map((props) => (
                        <NavGroup key={props.title} {...props} />
                    ))}
                </SidebarContent>
                <ScrollBar orientation="vertical" />
            </ScrollArea>

            <SidebarFooter>NavUser</SidebarFooter>
        </Sidebar>

    );
};

export default AppSidebar;

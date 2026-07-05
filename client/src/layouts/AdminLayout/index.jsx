import React from 'react';
import AppSidebar from './components/sidebar/AppSidebar';
import Header from './components/sidebar/Header';
import { Outlet } from 'react-router-dom';
import { SidebarProvider } from '@/components/ui/sidebar';

const AdminLayout = () => {
    return (
        <>
            <div className="lg:flex flex-wrap w-full">
                <div className="w-auto">
                    <AppSidebar />
                </div>
                <div className="flex flex-col flex-1">
                    <Header fixed={true} className='bg-accent' />
                    <main>
                        <div className="mx-auto  w-full">
                            <div className='rounded-[55px] px-8 py-10'>
                                <Outlet />
                            </div>
                        </div>
                    </main>
                </div>
            </div>
        </>
    );
};

export default AdminLayout;
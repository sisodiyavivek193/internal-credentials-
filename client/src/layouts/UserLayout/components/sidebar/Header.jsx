import React from 'react';
import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'
import { Separator } from '@/components/ui/separator'
import { SidebarTrigger } from '@/components/ui/sidebar'
import { Button } from '@/components/ui/button';
import { useRouter } from '@/routes/hooks';
import api from '@/services/api_axios';
import NotificationBell from '@/components/notifications/NotificationBell';

const Header = ({ className, fixed, children, ...props }) => {

    const [offset, setOffset] = useState(0)

    const router = useRouter();

    useEffect(() => {
        const onScroll = () => {
            setOffset(document.body.scrollTop || document.documentElement.scrollTop)
        }

        // Add scroll listener to the body
        document.addEventListener('scroll', onScroll, { passive: true })

        // Clean up the event listener on unmount
        return () => document.removeEventListener('scroll', onScroll)
    }, [])



    const handleLogout = async () => {
        try {
            await api.post("/auth/logout", {}, { withCredentials: true });
            // Redirect to login
            router.push('/');
        } catch (err) {
            console.log("Logout Error:", err);
        }
    };


    return (
        <header
            className={cn(
                'z-50 h-16',
                fixed && 'header-fixed peer/header sticky top-0 w-[inherit]',
                offset > 10 && fixed ? 'shadow' : 'shadow-none',
                className
            )}
            {...props}
        >
            <div
                className={cn(
                    'relative flex h-full items-center gap-3 p-4 sm:gap-4',
                    offset > 10 &&
                    fixed &&
                    'after:absolute after:inset-0 after:-z-10 after:bg-background/20 after:backdrop-blur-lg'
                )}
            >
                <SidebarTrigger variant='outline' className='max-md:scale-125' />
                <Separator orientation='vertical' className='h-6' />
                {/* {children} */}

                <div className="ml-auto flex items-center gap-3">
                    <NotificationBell />
                    <Button onClick={handleLogout}>
                        Logout
                    </Button>
                </div>

            </div>
        </header>
    );
};

export default Header;

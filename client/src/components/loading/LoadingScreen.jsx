import { LoaderIcon } from 'lucide-react';
import React from 'react';

const LoadingScreen = () => {
    return (
        <>
            <div className="min-h-screen flex items-center justify-center">
                <div className='flex items-center gap-4'>
                    <LoaderIcon size={32} className="animate-spin" />
                    <p className='text-xl' >Loading...</p>
                </div>
            </div>
        </>
    );
};

export default LoadingScreen;
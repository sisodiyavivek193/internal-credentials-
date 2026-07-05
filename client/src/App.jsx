import { ThemeProvider } from './theme/theme-provider';
import { Toaster } from 'sonner'
import { useLocation } from "react-router-dom";
import { useEffect } from "react";

export default function App({ children }) {

    useScrollToTop();

    return (
        <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
            {children}
            <Toaster position="top-right" richColors closeButton />
        </ThemeProvider>
    )
}

function useScrollToTop() {
    const { pathname } = useLocation()
    useEffect(() => {
        window.scrollTo(0, 0);
    }, [pathname]);
    return null;
}

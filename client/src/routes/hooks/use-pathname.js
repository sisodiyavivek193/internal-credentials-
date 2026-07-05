import { useMemo } from 'react';
import { useLocation } from 'react-router-dom'; // ✅ correct import

export function usePathname() {
  const { pathname } = useLocation();
  return useMemo(() => pathname, [pathname]);
}

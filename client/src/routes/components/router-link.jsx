import { forwardRef } from 'react';
import { Link } from 'react-router-dom'; // ✅ Correct package

export const RouterLink = forwardRef(function RouterLink({ href, ...other }, ref) {
  return <Link ref={ref} to={href} {...other} />;
});

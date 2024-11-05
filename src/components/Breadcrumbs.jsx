import { useLocation, Link } from 'react-router-dom';
import { useMemo } from 'react';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "./ui/breadcrumb";

const routeNameMap = {
  'dashboard': 'Dashboard',
  'polls': 'Polls',
  'poll': 'Poll Details',
  'create-poll': 'Create Poll',
  'admin': 'Admin Dashboard',
  'voter': 'Voter Dashboard',
  'profile': 'Profile',
  'manage-users': 'Manage Users',
  'manage-roles': 'Manage Roles',
  'voting-history': 'Voting History',
  'managepolls': 'Manage Polls',
  'createpolls': 'Create Polls',
  'reports': 'Reports',
  'settings': 'Settings',
  'logs': 'Audit Logs',
  'edit': 'Edit Poll'
};

export default function Breadcrumbs() {
  const location = useLocation();

  const breadcrumbs = useMemo(() => {
    // Remove trailing slash and split path into segments
    const pathSegments = location.pathname.replace(/\/$/, '').split('/').filter(Boolean);
    
    // Build breadcrumb items
    const items = pathSegments.map((segment, index) => {
      // Build the path up to this point
      const path = `/${pathSegments.slice(0, index + 1).join('/')}`;
      
      // Check if this is a dynamic segment (e.g., poll ID)
      const isDynamicSegment = /^[0-9a-fA-F-]+$/.test(segment);
      
      // Get display name from map or use formatted segment
      let displayName = isDynamicSegment 
        ? '#' + segment.slice(0, 8) // Show truncated ID for dynamic segments
        : (routeNameMap[segment] || segment.charAt(0).toUpperCase() + segment.slice(1));

      // If it's the last item, return it as the current page
      if (index === pathSegments.length - 1) {
        return (
          <BreadcrumbItem key={path}>
            <BreadcrumbPage>{displayName}</BreadcrumbPage>
          </BreadcrumbItem>
        );
      }

      // Otherwise, return it as a link
      return (
        <BreadcrumbItem key={path}>
          <BreadcrumbLink as={Link} to={path}>
            {displayName}
          </BreadcrumbLink>
        </BreadcrumbItem>
      );
    });

    // Add separators between items
    return items.reduce((acc, item, i) => {
      if (i !== 0) {
        acc.push(<BreadcrumbSeparator key={`sep-${i}`} />);
      }
      acc.push(item);
      return acc;
    }, []);

  }, [location.pathname]);

  // Don't render breadcrumbs on the root path
  if (location.pathname === '/') {
    return null;
  }

  return (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink as={Link} to="/">
            Home
          </BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        {breadcrumbs}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
import { useLocation, Link } from 'react-router-dom';
import { useMemo, useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import {
  Breadcrumb,
  BreadcrumbItem,
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
  const [pollNames, setPollNames] = useState({});

  // Fetch poll names for any poll IDs in the path
  useEffect(() => {
    const fetchPollNames = async () => {
      const pathSegments = location.pathname.split('/').filter(Boolean);
      
      for (const segment of pathSegments) {
        // Check if segment looks like a poll ID and we don't already have its name
        if (/^[0-9a-fA-F-]+$/.test(segment) && !pollNames[segment]) {
          try {
            const pollDoc = await getDoc(doc(db, 'polls', segment));
            if (pollDoc.exists()) {
              // Use the poll's question as the display name
              const pollData = pollDoc.data();
              setPollNames(prev => ({
                ...prev,
                [segment]: pollData.question || 'Untitled Poll'
              }));
            }
          } catch (error) {
            console.error('Error fetching poll name:', error);
          }
        }
      }
    };

    fetchPollNames();
  }, [location.pathname]);

  const breadcrumbs = useMemo(() => {
    const pathSegments = location.pathname.replace(/\/$/, '').split('/').filter(Boolean);
    
    const items = pathSegments.map((segment, index) => {
      const path = `/${pathSegments.slice(0, index + 1).join('/')}`;
      
      const isDynamicSegment = /^[0-9a-fA-F-]+$/.test(segment);
      
      let displayName = isDynamicSegment 
        ? (pollNames[segment] || 'Loading...') 
        : (routeNameMap[segment] || segment.charAt(0).toUpperCase() + segment.slice(1));

      // Truncate long poll names in breadcrumb
      if (isDynamicSegment && displayName.length > 30) {
        displayName = displayName.substring(0, 30) + '...';
      }

      if (index === pathSegments.length - 1) {
        return (
          <BreadcrumbItem key={path}>
            <BreadcrumbPage>{displayName}</BreadcrumbPage>
          </BreadcrumbItem>
        );
      }

      return (
        <BreadcrumbItem key={path}>
          <Link 
            to={path}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            {displayName}
          </Link>
        </BreadcrumbItem>
      );
    });

    return items.reduce((acc, item, i) => {
      if (i !== 0) {
        acc.push(<BreadcrumbSeparator key={`sep-${i}`} />);
      }
      acc.push(item);
      return acc;
    }, []);

  }, [location.pathname, pollNames]);

  if (location.pathname === '/') {
    return null;
  }

  return (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          <Link 
            to="/"
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            Home
          </Link>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        {breadcrumbs}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
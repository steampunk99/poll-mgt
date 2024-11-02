import React, { useState, useEffect, useContext } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { auth, db } from '../../lib/firebase';
import { signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { Button } from "../../components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "../../components/ui/avatar";
import { Sheet, SheetContent, SheetTrigger } from "../../components/ui/sheet";
import { ScrollArea } from "../../components/ui/scroll-area";
import { DarkModeContext } from '@/context/DarkMode';
import { Separator } from "../../components/ui/separator";

import {
  Home,
  BarChart2,
  FileText,
  Vote,
  History,
  Menu,
  Moon,
  Sun,
  LogOut,
  User2Icon,
  Waypoints,
  Settings2
} from 'lucide-react';
import { useToast } from "../../hooks/use-toast";

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { darkMode, toggleDarkMode } = useContext(DarkModeContext);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (currentUser) => {
      if (currentUser) {
        const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
        setUser({
          ...currentUser,
          role: userDoc.data()?.role || 'voter',
        });
      } else {
        setUser(null);
      }
    });
  
    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      toast({
        title: "Logged out successfully",
        description: "You have been logged out of your account.",
      });
      navigate('/login');
    } catch (error) {
      console.error("Error logging out:", error);
      toast({
        title: "Error",
        description: "Failed to log out. Please try again.",
        variant: "destructive",
      });
    }
  };

  const NavItem = ({ to, icon: Icon, children }) => {
    const isActive = location.pathname === to;
    return (
      <Link
        to={to}
        className={`flex items-center space-x-2 px-3 py-2 rounded-md text-xs transition-colors ${
          isActive
            ? 'bg-foreground/10 text-foreground font-bold'
            : 'hover:bg-secondary/80 text-foreground'
        }`}
      >
        <Icon className="h-4 w-4" />
        <span>{children}</span>
      </Link>
    );
  };

  const SidebarContent = () => (
    <div className="flex fixed flex-col h-full border-r px-12">
      <div className="p-6 border-b">
        <div className="flex items-center space-x-3">
          <Avatar className="h-8 w-8">
            <AvatarImage src={user?.photoURL} />
            <AvatarFallback>{user?.displayName?.[0] || user?.email?.[0]}</AvatarFallback>
          </Avatar>
          <div>
            <p className="text-sm font-medium">{user?.displayName || 'User'}</p>
            <p className="text-xs text-muted-foreground">{user?.role}</p>
          </div>
        </div>
      </div>
      <ScrollArea className="flex-1  py-4">
        <nav className="space-y-1 ">
         
          {user?.role === 'admin' && (
            <>
             <NavItem to="/dashboard/admin"  icon={Home}>Dashboard</NavItem>
              {/* <NavItem to="/dashboard/polls" icon={BarChart2}>Polls</NavItem> */}
              <NavItem to="/dashboard/managepolls" icon={Vote}>Manage Polls</NavItem>
              {/* <NavItem to="/dashboard/reports" icon={FileText}>Results</NavItem> */}
              <NavItem to="/dashboard/voting-history" icon={FileText}>Voting Results</NavItem>
              <NavItem to="/dashboard/manage-users" icon={User2Icon}>Manage Users</NavItem>
              
              <NavItem to="/dashboard/logs" icon={Waypoints}>Audit Logs</NavItem>
              <NavItem to="/dashboard/profile" icon={Settings2}>Profile</NavItem>
            
            </>
          )}
          {user?.role === 'voter' && (
            <>
             <NavItem to="/dashboard/polls"  icon={Home}>Home</NavItem>
              {/* <NavItem to="/dashboard/polls" icon={Vote}>Active Polls</NavItem> */}
              <NavItem to="/dashboard/voting-history" icon={History}>Vote History</NavItem>
              <NavItem to="/dashboard/profile" icon={Settings2}>My Profile</NavItem>
            </>
          )}
        </nav>
      </ScrollArea>
      <div className="p-4 border-t space-y-2">
      
        <Button variant="ghost" size="sm" className="w-full justify-start" onClick={toggleDarkMode}>
          {darkMode ? <Sun className="mr-2 h-4 w-4" /> : <Moon className="mr-2 h-4 w-4" />}
          
        </Button>
        <Separator />
        <Button variant="outline" size="sm" className="w-full justify-start" onClick={handleLogout}>
          <LogOut className="mr-2 h-4 w-4" />
          Logout
        </Button>
      </div>
    </div>
  );

  return (
    <>
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            className="fixed top-4 left-4 z-40 md:hidden"
          >
            <Menu className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-64 p-0">
          <SidebarContent />
        </SheetContent>
      </Sheet>

      <div className="hidden md:flex">
        <div className="w-64 h-screen">
          <SidebarContent />
        </div>
      </div>
    </>
  );
};

export default Sidebar;
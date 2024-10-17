import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { auth } from '../lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { Sun, Moon, LogOut, Menu, X, Home, Info, Mail, User } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { GoHome,GoHubot } from "react-icons/go";
import {ImTerminal} from "react-icons/im"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { DarkModeContext } from '@/context/DarkMode';
import logoLight from '../assets/logoLight.png';
import logoDark from '../assets/logoinverse.png';
import { FaTerminal } from 'react-icons/fa';

export default function Header() {
  const [user, setUser] = useState(null);
  const { darkMode, toggleDarkMode } = useContext(DarkModeContext);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });

    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    try {
      await auth.signOut();
      setIsOpen(false);
    } catch (error) {
      console.error("Error signing out: ", error);
    }
  };

  const NavLinks = ({ mobile = false }) => (
    <>
      <Button variant={mobile ? "ghost" : "link"} size="sm" asChild className="text-foreground w-full justify-start" onClick={() => mobile && setIsOpen(false)}>
        <Link to="/"> Home</Link>
      </Button>
      <Button variant={mobile ? "ghost" : "link"} size="sm" asChild className="text-foreground w-full justify-start" onClick={() => mobile && setIsOpen(false)}>
        <Link to="/aboutus"> About us</Link>
      </Button>
    
    </>
  );

  const UserActions = ({ mobile = false }) => (
    <>
      {user ? (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="relative h-8 rounded-full w-full justify-start">
              <Avatar className="h-8 w-8 mr-2">
                <AvatarImage src={user.photoURL} alt={user.displayName} />
                <AvatarFallback>{user.displayName?.charAt(0) || user.email?.charAt(0)}</AvatarFallback>
              </Avatar>
              <span className={mobile ? "inline" : "hidden sm:inline"}>{user.displayName || user.email}</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end" forceMount>
            <DropdownMenuItem className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">{user.displayName}</p>
                <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
              </div>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link to="/profile" onClick={() => mobile && setIsOpen(false)}>Profile</Link>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ) : (
        <>
          <Button variant={mobile ? "outline" : "outline"} size="sm" asChild className="text-background bg-foreground w-full justify-start" onClick={() => mobile && setIsOpen(false)}>
            <Link to="/login"><ImTerminal className="mr-2 h-4 w-4" /> Login</Link>
          </Button>
          <Button variant={mobile ? "outline" : "outline"} size="sm" asChild className="text-foreground bg-transparent w-full justify-start" onClick={() => mobile && setIsOpen(false)}>
            <Link to="/register"><ImTerminal className="mr-2 h-4 w-4" /> Create account</Link>
          </Button>
        </>
      )}
    </>
  );

  return (
    <header className="fixed top-2 left-1/2 transform -translate-x-1/2 z-50 w-[60%] ">
      <div className="container mx-auto px-4">
        <nav className="flex items-center justify-between p-2 bg-background/60 backdrop-blur-lg rounded-md shadow-lg">
          {/* Logo Section */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <img src={darkMode ? logoDark : logoLight} className='w-[75px] h-auto' alt="Logo" />
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4">
            <NavLinks />
          </div>

          {/* Desktop User Actions */}
          <div className="hidden md:flex items-center space-x-2">
            <UserActions />
            <Button
              onClick={toggleDarkMode}
              size="sm"
              variant="ghost"
              className="text-foreground"
            >
              {darkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              <span className="sr-only">Toggle theme</span>
            </Button>
          </div>

          {/* Mobile Menu */}
          <div className="md:hidden">
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm" className="text-foreground p-0">
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-full sm:w-[400px] bg-background/95 backdrop-blur-md">
                <div className="flex flex-col h-full">
                  <div className="flex justify-between items-center mb-8">
                    <img src={darkMode ? logoDark : logoLight} className='w-[75px] h-auto' alt="Logo" />
                    <Button
                      onClick={() => setIsOpen(false)}
                      size="md"
                      variant="ghost"
                      className="text-foreground"
                    >
                     
                    </Button>
                  </div>
                  <div className="space-y-4 mb-8">
                    <NavLinks mobile />
                  </div>
                  <div className="space-y-4 mt-auto">
                    <UserActions mobile />
                    <Button
                      onClick={toggleDarkMode}
                      size="sm"
                      variant="ghost"
                      className="text-foreground w-full justify-start"
                    >
                      {darkMode ? <Sun className="h-4 w-4 mr-2" /> : <Moon className="h-4 w-4 mr-2" />}
                      <span>{darkMode ? 'Light Mode' : 'Dark Mode'}</span>
                    </Button>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </nav>
      </div>
    </header>
  );
}
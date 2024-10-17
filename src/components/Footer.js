import React from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Twitter, Instagram, Mail, ArrowRight } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent } from "@/components/ui/card";
import logo from '../assets/logoLight.png'

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-background text-foreground py-12 px-4">
      <Card className="container mx-auto max-w-6xl rounded-3xl shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden">
        <CardContent className="p-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Logo and About */}
            <div className="space-y-4 md:col-span-3 lg:col-span-1">
              <Link to="/" className="flex items-center space-x-2">
                <img src={logo} alt="Logo" className="h-10 w-auto" />
                <span className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-700 to-blue-300">PSFU</span>
              </Link>
              <p className="text-sm text-muted-foreground max-w-xs">
                Empowering voices, shaping decisions. Join PSFU and make your opinion count in our digital democracy.
              </p>
              <div className="flex space-x-4">
                <Button variant="outline" size="icon" aria-label="Facebook">
                  <Facebook className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="icon" aria-label="Twitter">
                  <Twitter className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="icon" aria-label="Instagram">
                  <Instagram className="h-4 w-4" />
                </Button>
                
              </div>
            </div>

            {/* Quick Links and Newsletter Signup */}
            <div className="space-y-8 md:col-span-3 lg:col-span-2">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                {/* Quick Links */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Quick Links</h3>
                  <ul className="space-y-2">
                    <li><Link to="/about" className="text-sm hover:underline flex items-center"><ArrowRight className="h-4 w-4 mr-2" /> About Us</Link></li>
                    <li><Link to="/polls" className="text-sm hover:underline flex items-center"><ArrowRight className="h-4 w-4 mr-2" /> Active Polls</Link></li>
                    <li><Link to="/faq" className="text-sm hover:underline flex items-center"><ArrowRight className="h-4 w-4 mr-2" /> FAQ</Link></li>
                    <li><Link to="/privacy" className="text-sm hover:underline flex items-center"><ArrowRight className="h-4 w-4 mr-2" /> Privacy Policy</Link></li>
                    <li><Link to="/terms" className="text-sm hover:underline flex items-center"><ArrowRight className="h-4 w-4 mr-2" /> Terms of Service</Link></li>
                  </ul>
                </div>

                {/* Newsletter Signup */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Stay Updated</h3>
                  <p className="text-sm text-muted-foreground">Subscribe to our newsletter for the latest polls and updates.</p>
                  <form onSubmit={(e) => e.preventDefault()} className="space-y-2">
                    <div className="flex">
                      <Input type="email" placeholder="Enter your email" className="rounded-r-none" />
                      <Button type="submit" className="rounded-l-none">
                        <Mail className="h-4 w-4 mr-2" />
                        Subscribe
                      </Button>
                    </div>
                  </form>
                </div>
              </div>

              <Separator className="my-8" />

              {/* Bottom Section */}
              <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
                <p className="text-sm text-muted-foreground">
                  © {currentYear} PSFU. All rights reserved.
                </p>
                <div className="flex space-x-4">
                  <Link to="/privacy" className="text-sm hover:underline">Privacy Policy</Link>
                  <Link to="/terms" className="text-sm hover:underline">Terms of Service</Link>
                  <Link to="/contact" className="text-sm hover:underline">Contact Us</Link>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </footer>
  );
};

export default Footer;
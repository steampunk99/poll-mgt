import React from 'react';
import { motion } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ExternalLink, Send, User, Mail, MessageSquare, ArrowRight } from 'lucide-react';

export default function ContactPage() {
  const inputVariants = {
    focus: { scale: 1.05, transition: { type: 'spring', stiffness: 300 } }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="w-full max-w-6xl"
      >
        <Card className="overflow-hidden">
          <CardContent className="p-0">
            <div className="grid grid-cols-1 md:grid-cols-2">
              <div className="bg-primary text-primary-foreground p-8 md:p-12 flex flex-col justify-center">
                <motion.div
                  initial={{ opacity: 0, x: -50 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                >
                  <h1 className="text-4xl font-bold mb-6">Let's Connect</h1>
                  <p className="text-lg mb-8">We're here to listen, assist, and collaborate. Your thoughts and questions matter to us.</p>
                  <div className="space-y-4">
                    {['Reach out anytime', 'Quick response guaranteed', 'Your feedback shapes our future'].map((item, index) => (
                      <motion.div 
                        key={index}
                        className="flex items-center space-x-2"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay: 0.4 + index * 0.1 }}
                      >
                        <ArrowRight className="h-5 w-5" />
                        <span>{item}</span>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              </div>
              <div className="p-8 md:p-12 space-y-6">
                <motion.h2 
                  className="text-2xl font-semibold mb-4"
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  Send Us a Message
                </motion.h2>
                <motion.div variants={inputVariants} whileFocus="focus">
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                    <Input id="name" placeholder="Your name" className="pl-10" />
                  </div>
                </motion.div>
                <motion.div variants={inputVariants} whileFocus="focus">
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                    <Input id="email" type="email" placeholder="Your email" className="pl-10" />
                  </div>
                </motion.div>
                <motion.div variants={inputVariants} whileFocus="focus">
                  <div className="relative">
                    <MessageSquare className="absolute left-3 top-3 text-muted-foreground" />
                    <Textarea id="message" placeholder="Your message" rows={4} className="pl-10" />
                  </div>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.5 }}
                >
                  <Button className="w-full group">
                    <Send className="mr-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                    Send Message
                  </Button>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.6 }}
                >
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => window.open('https://www.psfuganda.org/contact-us.html', '_blank')}
                  >
                    <ExternalLink className="mr-2 h-4 w-4" />
                    PSF Uganda Contact
                  </Button>
                </motion.div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
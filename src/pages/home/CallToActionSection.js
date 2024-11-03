import React from 'react';
import { motion } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const CallToActionSection = () => {
  return (
    <section className="py-20 px-4 md:px-0">
      <div className="container mx-auto">
        <motion.div 
          className="bg-primary text-primary-foreground rounded-lg p-12 text-center"
         
        >
          <h2 className="text-3xl font-bold mb-4">Ready to Make Your Voice Heard?</h2>
          
          <p className="text-xl mb-8">Join VoteSphere today and start participating in polls that matter.</p>
          <Button asChild size="lg" variant="secondary" className="group">
            <Link to="/register">
              Get Started Now
              <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
            </Link>
          </Button>
        </motion.div>
      </div>
    </section>
  );
};

export default CallToActionSection;
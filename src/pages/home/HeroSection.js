import React from 'react';
import { motion } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import Herobg from '../../assets/heros.jpg'

const HeroSection = () => {
  return (
    <section className="py-20 px-8 overflow-hidden mt-[70px]  ">
      <div className="container mx-auto px-4">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-12">
          <motion.div 
            className="lg:w-1/2"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl mb-6">
              Your <span className='bg-gradient-to-r from-indigo-700 via-red-500 to-blue-400 text-gray-200'>Voice</span> Matters
            </h1>
            <p className="text-xl mb-8">
              Join our community and make your opinion count. Participate in polls, shape decisions, and see real-time results with our cutting-edge voting platform.
            </p>
           
            <motion.div
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button asChild size="lg" className="border-gradient-to-r from-indigo-700 via-red-500 to-blue-400 ">
                <Link to="/register">
                  Get Started
                  <ChevronRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </motion.div>
          </motion.div>
          <motion.div 
            className="lg:w-1/2 border border-dashed rounded-md border-border p-6"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <img src={Herobg} alt="Voting Illustration" className="rounded-lg shadow-2xl" />
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
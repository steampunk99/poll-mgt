import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from "@/components/ui/card";
import { BarChart, Lock, Users, Zap } from 'lucide-react';

const features = [
  {
    icon: <BarChart className="h-6 w-6 text-primary" />,
    title: "Real-time Results",
    description: "Watch as votes come in and see the results update instantly."
  },
  {
    icon: <Lock className="h-6 w-6 text-primary" />,
    title: "Secure Voting",
    description: "State-of-the-art encryption ensures your vote remains confidential."
  },
  {
    icon: <Users className="h-6 w-6 text-primary" />,
    title: "Community Driven",
    description: "Create and participate in polls that matter to your community."
  },
  {
    icon: <Zap className="h-6 w-6 text-primary" />,
    title: "Lightning Fast",
    description: "Our platform is optimized for speed, providing a seamless voting experience."
  }
];

const FeaturesSection = () => {
  return (
    <section className="py-20">
      <div className="container mx-auto px-4">
        <motion.h2
          className="text-3xl font-bold text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          Why choose our platform?
        </motion.h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 px-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Card className="h-full">
                <CardContent className="flex flex-col items-center text-center p-8">
                  <div className="mb-4 bg-background border border-border shadow-md backdrop-blur-md rounded-full p-2">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from "@/components/ui/card";
import { BarChart, Lock, Users, Zap, PieChart, Globe, Shield, Clock } from 'lucide-react';

const features = [
  {
    icon: <BarChart className="h-6 w-6 text-primary" />,
    title: "Real-time Analytics",
    description: "Watch live results and detailed analytics as votes come in."
  },
  {
    icon: <Shield className="h-6 w-6 text-primary" />,
    title: "Secure & Private",
    description: "Enterprise-grade security with end-to-end vote encryption."
  },
  {
    icon: <Globe className="h-6 w-6 text-primary" />,
    title: "On the go",
    description: "Create polls accessible to participants anywhere."
  },
  {
    icon: <PieChart className="h-6 w-6 text-primary" />,
    title: "Rich Insights",
    description: "Gain valuable insights with advanced data visualization."
  },
  {
    icon: <Clock className="h-6 w-6 text-primary" />,
    title: "Flexible Scheduling",
    description: "Set custom durations and schedules for your polls."
  },
  {
    icon: <Users className="h-6 w-6 text-primary" />,
    title: "User Management",
    description: "Comprehensive user roles and access control."
  },
  {
    icon: <Zap className="h-6 w-6 text-primary" />,
    title: "Instant Results",
    description: "Get immediate feedback as votes are cast."
  },
  {
    icon: <Lock className="h-6 w-6 text-primary" />,
    title: "Access Control",
    description: "Control who can view and participate in your polls."
  }
];

const FeatureCard = ({ feature, index }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay: index * 0.1 }}
  >
    <Card className="h-full hover:shadow-lg transition-all duration-300 group">
      <CardContent className="flex flex-col items-center text-center p-6">
        <div className="mb-4 p-3 rounded-full bg-primary/10 group-hover:bg-primary/20 transition-colors duration-300">
          {feature.icon}
        </div>
        <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
        <p className="text-muted-foreground text-sm">{feature.description}</p>
      </CardContent>
    </Card>
  </motion.div>
);

const FeaturesSection = () => {
  return (
    <section className="py-20 bg-secondary/50">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl font-bold mb-4">Powerful Features</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Everything you need to create, manage, and analyze polls effectively
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <FeatureCard key={feature.title} feature={feature} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
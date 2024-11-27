import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from "@/components/ui/card";
import { BarChart2, Users, Vote, Award } from 'lucide-react';
import { Skeleton } from "@/components/ui/skeleton";

const StatCard = ({ icon: Icon, title, value, loading }) => (
  <Card>
    <CardContent className="flex items-center p-6">
      <div className="bg-primary/10 p-3 rounded-full mr-4">
        <Icon className="h-6 w-6 text-primary" />
      </div>
      <div>
        <p className="text-sm font-medium text-muted-foreground">{title}</p>
        {loading ? (
          <Skeleton className="h-8 w-24" />
        ) : (
          <h3 className="text-2xl font-bold">{value}</h3>
        )}
      </div>
    </CardContent>
  </Card>
);

const StatisticsSection = ({ pollStats, userStats, loading }) => {
  const stats = [
    {
      icon: BarChart2,
      title: "Total Polls",
      value: pollStats?.totalPolls?.toLocaleString() || '0'
    },
    {
      icon: Vote,
      title: "Active Polls",
      value: pollStats?.activePolls?.toLocaleString() || '0'
    },
    {
      icon: Users,
      title: "Active Users",
      value: userStats?.activeUsers?.toLocaleString() || '0'
    },
    {
      icon: Award,
      title: "Total Votes",
      value: pollStats?.totalVotes?.toLocaleString() || '0'
    }
  ];

  return (
    <section className="py-12 h-full px-4 md:px-8">
      <div className="container mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-8"
        >
          <h2 className="text-3xl font-bold mb-2">Platform Statistics</h2>
          <p className="text-muted-foreground">Real-time insights into our voting community</p>
        </motion.div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <StatCard
                icon={stat.icon}
                title={stat.title}
                value={stat.value}
                loading={loading}
              />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default StatisticsSection;

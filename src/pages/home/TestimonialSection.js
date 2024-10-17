import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const testimonials = [
  {
    name: "Alex Johnson",
    role: "Community Leader",
    content: "VoteSphere has revolutionized how we make decisions in our community. It's user-friendly and incredibly efficient.",
    avatar: "/path-to-alex-avatar.jpg"
  },
  {
    name: "Sarah Lee",
    role: "Student Council President",
    content: "As a student leader, VoteSphere has made it so much easier to gather opinions and make inclusive decisions.",
    avatar: "/path-to-sarah-avatar.jpg"
  },
  {
    name: "Michael Chen",
    role: "Local Business Owner",
    content: "The real-time results feature is a game-changer. It's helped us make quick, informed decisions for our business.",
    avatar: "/path-to-michael-avatar.jpg"
  }
];

const TestimonialsSection = () => {
  return (
    <section className="py-20 bg-secondary/10">
      <div className="container mx-auto px-4">
        <motion.h2
          className="text-3xl font-bold text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          What Our Users Say
        </motion.h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Card className="h-full">
                <CardContent className="flex flex-col items-center text-center p-6">
                  <Avatar className="w-20 h-20 mb-4">
                    <AvatarImage src={testimonial.avatar} alt={testimonial.name} />
                    <AvatarFallback>{testimonial.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <h3 className="text-xl font-semibold mb-1">{testimonial.name}</h3>
                  <p className="text-sm text-muted-foreground mb-4">{testimonial.role}</p>
                  <p className="italic">{testimonial.content}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
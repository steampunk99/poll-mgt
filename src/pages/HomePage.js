import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import HeroSection from '../pages/home/HeroSection';
import ActivePollsSection from '../pages/home/ActivePollsSection';
import FeaturesSection from '../pages/home/FeatureSection';
import TestimonialsSection from '../pages/home/TestimonialSection';
import CallToActionSection from '../pages/home/CallToActionSection';
import ContactPage from './ContactUsPage';

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col  text-foreground">
      <Header />
      <main className="flex-grow">
        <HeroSection />
        <ActivePollsSection />
        <FeaturesSection />
        {/* <TestimonialsSection /> */}
        <CallToActionSection />
        <ContactPage/>
      </main>
      <Footer />
    </div>
  );
}
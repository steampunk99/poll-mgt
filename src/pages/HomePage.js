import React from 'react';
import { useUser } from '@/context/UserContext';
import { useAdmin } from '@/context/AdminContext';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import HeroSection from './home/HeroSection';
import ActivePollsSection from './home/ActivePollsSection';
import FeaturesSection from './home/FeatureSection';
import StatisticsSection from './home/StatisticsSection';
import CallToActionSection from './home/CallToActionSection';
import { Separator } from '@/components/ui/separator';

export default function HomePage() {
  const { user } = useUser();
  const { pollStats, userStats, loading: adminLoading } = useAdmin();

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Header />
      <main className="flex-grow">
        <HeroSection />
        <Separator className="my-2" />
        <StatisticsSection pollStats={pollStats} userStats={userStats} loading={adminLoading} />
        <Separator className="my-2" />
        <ActivePollsSection />
        <FeaturesSection />
        {!user && <CallToActionSection />}
      </main>
      <Footer />
    </div>
  );
}
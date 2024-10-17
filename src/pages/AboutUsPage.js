import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { ExternalLink } from 'lucide-react';
import Header from '../components/Header';
import Footer from '@/components/Footer';

export default function AboutUsPage() {
  return (
    <div className="min-h-screen ">
      <Header />
      <div className="container mx-auto px-4 py-8 mt-8">
        <Card className="max-w-4xl mx-auto bg-secondary backdrop-blur-lg shadow-lg">
          <CardHeader>
            <CardTitle className="text-3xl font-bold ">About PSFU Voting System</CardTitle>
            <CardDescription className="text-lg ">
              Empowering democratic processes through secure and efficient voting solutions
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 ">
            <p>
              E-Voting is a cutting-edge platform designed to facilitate transparent, secure, and efficient voting processes for various events and organizations. Our mission is to enhance democratic participation by leveraging modern technology to make voting accessible and reliable.
            </p>
            <p>
              With a focus on user-friendly interfaces and robust security measures, we ensure that every vote counts and every voice is heard. Whether you're managing a small club election or a large-scale corporate decision-making process, our system adapts to your needs.
            </p>
            <p>
              Key features of our voting system include:
            </p>
            <ul className="list-disc list-inside space-y-2">
              <li>Secure authentication and vote verification</li>
              <li>Real-time result tracking and analytics</li>
              <li>Customizable voting formats and questionnaires</li>
              <li>Accessibility features for inclusive participation</li>
              <li>Comprehensive audit trails for transparency</li>
            </ul>
          </CardContent>
          <CardFooter className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
            <Button asChild className="w-full sm:w-auto">
              <Link to="/register">Get Started</Link>
            </Button>
            <Button 
              variant="outline" 
              className="w-full sm:w-auto "
              onClick={() => window.open('https://www.psfuganda.org/', '_blank')}
            >
              <ExternalLink className="mr-2 h-4 w-4" />
              Learn More About PSFU
            </Button>
          </CardFooter>
        </Card>
      </div>
      <Footer/>
    </div>
  );
}
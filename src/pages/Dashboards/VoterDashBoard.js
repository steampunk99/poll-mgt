import React, { useState, useEffect } from 'react';
import { usePolls } from '../../context/PollContext';
import { useUser } from '../../context/UserContext';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../../components/ui/dialog';
import { 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  Search, 
  SortAsc, 
  BarChart,
  Calendar,
  Users
} from 'lucide-react';

const VoterDashboard = () => {



  return (
    <div className="max-w-4xl p-4">
     <p>VoterDashboard</p>
    </div>
  );
};

export default VoterDashboard;
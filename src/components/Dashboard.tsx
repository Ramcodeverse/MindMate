import React from 'react';
import { ViewType } from './Sidebar';
import { SequentialWorkflow } from './SequentialWorkflow';

interface DashboardProps {
  onNavigate: (view: ViewType) => void;
  onOpenBreathing: () => void;
  onOpenCheckIn?: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  onNavigate,
  onOpenBreathing,
}) => {
  return (
    <SequentialWorkflow 
      onNavigate={onNavigate}
      onOpenBreathing={onOpenBreathing}
    />
  );
};

export default Dashboard;
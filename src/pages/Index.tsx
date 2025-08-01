import { useState } from 'react';
import Header from '@/components/layout/Header';
import TaskCalendarPage from './TaskCalendarPage';
import ProgressPage from './ProgressPage';
import ExpenseTrackerPage from './ExpenseTrackerPage';
import InvestmentTrackerPage from './InvestmentTrackerPage';
import ProfilePage from './ProfilePage';

const Index = () => {
  const [currentPage, setCurrentPage] = useState('calendar');

  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'calendar':
        return <TaskCalendarPage />;
      case 'progress':
        return <ProgressPage />;
      case 'expenses':
        return <ExpenseTrackerPage />;
      case 'investments':
        return <InvestmentTrackerPage />;
      case 'profile':
        return <ProfilePage />;
      default:
        return <TaskCalendarPage />;
    }
  };

  return (
    <div className="min-h-screen bg-white bg-gradient-to-b from-[#f5f6fa] to-[#e9eafc]">
      <Header currentPage={currentPage} onPageChange={setCurrentPage} />
      {renderCurrentPage()}
    </div>
  );
};

export default Index;

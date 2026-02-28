import React, { useState } from 'react';
import Sidebar from '../components/sidebar';
import ClientsView from '../components/clientsview';
import HomeView from '../components/homeview';
import TripsView from '../components/tripsview';
import StaffView from '../components/staffview';
import OverviewView from '../components/overviewview';
import VisitsView from '../components/visitsview';
import LogsView from '../components/LogsView';



const Dashboard = () => {
  const [activeTab, setActiveTab] = useState('Home');

  // Simple Logic: Render the component based on the active tab
  const renderContent = () => {
    switch (activeTab) {
      case 'Home':
        return <HomeView />;
      case 'Clients':
        return <ClientsView />;
      case 'Trips':
        return <TripsView />;
      case 'Staff':
        return <StaffView />;
      case 'Overview':
        return <OverviewView />;
      case 'Visits':
        return <VisitsView />;
      case 'Logs':
        return <LogsView />;
      default:
        return (
          <div className="text-center mt-20">
            <h2 className="text-3xl font-bold text-gray-300">Work in Progress</h2>
            <p className="text-gray-400 mt-2">The {activeTab} module is coming soon.</p>
          </div>
        );
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* 1. The Navigation */}
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* 2. The Main Content Area */}
      <main className="flex-1 p-8 overflow-y-auto">
        {renderContent()}
      </main>
    </div>
  );
};

export default Dashboard;
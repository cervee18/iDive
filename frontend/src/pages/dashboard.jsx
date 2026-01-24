import React from 'react';
import { Users, Ship, Calendar, Settings, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const navigate = useNavigate();

  // MOCK DATA: This is what we are "faking" for now.
  const todaysBoats = [
    { id: 1, name: 'Big Blue', time: '08:00 AM', staff: 'Mike', capacity: '8/10' },
    { id: 2, name: 'Little Mermaid', time: '09:00 AM', staff: 'Sarah', capacity: '4/6' },
    { id: 3, name: 'Big Blue', time: '01:00 PM', staff: 'Mike', capacity: '0/10' },
  ];

  return (
    <div className="flex h-screen bg-gray-100">
      
      {/* SIDEBAR */}
      <aside className="w-64 bg-white shadow-md">
        <div className="p-6">
          <h1 className="text-2xl font-bold text-blue-600">iDive</h1>
        </div>
        <nav className="mt-6">
          <a href="#" className="flex items-center px-6 py-3 bg-blue-50 text-blue-700 border-r-4 border-blue-700">
            <Calendar className="w-5 h-5 mr-3" />
            Dashboard
          </a>
          <a href="#" className="flex items-center px-6 py-3 text-gray-600 hover:bg-gray-50 hover:text-gray-900">
            <Ship className="w-5 h-5 mr-3" />
            Boats
          </a>
          <a href="#" className="flex items-center px-6 py-3 text-gray-600 hover:bg-gray-50 hover:text-gray-900">
            <Users className="w-5 h-5 mr-3" />
            Divers
          </a>
          <a href="#" className="flex items-center px-6 py-3 text-gray-600 hover:bg-gray-50 hover:text-gray-900">
            <Settings className="w-5 h-5 mr-3" />
            Settings
          </a>
          <button onClick={() => navigate('/')} className="w-full flex items-center px-6 py-3 text-red-600 hover:bg-red-50 mt-auto">
            <LogOut className="w-5 h-5 mr-3" />
            Logout
          </button>
        </nav>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 p-8 overflow-y-auto">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Welcome Back, Manager</h2>

        {/* STATS CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="text-gray-500 text-sm">Divers Today</div>
            <div className="text-3xl font-bold text-blue-600">12</div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="text-gray-500 text-sm">Boats Scheduled</div>
            <div className="text-3xl font-bold text-blue-600">3</div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="text-gray-500 text-sm">Staff on Duty</div>
            <div className="text-3xl font-bold text-blue-600">4</div>
          </div>
        </div>

        {/* SCHEDULE TABLE */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Today's Schedule</h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {todaysBoats.map((boat) => (
                <div key={boat.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <span className="text-lg font-semibold text-gray-900">{boat.name}</span>
                    <span className="ml-3 text-sm text-gray-500">Captain: {boat.staff}</span>
                  </div>
                  <div className="flex items-center space-x-4">
                    <span className="px-3 py-1 text-sm font-medium text-blue-800 bg-blue-100 rounded-full">
                      {boat.time}
                    </span>
                    <span className="text-sm text-gray-600">
                      Pax: {boat.capacity}
                    </span>
                    <button className="text-blue-600 hover:text-blue-800 font-medium text-sm">
                      View Manifest
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
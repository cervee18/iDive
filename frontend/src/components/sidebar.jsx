import React from 'react';
import { Home, LayoutDashboard, Ship, Briefcase, Users, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Sidebar = ({ activeTab, setActiveTab }) => {
  const navigate = useNavigate();

  const menuItems = [
    { name: 'Home', icon: Home },
    { name: 'Overview', icon: LayoutDashboard },
    { name: 'Trips', icon: Ship },
    { name: 'Staff', icon: Briefcase },
    { name: 'Clients', icon: Users },
  ];

  return (
    <aside className="w-64 bg-white shadow-md flex flex-col h-full">
      <div className="p-6">
        <h1 className="text-2xl font-bold text-blue-600">iDive</h1>
      </div>
      <nav className="mt-6 flex-1">
        {menuItems.map((item) => (
          <button 
            key={item.name}
            onClick={() => setActiveTab(item.name)}
            className={`flex items-center px-6 py-3 w-full transition-colors ${
              activeTab === item.name 
                ? 'bg-blue-50 text-blue-700 border-r-4 border-blue-700' 
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
            }`}
          >
            <item.icon className="w-5 h-5 mr-3" />
            {item.name}
          </button>
        ))}
      </nav>
      <div className="p-4 border-t border-gray-100">
        <button 
          onClick={() => navigate('/')} 
          className="w-full flex items-center px-6 py-3 text-red-600 hover:bg-red-50 rounded-md transition-colors"
        >
          <LogOut className="w-5 h-5 mr-3" />
          Logout
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
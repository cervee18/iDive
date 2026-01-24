import React from 'react';

const MOCK_BOATS = [
  { id: 1, name: 'Big Blue', time: '08:00 AM', staff: 'Mike', capacity: '8/10' },
  { id: 2, name: 'Little Mermaid', time: '09:00 AM', staff: 'Sarah', capacity: '4/6' },
];

const HomeView = () => {
  return (
    <>
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Welcome Back, Manager</h2>
      
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="text-gray-500 text-sm">Divers Today</div>
          <div className="text-3xl font-bold text-blue-600">12</div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="text-gray-500 text-sm">Boats Scheduled</div>
          <div className="text-3xl font-bold text-blue-600">{MOCK_BOATS.length}</div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="text-gray-500 text-sm">Staff on Duty</div>
          <div className="text-3xl font-bold text-blue-600">4</div>
        </div>
      </div>

      {/* Schedule Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Today's Schedule</h3>
        </div>
        <div className="p-6 space-y-4">
          {MOCK_BOATS.map((boat) => (
            <div key={boat.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <span className="text-lg font-semibold text-gray-900">{boat.name}</span>
                <span className="ml-3 text-sm text-gray-500">Captain: {boat.staff}</span>
              </div>
              <div className="flex items-center space-x-4">
                <span className="px-3 py-1 text-sm font-medium text-blue-800 bg-blue-100 rounded-full">{boat.time}</span>
                <span className="text-sm text-gray-600">Pax: {boat.capacity}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default HomeView;
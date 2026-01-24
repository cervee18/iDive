import React, { useState } from 'react';
import { 
  Calendar, Search, UserPlus, Users, X, 
  Anchor, GraduationCap, Plus, CheckCircle 
} from 'lucide-react';

// --- MOCK DATA GENERATORS ---

const getMockStaff = () => {
    const staff = ['MN', 'SC', 'JS', 'JB', 'WW'];
    return staff.sort(() => 0.5 - Math.random()).slice(0, Math.floor(Math.random() * 3) + 1);
};

const generateSchedule = (startDateStr) => {
    const schedule = [];
    let currentDate = new Date(startDateStr);

    for (let i = 0; i < 14; i++) {
        const dateStr = currentDate.toISOString().split('T')[0];
        const dayName = currentDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
        
        const trips = [
            { 
                id: `t-${dateStr}-am`, type: 'trip', name: 'Morning 2-Tank', time: '08:00', 
                capacity: 12, booked: Math.floor(Math.random() * 12), staff: getMockStaff() 
            },
            { 
                id: `t-${dateStr}-pm`, type: 'trip', name: 'Afternoon 1-Tank', time: '13:00', 
                capacity: 16, booked: Math.floor(Math.random() * 16), staff: getMockStaff() 
            }
        ];

        if (i % 3 === 0) {
            trips.push({ 
                id: `t-${dateStr}-ngt`, type: 'trip', name: 'Night Dive', time: '18:00', 
                capacity: 8, booked: Math.floor(Math.random() * 8), staff: ['JS'] 
            });
        }
        if (i % 2 === 0) {
            trips.unshift({ 
                id: `c-${dateStr}-ow`, type: 'class', name: 'OW Course', time: '09:00', 
                capacity: 4, booked: Math.floor(Math.random() * 4), staff: ['SC'] 
            });
        }

        schedule.push({ date: dateStr, displayDate: dayName, items: trips });
        currentDate.setDate(currentDate.getDate() + 1);
    }
    return schedule;
};

const MOCK_DB_CLIENTS = [
    { id: 1, name: 'John Doe', email: 'john@doe.com' },
    { id: 2, name: 'Maria Silva', email: 'maria@brazil.com' },
    { id: 3, name: 'James Bond', email: '007@mi6.gov' },
    { id: 4, name: 'Sarah Connor', email: 'sarah@skynet.net' },
    { id: 5, name: 'Rick Sanchez', email: 'rick@c137.com' },
];

const OverviewView = () => {
  const [startDate, setStartDate] = useState('2026-01-24');
  const [schedule, setSchedule] = useState(generateSchedule('2026-01-24'));
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedClients, setSelectedClients] = useState([]);

  // --- ACTIONS ---

  const handleDateChange = (e) => {
    const newDate = e.target.value;
    setStartDate(newDate);
    setSchedule(generateSchedule(newDate));
  };

  const handleSearch = (term) => {
    setSearchTerm(term);
    if (term.length < 2) {
        setSearchResults([]);
        return;
    }
    const filtered = MOCK_DB_CLIENTS.filter(c => 
        c.name.toLowerCase().includes(term.toLowerCase())
    );
    setSearchResults(filtered);
  };

  const handleSelectClient = (client) => {
    if (!selectedClients.find(c => c.id === client.id)) {
        setSelectedClients([...selectedClients, client]);
    }
    setSearchTerm('');
    setSearchResults([]);
  };

  const handleRemoveClient = (clientId) => {
    setSelectedClients(selectedClients.filter(c => c.id !== clientId));
  };

  const handleBookTrip = (dayIndex, itemIndex) => {
    if (selectedClients.length === 0) return;
    const newSchedule = [...schedule];
    const trip = newSchedule[dayIndex].items[itemIndex];
    const spaceAvailable = trip.capacity - trip.booked;
    
    if (selectedClients.length > spaceAvailable) {
        alert(`Not enough space! Only ${spaceAvailable} spots left.`);
        return;
    }

    trip.booked += selectedClients.length;
    setSchedule(newSchedule);
  };

  const getCapacityColor = (booked, capacity) => {
    const ratio = booked / capacity;
    if (ratio >= 1) return 'bg-red-500';
    if (ratio >= 0.8) return 'bg-orange-500';
    return 'bg-green-500';
  };

  return (
    <div className="flex h-full bg-gray-100 rounded-lg overflow-hidden gap-4">
      
      {/* --- LEFT PANEL: THE BOOKER (Fixed Width) --- */}
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col shadow-lg z-20 shrink-0">
        
        {/* Search Area */}
        <div className="p-4 border-b border-gray-100 bg-blue-50">
            <h2 className="text-xs font-bold text-blue-800 uppercase tracking-wider mb-2 flex items-center">
                <UserPlus size={14} className="mr-2" /> Find Divers
            </h2>
            <div className="relative">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                <input
                    type="text"
                    placeholder="Search name..."
                    className="w-full pl-9 pr-4 py-2 text-sm border border-blue-200 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    value={searchTerm}
                    onChange={e => handleSearch(e.target.value)}
                />
                {searchResults.length > 0 && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-md shadow-lg z-50">
                        {searchResults.map(client => (
                            <button
                                key={client.id}
                                onClick={() => handleSelectClient(client)}
                                className="w-full text-left px-4 py-2 text-sm hover:bg-blue-50 flex justify-between group"
                            >
                                <span>{client.name}</span>
                                <Plus size={14} className="text-blue-500 opacity-0 group-hover:opacity-100"/>
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </div>

        {/* Selected Divers List */}
        <div className="flex-1 overflow-y-auto p-4 flex flex-col">
            <div className="flex justify-between items-center mb-3">
                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                    Selected Group ({selectedClients.length})
                </h3>
                {selectedClients.length > 0 && (
                    <button onClick={() => setSelectedClients([])} className="text-[10px] text-red-500 hover:underline">
                        Clear All
                    </button>
                )}
            </div>

            {selectedClients.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center text-gray-400 text-center p-4 border-2 border-dashed border-gray-200 rounded-lg">
                    <Users size={32} className="mb-2 opacity-50" />
                    <p className="text-sm">Search and add divers.</p>
                </div>
            ) : (
                <div className="space-y-2">
                    {selectedClients.map(client => (
                        <div key={client.id} className="bg-blue-600 text-white rounded-lg p-3 shadow-md flex justify-between items-center">
                            <div className="flex items-center">
                                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center font-bold text-xs mr-3">
                                    {client.name.charAt(0)}
                                </div>
                                <div>
                                    <div className="text-sm font-bold">{client.name}</div>
                                </div>
                            </div>
                            <button onClick={() => handleRemoveClient(client.id)} className="text-white/70 hover:text-white">
                                <X size={16} />
                            </button>
                        </div>
                    ))}
                    <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded text-xs text-green-800 flex items-center">
                        <CheckCircle size={14} className="mr-2" />
                        Click trips to book
                    </div>
                </div>
            )}
        </div>
      </div>

      {/* --- RIGHT PANEL: HORIZONTAL SCROLL AREA --- */}
      <div className="flex-1 flex flex-col min-w-0 bg-white">
        
        {/* Header (Date Selector) */}
        <div className="p-4 border-b border-gray-200 bg-white shrink-0">
            <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-3 bg-white px-3 py-2 border border-gray-300 rounded-md shadow-sm">
                    <Calendar className="w-5 h-5 text-gray-500" />
                    <input 
                        type="date" 
                        value={startDate}
                        onChange={handleDateChange}
                        className="text-sm font-bold text-gray-700 outline-none"
                    />
                </div>
                <span className="text-sm text-gray-500">Scroll right to view upcoming schedule →</span>
            </div>
        </div>

        {/* The Horizontal Timeline */}
        <div className="flex-1 overflow-x-auto overflow-y-hidden bg-gray-100">
            <div className="flex h-full p-4 space-x-4">
                {schedule.map((day, dayIndex) => (
                    // DAY COLUMN
                    <div key={day.date} className="min-w-[320px] w-[320px] bg-gray-50 border border-gray-200 rounded-xl flex flex-col shrink-0">
                        
                        {/* Day Header */}
                        <div className="bg-white p-4 border-b border-gray-200 rounded-t-xl sticky top-0 z-10">
                            <div className="font-bold text-lg text-gray-800">{day.displayDate}</div>
                            <div className="text-xs text-gray-500 mt-1">{day.items.length} Activities</div>
                        </div>

                        {/* Trips Container (Vertical scroll inside the day if needed) */}
                        <div className="p-3 space-y-3 overflow-y-auto flex-1">
                            {day.items.map((item, itemIndex) => {
                                const isFull = item.booked >= item.capacity;

                                return (
                                    <div 
                                        key={item.id}
                                        onClick={() => handleBookTrip(dayIndex, itemIndex)}
                                        className={`bg-white rounded-lg border p-4 shadow-sm relative overflow-hidden group transition-all ${
                                            selectedClients.length > 0 && !isFull
                                                ? 'cursor-pointer hover:ring-2 hover:ring-blue-400 hover:shadow-md transform hover:-translate-y-0.5' 
                                                : ''
                                        } ${isFull ? 'opacity-75 bg-gray-50' : ''}`}
                                    >
                                        {/* Hover Overlay */}
                                        {selectedClients.length > 0 && !isFull && (
                                            <div className="absolute inset-0 bg-blue-500/10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10">
                                                <span className="bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">
                                                    + Book Group
                                                </span>
                                            </div>
                                        )}

                                        <div className="flex justify-between items-start mb-3">
                                            <div>
                                                <h4 className="font-bold text-gray-800">{item.name}</h4>
                                                <div className="text-xs text-gray-500 flex items-center mt-1">
                                                    {item.type === 'trip' ? <Anchor size={12} className="mr-1 text-blue-400"/> : <GraduationCap size={12} className="mr-1 text-green-400"/>}
                                                    {item.time}
                                                </div>
                                            </div>
                                            {/* Staff Avatars */}
                                            <div className="flex -space-x-1">
                                                {item.staff.map((initial, i) => (
                                                    <div key={i} className="w-6 h-6 rounded-full bg-gray-100 border-2 border-white flex items-center justify-center text-[9px] font-bold text-gray-600">
                                                        {initial}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Capacity Bar */}
                                        <div>
                                            <div className="flex justify-between text-[10px] text-gray-500 mb-1 font-medium">
                                                <span>Availability</span>
                                                <span className={isFull ? 'text-red-600' : ''}>
                                                    {item.booked} / {item.capacity}
                                                </span>
                                            </div>
                                            <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                                                <div 
                                                    className={`h-full ${getCapacityColor(item.booked, item.capacity)} transition-all duration-500`} 
                                                    style={{ width: `${(item.booked / item.capacity) * 100}%` }}
                                                ></div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                            
                            {day.items.length === 0 && (
                                <div className="h-full flex items-center justify-center text-gray-400 text-sm italic">
                                    No scheduled trips
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>

      </div>
    </div>
  );
};

export default OverviewView;
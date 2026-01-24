import React, { useState } from 'react';
import {
  Calendar, Plus, Trash2, ArrowRight,
  FileText, DollarSign, Truck
} from 'lucide-react';

// --- MOCK DATA ---
const INITIAL_DATA = {
  '2026-01-24': {
    trips: [
      {
        id: 101,
        name: 'Morning 2-Tank',
        time: '08:00',
        boat: 'Big Blue',
        maxPax: 12,
        manifest: [
          {
            id: 1, visitId: 'V-100', name: 'John Doe', cert: 'OW',
            lastDive: '2025-12-01', waiver: true, deposit: true, pickup: false,
            weights: '12lbs', mask: 'Adult', bcd: 'L', wetsuit: 'L', fins: '10-11', reg: true,
            tank1: 'Air', tank2: 'Air', nextTrip: 'Tomorrow AM', notes: 'Ear trouble'
          },
          {
            id: 2, visitId: 'V-100', name: 'Maria Silva', cert: 'RD',
            lastDive: '2026-01-10', waiver: true, deposit: true, pickup: false,
            weights: '8lbs', mask: 'Adult', bcd: 'S', wetsuit: 'S', fins: '6-7', reg: true,
            tank1: 'Nx32', tank2: 'Nx32', nextTrip: 'Tomorrow AM', notes: ''
          },
          {
            id: 3, visitId: 'V-101', name: 'James Bond', cert: 'MSD',
            lastDive: '2026-01-20', waiver: false, deposit: false, pickup: true,
            weights: '14lbs', mask: 'None', bcd: 'None', wetsuit: 'None', fins: 'None', reg: false,
            tank1: 'Air', tank2: 'Air', nextTrip: '--', notes: 'VIP'
          },
          {
            id: 4, visitId: 'V-102', name: 'Sarah Connor', cert: 'AOW',
            lastDive: '2024-05-20', waiver: true, deposit: true, pickup: false,
            weights: '10lbs', mask: 'Adult', bcd: 'M', wetsuit: 'M', fins: '8-9', reg: true,
            tank1: 'Air', tank2: 'Air', nextTrip: '--', notes: ''
          },
          {
            id: 5, visitId: 'V-102', name: 'John Connor', cert: 'OW',
            lastDive: '2024-05-20', waiver: true, deposit: true, pickup: false,
            weights: '12lbs', mask: 'Adult', bcd: 'L', wetsuit: 'L', fins: '10-11', reg: true,
            tank1: 'Air', tank2: 'Air', nextTrip: '--', notes: ''
          }
        ]
      },
      {
        id: 102, name: 'Afternoon 1-Tank', time: '13:00', boat: 'Little Mermaid', maxPax: 10, manifest: []
      }
    ]
  }
};

const TripsView = () => {
  const [selectedDate, setSelectedDate] = useState('2026-01-24');
  const [scheduleData, setScheduleData] = useState(INITIAL_DATA);
  const [selectedActivityId, setSelectedActivityId] = useState(101);

  // Helper: Current Data
  const currentDay = scheduleData[selectedDate] || { trips: [] };
  const currentActivity = currentDay.trips.find(t => t.id === selectedActivityId) || null;

  // --- ACTIONS ---
  const handleUpdateDiver = (diverId, field, value) => {
    const newData = { ...scheduleData };
    const trip = newData[selectedDate].trips.find(t => t.id === selectedActivityId);
    const diver = trip.manifest.find(d => d.id === diverId);
    if (diver) {
      diver[field] = value;
      setScheduleData(newData);
    }
  };

  const handleCreateTrip = () => {
    const name = prompt("Trip Name (e.g., Night Dive):");
    if (!name) return;
    const newTrip = { id: Date.now(), name, time: '18:00', boat: 'Big Blue', maxPax: 12, manifest: [] };
    const newData = { ...scheduleData };
    if (!newData[selectedDate]) newData[selectedDate] = { trips: [] };
    newData[selectedDate].trips.push(newTrip);
    setScheduleData(newData);
    setSelectedActivityId(newTrip.id);
  };

  // --- STYLING HELPER ---
  // Assigns a background color based on the Visit ID hash
  const getRowStyle = (visitId) => {
    // We strip the non-numeric part to get a number for modulo math
    const idNum = parseInt(visitId.replace(/\D/g, '')) || 0;
    const colors = [
      'bg-blue-50 hover:bg-blue-100',    // Group A
      'bg-orange-50 hover:bg-orange-100', // Group B
      'bg-green-50 hover:bg-green-100',   // Group C
      'bg-purple-50 hover:bg-purple-100'  // Group D
    ];
    return colors[idNum % colors.length];
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">

      {/* --- TOP SECTION: DATE & TRIP SELECTOR --- */}
      <div className="bg-gray-50 border-b border-gray-200 p-4">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center space-x-3 bg-white px-3 py-2 border rounded-md shadow-sm">
            <Calendar className="w-5 h-5 text-gray-500" />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="text-sm font-bold text-gray-700 outline-none"
            />
          </div>
          <div className="flex space-x-2">
            <button onClick={handleCreateTrip} className="flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded hover:bg-blue-700">
              <Plus className="w-4 h-4 mr-2" /> New Trip
            </button>
          </div>
        </div>

        {/* Horizontal Trip Tabs */}
        <div className="flex space-x-2 overflow-x-auto pb-2">
          {currentDay.trips.map(trip => (
            <button
              key={trip.id}
              onClick={() => setSelectedActivityId(trip.id)}
              className={`flex flex-col items-start px-4 py-2 rounded-lg border min-w-[160px] transition-all ${
                selectedActivityId === trip.id
                  ? 'bg-white border-blue-500 shadow-md ring-1 ring-blue-500'
                  : 'bg-white border-gray-200 hover:border-blue-300 text-gray-500'
              }`}
            >
              <span className={`text-sm font-bold ${selectedActivityId === trip.id ? 'text-blue-700' : 'text-gray-700'}`}>
                {trip.name}
              </span>
              <span className="text-xs mt-1 flex justify-between w-full">
                <span>{trip.time}</span>
                <span>{trip.manifest.length}/{trip.maxPax} Pax</span>
              </span>
            </button>
          ))}
          {currentDay.trips.length === 0 && (
            <div className="text-sm text-gray-400 italic py-2">No trips scheduled for this date.</div>
          )}
        </div>
      </div>

      {/* --- BOTTOM SECTION: THE MANIFEST TABLE --- */}
      <div className="flex-1 overflow-auto">
        {currentActivity ? (
          <table className="min-w-full divide-y divide-gray-200 border-separate border-spacing-0">
            <thead className="bg-gray-100 sticky top-0 z-10 shadow-sm">
              <tr>
                <th className="px-3 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider w-48">Diver</th>
                <th className="px-2 py-3 text-center text-xs font-bold text-gray-500 uppercase tracking-wider w-24">Checks</th>
                <th className="px-2 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider w-32">Last Dive</th>
                <th className="px-2 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider w-72">Gear (M/B/W/F/Wt) & Reg</th>
                <th className="px-2 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider w-32">Tanks</th>
                <th className="px-2 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider min-w-[200px]">Notes & Plan</th>
                <th className="px-2 py-3 text-right text-xs font-bold text-gray-500 uppercase tracking-wider w-20">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {currentActivity.manifest.map((diver) => (
                <tr key={diver.id} className={`${getRowStyle(diver.visitId)} transition-colors`}>

                  {/* 1. DIVER INFO */}
                  <td className="px-3 py-2 whitespace-nowrap">
                    <div className="text-sm font-bold text-gray-900">{diver.name}</div>
                    <div className="text-xs text-gray-500 flex items-center space-x-2">
                      <span className="bg-white/50 px-1 rounded border border-gray-200">{diver.cert}</span>
                      <span className="text-[10px] uppercase text-gray-400">Grp: {diver.visitId}</span>
                    </div>
                  </td>

                  {/* 2. CHECKS (Waiver, $, Pickup) */}
                  <td className="px-2 py-2 whitespace-nowrap text-center">
                    <div className="flex justify-center space-x-2">
                      <button
                        onClick={() => handleUpdateDiver(diver.id, 'waiver', !diver.waiver)}
                        className={`p-1 rounded ${diver.waiver ? 'text-green-600' : 'text-red-400 bg-red-100/50'}`}
                        title="Waiver"
                      >
                        <FileText size={16} />
                      </button>
                      <button
                        onClick={() => handleUpdateDiver(diver.id, 'deposit', !diver.deposit)}
                        className={`p-1 rounded ${diver.deposit ? 'text-green-600' : 'text-red-400 bg-red-100/50'}`}
                        title="Deposit"
                      >
                        <DollarSign size={16} />
                      </button>
                      <button
                        onClick={() => handleUpdateDiver(diver.id, 'pickup', !diver.pickup)}
                        className={`p-1 rounded ${diver.pickup ? 'text-blue-600' : 'text-gray-300'}`}
                        title="Pickup"
                      >
                        <Truck size={16} />
                      </button>
                    </div>
                  </td>

                  {/* 3. LAST DIVE */}
                  <td className="px-2 py-2 whitespace-nowrap">
                    <input
                      type="date"
                      className="text-xs bg-white/50 border border-gray-300 rounded px-1 py-1 w-full focus:ring-1 focus:ring-blue-500 focus:outline-none"
                      value={diver.lastDive}
                      onChange={(e) => handleUpdateDiver(diver.id, 'lastDive', e.target.value)}
                    />
                  </td>

                  {/* 4. GEAR SIZES & REG (Cleaned up Display) */}
                  <td className="px-2 py-2">
                    <div className="flex items-center space-x-2">
                      <select
                        className="w-11 text-xs p-1 border rounded bg-white/80" title="Mask"
                        value={diver.mask} onChange={(e) => handleUpdateDiver(diver.id, 'mask', e.target.value)}
                      >
                        <option value="None">-</option><option value="Adult">A</option><option value="Kid">K</option>
                      </select>
                      <select
                        className="w-11 text-xs p-1 border rounded bg-white/80" title="BCD"
                        value={diver.bcd} onChange={(e) => handleUpdateDiver(diver.id, 'bcd', e.target.value)}
                      >
                        <option value="None">-</option><option>S</option><option>M</option><option>L</option><option>XL</option>
                      </select>
                      <select
                        className="w-11 text-xs p-1 border rounded bg-white/80" title="Wetsuit"
                        value={diver.wetsuit} onChange={(e) => handleUpdateDiver(diver.id, 'wetsuit', e.target.value)}
                      >
                        <option value="None">-</option><option>S</option><option>M</option><option>L</option><option>XL</option>
                      </select>
                      <select
                        className="w-12 text-xs p-1 border rounded bg-white/80" title="Fins"
                        value={diver.fins} onChange={(e) => handleUpdateDiver(diver.id, 'fins', e.target.value)}
                      >
                        <option value="None">-</option><option>6-7</option><option>8-9</option><option>10+</option>
                      </select>
                      <input
                        type="text" placeholder="lbs" className="w-11 text-xs p-1 border rounded bg-white/80 text-center"
                        value={diver.weights} onChange={(e) => handleUpdateDiver(diver.id, 'weights', e.target.value)}
                      />
                      {/* Regulator Checkbox Moved Here */}
                      <label className="flex items-center space-x-1 cursor-pointer ml-1 border-l pl-2 border-gray-300">
                        <input
                          type="checkbox"
                          checked={diver.reg}
                          onChange={(e) => handleUpdateDiver(diver.id, 'reg', e.target.checked)}
                          className="w-3 h-3 text-blue-600 rounded"
                        />
                        <span className="text-[10px] text-gray-600 font-bold">REG</span>
                      </label>
                    </div>
                  </td>

                  {/* 5. TANKS */}
                  <td className="px-2 py-2">
                    <div className="flex flex-col space-y-1">
                      <div className="flex space-x-1">
                        <select
                          className="w-16 text-[10px] p-0.5 border rounded bg-white/80 font-mono" title="Tank 1"
                          value={diver.tank1} onChange={(e) => handleUpdateDiver(diver.id, 'tank1', e.target.value)}
                        >
                          <option>Air</option><option>Nx32</option><option>Nx36</option>
                        </select>
                        <select
                          className="w-16 text-[10px] p-0.5 border rounded bg-white/80 font-mono" title="Tank 2"
                          value={diver.tank2} onChange={(e) => handleUpdateDiver(diver.id, 'tank2', e.target.value)}
                        >
                          <option>Air</option><option>Nx32</option><option>Nx36</option>
                        </select>
                      </div>
                    </div>
                  </td>

                  {/* 6. NOTES & NEXT */}
                  <td className="px-2 py-2">
                    <div className="flex flex-col space-y-1">
                      <input
                        type="text" placeholder="Notes..."
                        className="text-xs bg-yellow-100/50 border border-yellow-200 rounded px-1 py-1 w-full"
                        value={diver.notes} onChange={(e) => handleUpdateDiver(diver.id, 'notes', e.target.value)}
                      />
                      <div className="flex items-center text-[10px] text-gray-400">
                        <span className="mr-1">Next:</span>
                        <input
                          type="text"
                          className="bg-transparent border-b border-gray-300 w-full focus:outline-none text-gray-600"
                          value={diver.nextTrip} onChange={(e) => handleUpdateDiver(diver.id, 'nextTrip', e.target.value)}
                        />
                      </div>
                    </div>
                  </td>

                  {/* 7. ACTIONS */}
                  <td className="px-2 py-2 text-right">
                    <button className="text-gray-400 hover:text-blue-600 mr-2" title="Move to another trip">
                      <ArrowRight size={16} />
                    </button>
                    <button className="text-gray-400 hover:text-red-600" title="Remove">
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
              {currentActivity.manifest.length === 0 && (
                <tr>
                  <td colSpan="7" className="text-center py-8 text-gray-400 italic bg-white">
                    Boat is empty. Add divers to start.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        ) : (
          <div className="flex h-full items-center justify-center text-gray-400 bg-gray-50">
            Select a trip from the top bar to view the manifest.
          </div>
        )}
      </div>
    </div>
  );
};

export default TripsView;
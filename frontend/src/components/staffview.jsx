import React, { useState } from 'react';
import { 
  Calendar, Briefcase, Anchor, GraduationCap, 
  Plus, X, AlertCircle, Sun, Moon, Sunrise, Coffee 
} from 'lucide-react';

// --- MOCK DATA ---
const ALL_STAFF = [
  { id: 1, name: 'Mike Nelson', role: 'Instructor', color: 'bg-blue-500' },
  { id: 2, name: 'Sarah Connor', role: 'Instructor', color: 'bg-blue-500' },
  { id: 3, name: 'Jack Sparrow', role: 'Captain', color: 'bg-orange-500' },
  { id: 4, name: 'James Bond', role: 'Divemaster', color: 'bg-green-500' },
  { id: 5, name: 'Sandy Cheeks', role: 'Intern', color: 'bg-purple-500' },
  { id: 6, name: 'Wade Wilson', role: 'Instructor', color: 'bg-blue-500' },
  { id: 7, name: 'Tony Stark', role: 'Captain', color: 'bg-orange-500' },
  { id: 8, name: 'Bruce Wayne', role: 'Divemaster', color: 'bg-green-500' },
];

const INITIAL_TRIPS = [
  { id: 'trip-101', type: 'trip', name: 'Morning 2-Tank', time: '08:00', staff: [] },
  { id: 'class-201', type: 'class', name: 'OW Course (Pool)', time: '09:00', staff: [] },
  { id: 'trip-102', type: 'trip', name: 'Afternoon 1-Tank', time: '13:00', staff: [] },
  { id: 'trip-103', type: 'trip', name: 'Night Dive', time: '18:30', staff: [] },
];

// Split duties into "Shifts" (AM/PM capable) and "Status" (All day)
const SHIFT_DUTIES = [
  { id: 'duty-office', name: 'Office', icon: Briefcase },
  { id: 'duty-ops', name: 'Operations', icon: Anchor },
  { id: 'duty-pool', name: 'Pool Maint.', icon: AlertCircle },
];

const STATUS_DUTIES = [
  { id: 'status-sick', name: 'Sick Leave', icon: Plus, isNegative: true },
  { id: 'status-hol', name: 'Holiday', icon: Sun, isNegative: true },
];

const StaffView = () => {
  const [selectedDate, setSelectedDate] = useState('2026-01-24');
  const [selectedStaffIds, setSelectedStaffIds] = useState([]);
  
  // State now needs keys for AM and PM versions of duties
  // e.g., 'duty-office-am' and 'duty-office-pm'
  const [assignments, setAssignments] = useState({
    'trip-101': [], 'trip-102': [], 'trip-103': [], 'class-201': [],
    'status-sick': [], 'status-hol': [],
    'duty-office-am': [], 'duty-office-pm': [],
    'duty-ops-am': [], 'duty-ops-pm': [],
    'duty-pool-am': [], 'duty-pool-pm': [],
  });

  // --- ACTIONS ---
  const handleStaffClick = (id) => {
    if (selectedStaffIds.includes(id)) {
      setSelectedStaffIds(selectedStaffIds.filter(sid => sid !== id));
    } else {
      setSelectedStaffIds([...selectedStaffIds, id]);
    }
  };

  const handleAssignTo = (targetId) => {
    if (selectedStaffIds.length === 0) return;
    const newAssignments = { ...assignments };
    if (!newAssignments[targetId]) newAssignments[targetId] = [];
    selectedStaffIds.forEach(staffId => {
      if (!newAssignments[targetId].includes(staffId)) {
        newAssignments[targetId].push(staffId);
      }
    });
    setAssignments(newAssignments);
    setSelectedStaffIds([]); 
  };

  const handleRemoveFrom = (targetId, staffId, e) => {
    e.stopPropagation(); 
    const newAssignments = { ...assignments };
    newAssignments[targetId] = newAssignments[targetId].filter(id => id !== staffId);
    setAssignments(newAssignments);
  };

  // --- HELPER: GET INITIALS ---
  const getInitials = (name) => {
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };

  // --- HELPER: SPLIT TRIPS BY TIME ---
  const morningTrips = INITIAL_TRIPS.filter(t => parseInt(t.time.split(':')[0]) < 12);
  const afternoonTrips = INITIAL_TRIPS.filter(t => parseInt(t.time.split(':')[0]) >= 12);

  // --- COMPONENT: ASSIGNMENT CARD (Used for Duties & Trips) ---
  const AssignmentCard = ({ id, title, subtitle, icon: Icon, isNegative = false, isDuty = false }) => (
    <div 
        onClick={() => handleAssignTo(id)}
        className={`bg-white rounded-lg border p-2 mb-2 shadow-sm cursor-pointer hover:border-blue-400 transition-colors flex flex-col ${
            isDuty ? 'min-h-[80px]' : 'min-h-[100px]'
        } ${isNegative ? 'bg-red-50/40 border-red-100' : ''} 
          ${selectedStaffIds.length > 0 ? 'ring-2 ring-blue-50 border-blue-200' : 'border-gray-200'}`}
    >
        <div className={`flex justify-between items-start mb-1.5 border-b pb-1.5 ${isNegative ? 'border-red-100' : 'border-gray-50'}`}>
            <div className="truncate pr-1">
                <h4 className={`font-bold text-xs truncate ${isNegative ? 'text-red-700' : 'text-gray-700'}`}>{title}</h4>
                {subtitle && <span className="text-[10px] text-gray-400 font-mono block">{subtitle}</span>}
            </div>
            {Icon && <Icon size={14} className={`${isNegative ? 'text-red-300' : 'text-blue-300'} shrink-0`} />}
        </div>

        {/* Assigned Staff Grid */}
        <div className="flex-1 content-start flex flex-wrap gap-1 overflow-y-auto">
            {assignments[id]?.length > 0 ? (
                assignments[id].map(staffId => {
                    const staff = ALL_STAFF.find(s => s.id === staffId);
                    return (
                        <div 
                            key={staffId} 
                            className="group relative w-6 h-6 rounded-full bg-gray-100 border border-gray-200 flex items-center justify-center text-[10px] font-bold text-gray-600 cursor-default shadow-sm"
                            title={staff.name}
                        >
                            {getInitials(staff.name)}
                            <button 
                                onClick={(e) => handleRemoveFrom(id, staff.id, e)}
                                className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-3 h-3 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10"
                            >
                                <X size={6} strokeWidth={3} />
                            </button>
                        </div>
                    );
                })
            ) : (
                <div className="text-[10px] text-gray-300 italic w-full text-center mt-1">-</div>
            )}
        </div>
    </div>
  );

  return (
    <div className="flex flex-col h-full bg-gray-100 rounded-lg overflow-hidden">
      
      {/* HEADER */}
      <div className="bg-white p-3 border-b border-gray-200 flex items-center justify-between shrink-0">
        <div className="flex items-center space-x-3 bg-gray-50 px-3 py-1.5 border rounded-md">
            <Calendar className="w-4 h-4 text-gray-500" />
            <input 
                type="date" 
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="bg-transparent text-sm font-bold text-gray-700 outline-none"
            />
        </div>
        
        {/* ALL DAY STATUS SECTION (TOP BAR) */}
        <div className="flex space-x-2">
            {STATUS_DUTIES.map(status => (
                <div 
                    key={status.id}
                    onClick={() => handleAssignTo(status.id)}
                    className={`flex items-center px-3 py-1.5 rounded border cursor-pointer hover:shadow-sm transition-all ${
                        selectedStaffIds.length > 0 ? 'ring-2 ring-red-50 border-red-200' : 'border-gray-200'
                    } ${status.isNegative ? 'bg-red-50' : 'bg-white'}`}
                >
                    <status.icon size={14} className="text-red-400 mr-2" />
                    <span className="text-xs font-bold text-gray-700 mr-2">{status.name}:</span>
                    
                    {/* Tiny Avatars for Status */}
                    <div className="flex -space-x-1">
                        {assignments[status.id]?.length > 0 ? (
                            assignments[status.id].map(staffId => {
                                const staff = ALL_STAFF.find(s => s.id === staffId);
                                return (
                                    <div key={staffId} className="w-5 h-5 rounded-full bg-white border border-gray-200 flex items-center justify-center text-[8px] font-bold text-gray-600" title={staff.name}>
                                        {getInitials(staff.name)}
                                        {/* Hidden remove button for these small ones could be tricky, assume click parent to edit in real app or add logic */}
                                        <button onClick={(e) => handleRemoveFrom(status.id, staff.id, e)} className="absolute w-full h-full opacity-0 hover:opacity-50 bg-red-500 rounded-full" /> 
                                    </div>
                                )
                            })
                        ) : <span className="text-[10px] text-gray-400 italic">None</span>}
                    </div>
                </div>
            ))}
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        
        {/* --- LEFT PANEL: THE BOARD (TARGETS) --- */}
        <div className="flex-1 bg-gray-100 p-4 overflow-y-auto">
          
          <div className="grid grid-cols-2 gap-4 h-full">
            
            {/* COLUMN 1: MORNING OPERATIONS */}
            <div className="flex flex-col bg-orange-50/30 rounded-xl border border-orange-100 p-2">
                <h3 className="text-xs font-bold text-orange-700 uppercase tracking-wider mb-3 flex items-center justify-center py-2 bg-orange-100/50 rounded-lg">
                    <Sunrise size={16} className="mr-2" /> Morning Operations
                </h3>
                
                {/* AM DUTIES */}
                <div className="grid grid-cols-3 gap-2 mb-4 px-1">
                    {SHIFT_DUTIES.map(duty => (
                        <AssignmentCard 
                            key={`${duty.id}-am`}
                            id={`${duty.id}-am`}
                            title={duty.name}
                            icon={duty.icon}
                            isDuty={true}
                        />
                    ))}
                </div>

                {/* AM TRIPS */}
                <div className="flex-1 overflow-y-auto space-y-2 px-1">
                    <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider pl-1 mb-1">Boats & Class</h4>
                    {morningTrips.map(trip => (
                        <AssignmentCard 
                            key={trip.id}
                            id={trip.id}
                            title={trip.name}
                            subtitle={trip.time}
                            icon={trip.type === 'trip' ? Anchor : GraduationCap}
                        />
                    ))}
                </div>
            </div>

            {/* COLUMN 2: AFTERNOON OPERATIONS */}
            <div className="flex flex-col bg-indigo-50/30 rounded-xl border border-indigo-100 p-2">
                <h3 className="text-xs font-bold text-indigo-700 uppercase tracking-wider mb-3 flex items-center justify-center py-2 bg-indigo-100/50 rounded-lg">
                    <Moon size={16} className="mr-2" /> Afternoon Operations
                </h3>
                
                {/* PM DUTIES */}
                <div className="grid grid-cols-3 gap-2 mb-4 px-1">
                    {SHIFT_DUTIES.map(duty => (
                        <AssignmentCard 
                            key={`${duty.id}-pm`}
                            id={`${duty.id}-pm`}
                            title={duty.name}
                            icon={duty.icon}
                            isDuty={true}
                        />
                    ))}
                </div>

                {/* PM TRIPS */}
                <div className="flex-1 overflow-y-auto space-y-2 px-1">
                    <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider pl-1 mb-1">Boats & Class</h4>
                    {afternoonTrips.map(trip => (
                        <AssignmentCard 
                            key={trip.id}
                            id={trip.id}
                            title={trip.name}
                            subtitle={trip.time}
                            icon={trip.type === 'trip' ? Anchor : GraduationCap}
                        />
                    ))}
                </div>
            </div>

          </div>
        </div>

        {/* --- RIGHT PANEL: STAFF ROSTER --- */}
        <div className="w-48 bg-white border-l border-gray-200 flex flex-col shadow-lg z-10">
          <div className="p-3 bg-gray-50 border-b border-gray-200 font-bold text-gray-600 uppercase text-xs tracking-wider flex justify-between items-center">
            <span>Staff List</span>
            <span className="bg-gray-200 text-gray-500 px-1.5 py-0.5 rounded text-[10px]">{ALL_STAFF.length}</span>
          </div>
          
          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {ALL_STAFF.map(staff => {
              const isSelected = selectedStaffIds.includes(staff.id);
              
              return (
                <div 
                  key={staff.id}
                  onClick={() => handleStaffClick(staff.id)}
                  className={`px-3 py-2 rounded border cursor-pointer select-none flex items-center justify-between transition-all ${
                    isSelected 
                      ? 'bg-blue-600 border-blue-600 text-white shadow-md' 
                      : 'bg-white border-gray-100 hover:border-blue-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <span className="text-xs font-bold truncate pr-2">{staff.name}</span>
                  <span 
                    title={staff.role} 
                    className={`w-2 h-2 rounded-full shrink-0 ${isSelected ? 'bg-white' : staff.color}`}
                  ></span>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
};

export default StaffView;
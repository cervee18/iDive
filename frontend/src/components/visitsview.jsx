import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { 
  Calendar, MapPin, Home, Users, Plus, 
  Search, Trash2, Save, UserPlus 
} from 'lucide-react';

const VisitsView = () => {
  const [visits, setVisits] = useState([]);
  const [selectedVisitId, setSelectedVisitId] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Form State for the selected visit
  const [formData, setFormData] = useState({
    group_name: '', start_date: '', end_date: '', location: '', room_number: '', notes: ''
  });

  // Search State for adding clients
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);

  // --- 1. FETCH ALL VISITS ---
  const fetchVisits = async () => {
    // We get the visit AND the clients inside it
    const { data, error } = await supabase
      .from('visits')
      .select(`
        *,
        visit_members (
          client:clients (*) 
        )
      `)
      .order('start_date', { ascending: false });

    if (error) console.error('Error fetching visits:', error);
    else setVisits(data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchVisits();
  }, []);

  // --- 2. SELECT A VISIT ---
  const handleSelectVisit = (visit) => {
    setSelectedVisitId(visit.id);
    setFormData({
      group_name: visit.group_name || '',
      start_date: visit.start_date,
      end_date: visit.end_date,
      location: visit.location || '',
      room_number: visit.room_number || '',
      notes: visit.notes || ''
    });
    setSearchTerm('');
    setSearchResults([]);
  };

  // --- 3. CREATE NEW VISIT ---
  const handleCreateVisit = async () => {
    const { data: orgData } = await supabase.from('organizations').select('id').single();
    
    // Default new visit to "Today"
    const today = new Date().toISOString().split('T')[0];
    const { data, error } = await supabase
      .from('visits')
      .insert([{
        organization_id: orgData.id,
        group_name: 'New Group',
        start_date: today,
        end_date: today
      }])
      .select();

    if (error) alert('Error creating visit');
    else {
      await fetchVisits();
      handleSelectVisit(data[0]);
    }
  };

  // --- 4. UPDATE VISIT DETAILS ---
  const handleSaveDetails = async () => {
    if (!selectedVisitId) return;
    const { error } = await supabase
      .from('visits')
      .update(formData)
      .eq('id', selectedVisitId);

    if (error) alert('Error saving');
    else {
      alert('Visit updated!');
      fetchVisits(); // Refresh list to show new name/dates
    }
  };

  // --- 5. SEARCH CLIENTS TO ADD ---
  const handleSearchClients = async (term) => {
    setSearchTerm(term);
    if (term.length < 2) {
        setSearchResults([]);
        return;
    }
    const { data } = await supabase
      .from('clients')
      .select('*')
      .ilike('first_name', `%${term}%`)
      .limit(5);
    
    setSearchResults(data || []);
  };

  // --- 6. ADD CLIENT TO VISIT ---
  const handleAddMember = async (clientId) => {
    const { error } = await supabase
      .from('visit_members')
      .insert([{ visit_id: selectedVisitId, client_id: clientId }]);

    if (error) {
        if(error.code === '23505') alert("Client is already in this group.");
        else alert("Error adding client");
    } else {
        setSearchTerm('');
        setSearchResults([]);
        fetchVisits(); // Refresh to show new member
    }
  };

  // --- 7. REMOVE MEMBER ---
  const handleRemoveMember = async (clientId) => {
    if(!confirm("Remove from group?")) return;
    const { error } = await supabase
      .from('visit_members')
      .delete()
      .eq('visit_id', selectedVisitId)
      .eq('client_id', clientId);
      
    if (!error) fetchVisits();
  };

  const currentVisit = visits.find(v => v.id === selectedVisitId);

  return (
    <div className="flex h-full gap-6">
      
      {/* --- LEFT PANEL: LIST OF VISITS --- */}
      <div className="w-1/3 flex flex-col bg-white border border-gray-200 rounded-lg h-full shadow-sm">
        <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50 rounded-t-lg">
            <h2 className="font-bold text-gray-700">Active Visits</h2>
            <button 
                onClick={handleCreateVisit}
                className="bg-blue-600 text-white p-2 rounded hover:bg-blue-700 transition-colors" title="New Visit">
                <Plus size={18} />
            </button>
        </div>
        <div className="flex-1 overflow-y-auto p-2 space-y-2">
            {loading ? <div className="p-4 text-center text-gray-400">Loading...</div> : 
             visits.map(visit => (
                <div 
                    key={visit.id}
                    onClick={() => handleSelectVisit(visit)}
                    className={`p-4 rounded-lg cursor-pointer border transition-all ${
                        selectedVisitId === visit.id 
                        ? 'bg-blue-50 border-blue-500 shadow-sm' 
                        : 'bg-white border-gray-200 hover:border-blue-300'
                    }`}
                >
                    <div className="flex justify-between items-start mb-1">
                        <span className="font-bold text-gray-800">{visit.group_name || 'Unnamed Group'}</span>
                        <span className="text-xs bg-gray-200 px-2 py-0.5 rounded text-gray-600">{visit.visit_members?.length || 0} Pax</span>
                    </div>
                    <div className="text-xs text-gray-500 flex items-center">
                        <Calendar size={12} className="mr-1"/> 
                        {visit.start_date} <span className="mx-1">→</span> {visit.end_date}
                    </div>
                    {(visit.location) && (
                        <div className="text-xs text-gray-400 mt-1 flex items-center">
                            <MapPin size={12} className="mr-1"/> {visit.location}
                        </div>
                    )}
                </div>
            ))}
        </div>
      </div>

      {/* --- RIGHT PANEL: VISIT DETAILS --- */}
      <div className="flex-1 bg-white border border-gray-200 rounded-lg h-full shadow-sm flex flex-col">
        {selectedVisitId ? (
            <>
                <div className="p-6 border-b border-gray-100">
                    <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                        <Home className="mr-2 text-blue-600"/> Visit Details
                    </h2>
                    
                    {/* EDIT FORM */}
                    <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                            <label className="text-xs font-bold text-gray-500 uppercase">Group Name</label>
                            <input 
                                type="text" 
                                className="w-full border border-gray-300 rounded p-2 text-sm mt-1 focus:ring-2 focus:ring-blue-500 outline-none"
                                value={formData.group_name}
                                onChange={e => setFormData({...formData, group_name: e.target.value})}
                            />
                        </div>
                        <div className="flex space-x-2">
                            <div className="flex-1">
                                <label className="text-xs font-bold text-gray-500 uppercase">Start</label>
                                <input 
                                    type="date" 
                                    className="w-full border border-gray-300 rounded p-2 text-sm mt-1"
                                    value={formData.start_date}
                                    onChange={e => setFormData({...formData, start_date: e.target.value})}
                                />
                            </div>
                            <div className="flex-1">
                                <label className="text-xs font-bold text-gray-500 uppercase">End</label>
                                <input 
                                    type="date" 
                                    className="w-full border border-gray-300 rounded p-2 text-sm mt-1"
                                    value={formData.end_date}
                                    onChange={e => setFormData({...formData, end_date: e.target.value})}
                                />
                            </div>
                        </div>
                        <div>
                            <label className="text-xs font-bold text-gray-500 uppercase">Location / Hotel</label>
                            <input 
                                type="text" 
                                className="w-full border border-gray-300 rounded p-2 text-sm mt-1"
                                placeholder="e.g. Ritz Carlton"
                                value={formData.location}
                                onChange={e => setFormData({...formData, location: e.target.value})}
                            />
                        </div>
                        <div>
                            <label className="text-xs font-bold text-gray-500 uppercase">Room Number</label>
                            <input 
                                type="text" 
                                className="w-full border border-gray-300 rounded p-2 text-sm mt-1"
                                placeholder="e.g. 104"
                                value={formData.room_number}
                                onChange={e => setFormData({...formData, room_number: e.target.value})}
                            />
                        </div>
                    </div>
                    <button 
                        onClick={handleSaveDetails}
                        className="flex items-center text-sm bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                    >
                        <Save size={16} className="mr-2"/> Save Changes
                    </button>
                </div>

                {/* MEMBERS SECTION */}
                <div className="flex-1 p-6 bg-gray-50 overflow-y-auto">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="font-bold text-gray-700 flex items-center">
                            <Users className="mr-2"/> Group Members
                        </h3>
                        
                        {/* SEARCH ADD */}
                        <div className="relative w-64">
                            <input 
                                type="text" 
                                placeholder="Search client to add..." 
                                className="w-full pl-8 pr-4 py-2 text-sm border rounded-full focus:outline-none focus:border-blue-500 shadow-sm"
                                value={searchTerm}
                                onChange={e => handleSearchClients(e.target.value)}
                            />
                            <Search className="absolute left-2.5 top-2.5 text-gray-400" size={14}/>
                            
                            {/* RESULTS DROPDOWN */}
                            {searchResults.length > 0 && (
                                <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-xl z-10 overflow-hidden">
                                    {searchResults.map(client => (
                                        <div 
                                            key={client.id}
                                            onClick={() => handleAddMember(client.id)}
                                            className="px-4 py-2 hover:bg-blue-50 cursor-pointer text-sm border-b border-gray-50 last:border-0 flex justify-between items-center"
                                        >
                                            <span>{client.first_name} {client.last_name}</span>
                                            <UserPlus size={14} className="text-blue-500"/>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {currentVisit?.visit_members?.map(vm => (
                            <div key={vm.client.id} className="bg-white p-3 rounded-lg border border-gray-200 flex justify-between items-center shadow-sm">
                                <div>
                                    <div className="font-bold text-gray-800">{vm.client.first_name} {vm.client.last_name}</div>
                                    <div className="text-xs text-gray-500">{vm.client.certification_level} • {vm.client.total_dives} dives</div>
                                </div>
                                <button 
                                    onClick={() => handleRemoveMember(vm.client.id)}
                                    className="text-gray-400 hover:text-red-500 p-1"
                                >
                                    <Trash2 size={16}/>
                                </button>
                            </div>
                        ))}
                        {(!currentVisit?.visit_members || currentVisit.visit_members.length === 0) && (
                            <div className="text-gray-400 italic text-sm p-2">No members added yet.</div>
                        )}
                    </div>
                </div>
            </>
        ) : (
            <div className="flex-1 flex items-center justify-center text-gray-400">
                Select a visit to manage
            </div>
        )}
      </div>
    </div>
  );
};

export default VisitsView;
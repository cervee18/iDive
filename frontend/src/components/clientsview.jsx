import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { 
  Search, Calendar, MapPin, Home, 
  Users, Plus, Trash2, X, Edit2, Anchor, ExternalLink, UserPlus, FileText, Phone
} from 'lucide-react';

const ClientsView = () => {
  // --- STATE ---
  const [clients, setClients] = useState([]);
  const [selectedClient, setSelectedClient] = useState(null);
  const [clientVisits, setClientVisits] = useState([]); 
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);

  // Client Profile Form
  const [profileForm, setProfileForm] = useState({
    first_name: '', 
    last_name: '', 
    email: '', 
    phone: '', 
    certification_level: 'Open Water', 
    last_dive: '',
    general_notes: ''
  });

  // Visit Modal State
  const [isVisitModalOpen, setIsVisitModalOpen] = useState(false);
  const [editingVisit, setEditingVisit] = useState(null); 
  const [pendingFriends, setPendingFriends] = useState([]); 
  const [visitForm, setVisitForm] = useState({
    start_date: '', end_date: '', location: '', room_number: '', notes: ''
  });
  
  const [friendSearchTerm, setFriendSearchTerm] = useState('');
  const [friendSearchResults, setFriendSearchResults] = useState([]);

  // --- 1. FETCH CLIENTS ---
  const fetchClients = async () => {
    const { data } = await supabase.from('clients').select('*').order('first_name');
    setClients(data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchClients();
  }, []);

  // --- 2. FETCH VISITS ---
  const fetchVisitsForClient = async (clientId) => {
    if (!clientId || clientId === 'new') return;

    const { data: memberData } = await supabase
      .from('visit_members')
      .select('visit_id')
      .eq('client_id', clientId);

    const visitIds = memberData?.map(v => v.visit_id) || [];

    if (visitIds.length > 0) {
      const { data: visitsData, error } = await supabase
        .from('visits')
        .select(`
          *,
          visit_members (
            client:clients (id, first_name, last_name)
          ),
          manifest (
            id,
            client_id,
            trip:trips (name, date, start_time, boat_name)
          )
        `)
        .in('id', visitIds)
        .order('start_date', { ascending: false });
      
      if (error) console.error('Error fetching trips:', error);
      setClientVisits(visitsData || []);
    } else {
      setClientVisits([]);
    }
  };

  // --- ACTIONS: SELECT & SEARCH ---
  const handleSelectClient = (client) => {
    setIsVisitModalOpen(false);
    setSelectedClient(client);
    setProfileForm({
        first_name: client.first_name || '',
        last_name: client.last_name || '',
        email: client.email || '',
        phone: client.phone || '', 
        certification_level: client.certification_level || 'Open Water',
        last_dive: client.last_dive || '',
        general_notes: client.general_notes || ''
    });
    setSearchTerm('');
    setSearchResults([]);
    fetchVisitsForClient(client.id);
  };

  const handleClientSearch = (term) => {
    setSearchTerm(term);
    if (term.length < 1) {
        setSearchResults([]);
        return;
    }
    const results = clients.filter(c => 
        (c.first_name + ' ' + c.last_name).toLowerCase().includes(term.toLowerCase())
    );
    setSearchResults(results);
  };

  // --- ACTIONS: CREATE, SAVE & DELETE CLIENT ---
  const handleCreateClientSetup = () => {
    setSelectedClient({ id: 'new' }); 
    setProfileForm({
        first_name: '', 
        last_name: '', 
        email: '', 
        phone: '', 
        certification_level: 'Open Water', 
        last_dive: '', 
        general_notes: ''
    });
    setClientVisits([]);
    setSearchTerm('');
    setSearchResults([]);
  };

  const handleSaveProfile = async () => {
    if (!profileForm.first_name || !profileForm.last_name) return alert("Name is required.");

    const cleanForm = {
        ...profileForm,
        last_dive: profileForm.last_dive === '' ? null : profileForm.last_dive
    };

    if (selectedClient.id === 'new') {
        // INSERT
        const { data: orgData } = await supabase.from('organizations').select('id').limit(1).single();
        if (!orgData) return alert("Organization error");

        const { data, error } = await supabase
            .from('clients')
            .insert([{ ...cleanForm, organization_id: orgData.id }])
            .select()
            .single();

        if (error) {
            console.error("Create Error:", error);
            alert("Error creating client: " + error.message);
        } else {
            alert("Client created!");
            fetchClients(); 
            handleSelectClient(data); 
        }
    } else {
        // UPDATE
        const { error } = await supabase
            .from('clients')
            .update(cleanForm)
            .eq('id', selectedClient.id);
        
        if (error) {
            console.error("Update Error:", error);
            alert('Error saving profile: ' + error.message);
        } else {
            alert('Profile saved');
            fetchClients();
        }
    }
  };

  const handleDeleteClient = async () => {
    if (!selectedClient || selectedClient.id === 'new') return;

    const confirmMsg = `Delete ${selectedClient.first_name}? \n\nThis cannot be undone.`;
    if (!window.confirm(confirmMsg)) return;

    const { error } = await supabase
        .from('clients')
        .delete()
        .eq('id', selectedClient.id);

    if (error) {
        console.error("Delete error:", error);
        alert("Failed to delete. Check console.");
    } else {
        alert("Client deleted.");
        setSelectedClient(null); 
        fetchClients(); 
    }
  };

  // --- ACTIONS: VISITS & FRIENDS ---
  const openVisitModal = (visit = null) => {
    setFriendSearchTerm('');
    setFriendSearchResults([]);
    setPendingFriends([]); 

    if (visit) {
        setEditingVisit(visit);
        setVisitForm({
            start_date: visit.start_date,
            end_date: visit.end_date,
            location: visit.location || '',
            room_number: visit.room_number || '',
            notes: visit.notes || ''
        });
    } else {
        setEditingVisit(null); 
        const today = new Date().toISOString().split('T')[0];
        setVisitForm({
            start_date: today, end_date: today, 
            location: '', room_number: '', notes: ''
        });
    }
    setIsVisitModalOpen(true);
  };

  const handleSaveVisit = async () => {
    const { data: orgData } = await supabase.from('organizations').select('id').limit(1).single();
    if (!orgData) return alert("Error: Could not find Organization.");

    let visitId = editingVisit?.id;

    if (editingVisit) {
        const { error } = await supabase.from('visits').update(visitForm).eq('id', visitId);
        if (error) return alert("Update failed: " + error.message);
    } else {
        const { data, error } = await supabase
            .from('visits')
            .insert([{ ...visitForm, organization_id: orgData.id, group_name: 'Visit' }])
            .select();
        
        if (error) return alert("Create failed: " + error.message);
        visitId = data[0].id;

        const membersToInsert = [
            { visit_id: visitId, client_id: selectedClient.id }, 
            ...pendingFriends.map(f => ({ visit_id: visitId, client_id: f.id })) 
        ];

        const { error: memberError } = await supabase.from('visit_members').insert(membersToInsert);
        if (memberError) console.error("Link Error:", memberError);
    }

    setIsVisitModalOpen(false);
    fetchVisitsForClient(selectedClient.id);
  };

  const handleDeleteVisit = async (visitId) => {
    if (!confirm("Delete this visit record?")) return;
    await supabase.from('visits').delete().eq('id', visitId);
    fetchVisitsForClient(selectedClient.id);
  };

  const handleFriendSearch = (term) => {
    setFriendSearchTerm(term);
    if (term.length < 1) { setFriendSearchResults([]); return; }
    const currentMemberIds = editingVisit 
        ? editingVisit.visit_members.map(m => m.client.id) 
        : [selectedClient.id, ...pendingFriends.map(f => f.id)]; 
    const results = clients.filter(c => 
        (c.first_name + ' ' + c.last_name).toLowerCase().includes(term.toLowerCase()) &&
        !currentMemberIds.includes(c.id)
    );
    setFriendSearchResults(results);
  };

  const handleAddFriendToVisit = async (friend) => {
    if (editingVisit) {
        const { error } = await supabase.from('visit_members').insert([{ visit_id: editingVisit.id, client_id: friend.id }]);
        if (error) alert("Error adding member");
        else {
            const { data } = await supabase.from('visits').select(`*, visit_members(client:clients(*))`).eq('id', editingVisit.id).single();
            setEditingVisit(data);
        }
    } else {
        setPendingFriends([...pendingFriends, friend]);
    }
    setFriendSearchTerm('');
    setFriendSearchResults([]);
  };

  const handleRemoveFriend = async (friendId) => {
    if (editingVisit) {
        await supabase.from('visit_members').delete().eq('visit_id', editingVisit.id).eq('client_id', friendId);
        const { data } = await supabase.from('visits').select(`*, visit_members(client:clients(*))`).eq('id', editingVisit.id).single();
        setEditingVisit(data);
    } else {
        setPendingFriends(pendingFriends.filter(f => f.id !== friendId));
    }
  };

  return (
    <div className="flex flex-col h-full bg-gray-100 rounded-lg overflow-hidden relative">
      
      {/* --- TOP BAR --- */}
      <div className="bg-white p-4 border-b border-gray-200 shrink-0 z-20 flex justify-between items-center">
        <div className="relative w-full max-w-lg flex items-center space-x-2">
            <div className="relative flex-1">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                <input
                    type="text"
                    placeholder="Search database to manage client..."
                    className="w-full pl-9 pr-4 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
                    value={searchTerm}
                    onChange={e => handleClientSearch(e.target.value)}
                />
                {searchResults.length > 0 && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-y-auto">
                        {searchResults.map(client => (
                            <div 
                                key={client.id}
                                onClick={() => handleSelectClient(client)}
                                className="px-4 py-2 hover:bg-blue-50 cursor-pointer text-sm border-b border-gray-50 last:border-0"
                            >
                                <span className="font-bold">{client.first_name} {client.last_name}</span>
                                <span className="text-gray-400 ml-2 text-xs">{client.email}</span>
                            </div>
                        ))}
                    </div>
                )}
            </div>
            <button 
                onClick={handleCreateClientSetup}
                className="bg-blue-600 text-white p-2 rounded-md hover:bg-blue-700 transition-colors flex items-center shadow-sm"
                title="Create New Client"
            >
                <UserPlus size={20} />
                <span className="ml-2 text-sm font-bold hidden md:inline">New Client</span>
            </button>
        </div>
      </div>

      {selectedClient ? (
        <div className="flex flex-1 overflow-hidden">
            
            {/* --- LEFT COL: CLIENT PROFILE --- */}
            <div className="w-1/3 bg-white border-r border-gray-200 p-6 overflow-y-auto">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-lg font-bold text-gray-800">
                        {selectedClient.id === 'new' ? 'Create New Profile' : 'Client Profile'}
                    </h2>
                    {selectedClient.id !== 'new' && (
                        <button onClick={handleDeleteClient} className="text-gray-400 hover:text-red-600 p-2 rounded hover:bg-red-50 transition-colors">
                            <Trash2 size={18} />
                        </button>
                    )}
                </div>

                <div className="space-y-4">
                    {/* Names */}
                    <div className="grid grid-cols-2 gap-2">
                        <div>
                            <label className="text-xs font-bold text-gray-500 uppercase">First Name</label>
                            <input 
                                className="w-full border p-2 rounded mt-1 focus:ring-2 focus:ring-blue-500 outline-none" 
                                value={profileForm.first_name}
                                onChange={e => setProfileForm({...profileForm, first_name: e.target.value})}
                            />
                        </div>
                        <div>
                            <label className="text-xs font-bold text-gray-500 uppercase">Last Name</label>
                            <input 
                                className="w-full border p-2 rounded mt-1 focus:ring-2 focus:ring-blue-500 outline-none" 
                                value={profileForm.last_name}
                                onChange={e => setProfileForm({...profileForm, last_name: e.target.value})}
                            />
                        </div>
                    </div>

                    {/* Contacts */}
                    <div className="grid grid-cols-2 gap-2">
                        <div>
                            <label className="text-xs font-bold text-gray-500 uppercase">Email</label>
                            <input 
                                className="w-full border p-2 rounded mt-1 text-sm focus:ring-2 focus:ring-blue-500 outline-none" 
                                value={profileForm.email}
                                onChange={e => setProfileForm({...profileForm, email: e.target.value})}
                            />
                        </div>
                        <div>
                            <label className="text-xs font-bold text-gray-500 uppercase">Phone</label>
                            <input 
                                className="w-full border p-2 rounded mt-1 text-sm focus:ring-2 focus:ring-blue-500 outline-none" 
                                value={profileForm.phone || ''} 
                                placeholder="+1 345..."
                                onChange={e => setProfileForm({...profileForm, phone: e.target.value})}
                            />
                        </div>
                    </div>

                    {/* Dive Info */}
                    <div className="grid grid-cols-2 gap-2">
                        <div>
                            <label className="text-xs font-bold text-gray-500 uppercase">Level</label>
                            <select 
                                className="w-full border p-2 rounded mt-1 bg-white"
                                value={profileForm.certification_level}
                                onChange={e => setProfileForm({...profileForm, certification_level: e.target.value})}
                            >
                                <option>Open Water</option>
                                <option>Advanced</option>
                                <option>Rescue</option>
                                <option>Divemaster</option>
                                <option>Instructor</option>
                            </select>
                        </div>
                        <div>
                            <label className="text-xs font-bold text-gray-500 uppercase">Last Dive</label>
                            <input 
                                type="date"
                                className="w-full border p-2 rounded mt-1" 
                                value={profileForm.last_dive || ''}
                                onChange={e => setProfileForm({...profileForm, last_dive: e.target.value})}
                            />
                        </div>
                    </div>
                    
                    {/* Notes */}
                    <div>
                        <label className="text-xs font-bold text-gray-500 uppercase flex items-center mb-1">
                            <FileText size={12} className="mr-1"/> Notes / Medical
                        </label>
                        <textarea 
                            className="w-full border p-2 rounded h-24 text-sm resize-none focus:ring-2 focus:ring-blue-500 outline-none"
                            placeholder="Add notes about experience, medical conditions, or preferences..."
                            value={profileForm.general_notes}
                            onChange={e => setProfileForm({...profileForm, general_notes: e.target.value})}
                        />
                    </div>

                    <button 
                        onClick={handleSaveProfile}
                        className={`w-full text-white py-2 rounded font-bold mt-2 shadow-sm transition-colors ${
                            selectedClient.id === 'new' 
                            ? 'bg-green-600 hover:bg-green-700' 
                            : 'bg-blue-600 hover:bg-blue-700'
                        }`}
                    >
                        {selectedClient.id === 'new' ? 'Create Client' : 'Save Changes'}
                    </button>
                </div>
            </div>

            {/* --- RIGHT COL: VISITS HISTORY --- */}
            <div className="flex-1 bg-gray-50 p-6 overflow-y-auto">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-lg font-bold text-gray-800">Visit History</h2>
                    {selectedClient.id !== 'new' && (
                        <button 
                            onClick={() => openVisitModal(null)}
                            className="flex items-center text-sm bg-green-600 text-white px-3 py-2 rounded hover:bg-green-700 shadow-sm"
                        >
                            <Plus size={16} className="mr-1"/> Add Visit
                        </button>
                    )}
                </div>

                {selectedClient.id === 'new' ? (
                    <div className="text-center text-gray-400 mt-10 p-10 border-2 border-dashed border-gray-200 rounded-lg">
                        <UserPlus size={48} className="mx-auto mb-2 opacity-20"/>
                        <p>New Client Mode</p>
                        <p className="text-xs">Save the profile first to add visits.</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {clientVisits.map(visit => {
                            const myTrips = visit.manifest?.filter(m => m.client_id === selectedClient.id) || [];
                            return (
                                <div key={visit.id} className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm relative group">
                                    <div className="flex justify-between items-start mb-3 border-b border-gray-100 pb-3">
                                        <div className="flex items-center">
                                            <div className="bg-blue-100 text-blue-700 p-2 rounded-lg mr-3">
                                                <Calendar size={20}/>
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-gray-800 text-base">
                                                    {visit.start_date} <span className="text-gray-400 mx-1">to</span> {visit.end_date}
                                                </h3>
                                                <div className="flex space-x-3 text-xs text-gray-500 mt-1">
                                                    <span className="flex items-center"><MapPin size={12} className="mr-1"/> {visit.location || 'No Location'}</span>
                                                    <span className="flex items-center"><Home size={12} className="mr-1"/> Rm: {visit.room_number || '-'}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex space-x-2">
                                            <button onClick={() => openVisitModal(visit)} className="text-gray-400 hover:text-blue-600 p-1">
                                                <Edit2 size={16}/>
                                            </button>
                                            <button onClick={() => handleDeleteVisit(visit.id)} className="text-gray-400 hover:text-red-600 p-1">
                                                <Trash2 size={16}/>
                                            </button>
                                        </div>
                                    </div>

                                    <div className="mb-4">
                                        <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 flex items-center">
                                            <Anchor size={12} className="mr-1"/> Scheduled Trips
                                        </h4>
                                        {myTrips.length > 0 ? (
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                                {myTrips.map(m => (
                                                    <div key={m.id} className="bg-gray-50 border border-gray-200 rounded px-2 py-1.5 text-sm flex justify-between items-center">
                                                        <span className="font-medium text-gray-700">{m.trip.name}</span>
                                                        <span className="text-xs text-gray-500">{m.trip.date}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="text-xs text-gray-400 italic">No trips booked yet.</div>
                                        )}
                                    </div>

                                    <div>
                                        <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 flex items-center">
                                            <Users size={12} className="mr-1"/> Visit Group
                                        </h4>
                                        <div className="flex flex-wrap gap-2">
                                            {visit.visit_members?.map(vm => (
                                                <div 
                                                    key={vm.client.id} 
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        const fullClient = clients.find(c => c.id === vm.client.id);
                                                        if (fullClient) handleSelectClient(fullClient);
                                                    }}
                                                    className={`text-xs px-2 py-1 rounded-full border flex items-center gap-1 transition-all ${
                                                        vm.client.id === selectedClient.id 
                                                        ? 'bg-blue-600 border-blue-600 text-white cursor-default' 
                                                        : 'bg-white border-gray-200 text-gray-600 cursor-pointer hover:border-blue-400 hover:text-blue-600'
                                                    }`}
                                                >
                                                    {vm.client.first_name} {vm.client.last_name}
                                                    {vm.client.id !== selectedClient.id && <ExternalLink size={10} className="opacity-50"/>}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                        {clientVisits.length === 0 && (
                            <div className="text-center text-gray-400 mt-10 p-10 border-2 border-dashed border-gray-200 rounded-lg">
                                <Calendar size={48} className="mx-auto mb-2 opacity-20"/>
                                <p>No visits recorded.</p>
                                <p className="text-xs">Click "Add Visit" to start a new trip history.</p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
            <Users size={64} className="mb-4 opacity-20"/>
            <p>Select a client to manage details.</p>
            <p className="text-sm mt-2">Or click "New Client" to add someone.</p>
        </div>
      )}

      {/* --- MODAL: ADD/EDIT VISIT --- */}
      {isVisitModalOpen && (
        <div className="absolute inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl flex flex-col max-h-[90%]">
                <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-gray-50 rounded-t-lg">
                    <h3 className="font-bold text-gray-800">{editingVisit ? 'Edit Visit Details' : 'Create New Visit'}</h3>
                    <button onClick={() => setIsVisitModalOpen(false)}><X size={20} className="text-gray-500"/></button>
                </div>
                
                <div className="p-6 overflow-y-auto">
                    {/* Basic Info */}
                    <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                            <label className="text-xs font-bold text-gray-500 uppercase">Start Date</label>
                            <input type="date" className="w-full border p-2 rounded mt-1" value={visitForm.start_date} onChange={e => setVisitForm({...visitForm, start_date: e.target.value})} />
                        </div>
                        <div>
                            <label className="text-xs font-bold text-gray-500 uppercase">End Date</label>
                            <input type="date" className="w-full border p-2 rounded mt-1" value={visitForm.end_date} onChange={e => setVisitForm({...visitForm, end_date: e.target.value})} />
                        </div>
                        <div>
                            <label className="text-xs font-bold text-gray-500 uppercase">Location / Hotel</label>
                            <input className="w-full border p-2 rounded mt-1" placeholder="e.g. Ritz Carlton" value={visitForm.location} onChange={e => setVisitForm({...visitForm, location: e.target.value})} />
                        </div>
                        <div>
                            <label className="text-xs font-bold text-gray-500 uppercase">Room</label>
                            <input className="w-full border p-2 rounded mt-1" placeholder="104" value={visitForm.room_number} onChange={e => setVisitForm({...visitForm, room_number: e.target.value})} />
                        </div>
                    </div>

                    {/* Member Management */}
                    <div className="border-t border-gray-100 pt-4 mt-4">
                        <label className="text-xs font-bold text-gray-500 uppercase block mb-2">Group Members</label>
                        
                        {/* Add New Member Input */}
                        <div className="relative mb-3">
                            <input 
                                className="w-full border border-blue-300 ring-2 ring-blue-50 rounded p-2 text-sm pl-8 transition-colors"
                                placeholder="Search client to add to this group..."
                                value={friendSearchTerm}
                                onChange={e => handleFriendSearch(e.target.value)}
                            />
                            <Plus className="absolute left-2.5 top-2.5 text-blue-500" size={16}/>
                            {friendSearchResults.length > 0 && (
                                <div className="absolute bottom-full left-0 right-0 mb-1 bg-white border border-gray-200 rounded shadow-lg max-h-40 overflow-y-auto z-10">
                                    {friendSearchResults.map(f => (
                                        <div key={f.id} onClick={() => handleAddFriendToVisit(f)} className="px-3 py-2 hover:bg-blue-50 cursor-pointer text-sm flex justify-between items-center border-b border-gray-50">
                                            <span className="font-medium text-gray-700">{f.first_name} {f.last_name}</span>
                                            <span className="text-xs text-blue-600 font-bold">+ Add</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* List Existing/Draft Members */}
                        <div className="flex flex-wrap gap-2">
                            <div className="flex items-center bg-blue-50 border border-blue-200 text-blue-700 px-3 py-1.5 rounded-md text-sm font-bold">
                                {selectedClient.first_name} {selectedClient.last_name}
                            </div>

                            {(editingVisit ? editingVisit.visit_members.map(m => m.client) : pendingFriends).map(member => (
                                <div key={member.id} className="flex items-center bg-gray-100 border border-gray-200 text-gray-700 px-3 py-1.5 rounded-md text-sm">
                                    {member.first_name} {member.last_name}
                                    {member.id !== selectedClient.id && (
                                        <button onClick={() => handleRemoveFriend(member.id)} className="ml-2 text-gray-400 hover:text-red-500" title="Remove">
                                            <X size={14}/>
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="p-4 border-t border-gray-200 bg-gray-50 rounded-b-lg flex justify-end">
                    <button onClick={handleSaveVisit} className="bg-blue-600 text-white px-6 py-2 rounded font-bold hover:bg-blue-700 shadow-sm">
                        {editingVisit ? 'Save Changes' : 'Create Visit'}
                    </button>
                </div>
            </div>
        </div>
      )}

    </div>
  );
};

export default ClientsView;
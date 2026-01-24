import React, { useState } from 'react';
import { Search, Save, X, Calendar, Ship, Users } from 'lucide-react';

// --- ENHANCED MOCK DATA ---
// We added a 'visits' array to each client to track their history.
const MOCK_CLIENTS = [
  { 
    id: 1, 
    firstName: 'John', 
    lastName: 'Doe', 
    email: 'john@example.com', 
    cert: 'Open Water', 
    dives: 12,
    visits: [
      {
        id: 101,
        start: '2025-01-10',
        end: '2025-01-17',
        trips: ['Jan 11 (Big Blue)', 'Jan 13 (Little Mermaid)', 'Jan 15 (Big Blue)'],
        companions: ['Maria Silva', 'James Bond'] 
      },
      {
        id: 102,
        start: '2024-06-01',
        end: '2024-06-05',
        trips: ['June 02 (Big Blue)'],
        companions: ['Sarah Connor'] 
      }
    ]
  },
  { 
    id: 2, 
    firstName: 'Maria', 
    lastName: 'Silva', 
    email: 'maria@brazil.com', 
    cert: 'Rescue Diver', 
    dives: 150,
    visits: [
      {
        id: 201,
        start: '2025-01-10',
        end: '2025-01-17',
        trips: ['Jan 11 (Big Blue)', 'Jan 15 (Big Blue)'],
        companions: ['John Doe'] 
      }
    ]
  },
  { id: 3, firstName: 'James', lastName: 'Bond', email: '007@mi6.gov', cert: 'Master Scuba Diver', dives: 40, visits: [] },
  { id: 4, firstName: 'Sarah', lastName: 'Connor', email: 'sarah@skynet.net', cert: 'Advanced Open Water', dives: 25, visits: [] },
];

const ClientsView = () => {
  const [clients, setClients] = useState(MOCK_CLIENTS);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClient, setSelectedClient] = useState(null);
  const [showSuggestions, setShowSuggestions] = useState(false);
  
  // We initialize visits as an empty array in the form state
  const [formData, setFormData] = useState({
    firstName: '', lastName: '', email: '', cert: '', dives: '', visits: []
  });

  const suggestions = clients.filter(c => {
    if (!searchTerm) return false;
    const term = searchTerm.toLowerCase();
    return (
      c.firstName.toLowerCase().includes(term) || 
      c.lastName.toLowerCase().includes(term) ||
      c.email.toLowerCase().includes(term)
    );
  });

  const handleSelectClient = (client) => {
    setSelectedClient(client);
    setFormData(client);
    setSearchTerm('');
    setShowSuggestions(false);
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (!selectedClient) return;
    const updatedList = clients.map(c => 
      c.id === selectedClient.id ? { ...formData, id: c.id } : c
    );
    setClients(updatedList);
    alert("Client updated!");
  };

  const handleClear = () => {
    setSelectedClient(null);
    setFormData({ firstName: '', lastName: '', email: '', cert: '', dives: '', visits: [] });
    setSearchTerm('');
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 h-full flex flex-col">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Client Lookup</h2>

      {/* --- SEARCH SECTION --- */}
      <div className="relative mb-8 max-w-xl">
        <label className="block text-sm font-medium text-gray-700 mb-1">Search Database</label>
        <div className="relative">
          <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Start typing name or email..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setShowSuggestions(true);
            }}
          />
        </div>

        {showSuggestions && searchTerm && (
          <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-auto">
            {suggestions.length > 0 ? (
              suggestions.map(client => (
                <button
                  key={client.id}
                  onClick={() => handleSelectClient(client)}
                  className="w-full text-left px-4 py-2 hover:bg-blue-50 text-sm text-gray-700 border-b border-gray-100 last:border-0"
                >
                  <span className="font-bold">{client.firstName} {client.lastName}</span>
                  <span className="text-gray-500 ml-2">({client.email})</span>
                </button>
              ))
            ) : (
              <div className="px-4 py-2 text-sm text-gray-500">No client found</div>
            )}
          </div>
        )}
      </div>

      {/* --- SCROLLABLE CONTENT AREA --- */}
      <div className="flex-1 overflow-y-auto pr-2">
        
        {/* PERSONAL DETAILS FORM */}
        <form onSubmit={handleSave} className="max-w-4xl border-t border-gray-200 pt-6 mb-8">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                    {selectedClient ? 'Personal Details' : 'Client Details (No Selection)'}
                </h3>
                {selectedClient && (
                    <button type="button" onClick={handleClear} className="text-sm text-red-600 hover:text-red-800 underline">
                        Clear Selection
                    </button>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                    <input 
                        type="text"
                        className="w-full p-2 border border-gray-300 rounded-md bg-gray-50 focus:bg-white"
                        value={formData.firstName}
                        onChange={e => setFormData({...formData, firstName: e.target.value})}
                        disabled={!selectedClient}
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                    <input 
                        type="text"
                        className="w-full p-2 border border-gray-300 rounded-md bg-gray-50 focus:bg-white"
                        value={formData.lastName}
                        onChange={e => setFormData({...formData, lastName: e.target.value})}
                        disabled={!selectedClient}
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email Contact</label>
                    <input 
                        type="email"
                        className="w-full p-2 border border-gray-300 rounded-md bg-gray-50 focus:bg-white"
                        value={formData.email}
                        onChange={e => setFormData({...formData, email: e.target.value})}
                        disabled={!selectedClient}
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Certification Level</label>
                    <select 
                        className="w-full p-2 border border-gray-300 rounded-md bg-gray-50 focus:bg-white"
                        value={formData.cert}
                        onChange={e => setFormData({...formData, cert: e.target.value})}
                        disabled={!selectedClient}
                    >
                        <option value="">Select Level...</option>
                        <option>Open Water</option>
                        <option>Advanced Open Water</option>
                        <option>Rescue Diver</option>
                        <option>Divemaster</option>
                        <option>Instructor</option>
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Total Dives</label>
                    <input 
                        type="number"
                        className="w-full p-2 border border-gray-300 rounded-md bg-gray-50 focus:bg-white"
                        value={formData.dives}
                        onChange={e => setFormData({...formData, dives: e.target.value})}
                        disabled={!selectedClient}
                    />
                </div>
            </div>

            <div className="flex space-x-4">
                <button 
                    type="submit" 
                    disabled={!selectedClient}
                    className={`flex items-center px-6 py-2 rounded-md text-white font-medium transition-colors ${
                        selectedClient ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-300 cursor-not-allowed'
                    }`}
                >
                    <Save className="w-4 h-4 mr-2" /> 
                    Save Changes
                </button>
            </div>
        </form>

        {/* --- VISIT HISTORY SECTION --- */}
        {selectedClient && (
            <div className="border-t border-gray-200 pt-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                    <Calendar className="w-5 h-5 mr-2 text-blue-600"/>
                    Visit History
                </h3>
                
                {formData.visits && formData.visits.length > 0 ? (
                    <div className="space-y-4">
                        {formData.visits.map((visit) => (
                            <div key={visit.id} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                                {/* Visit Header: Dates */}
                                <div className="flex justify-between items-center mb-3">
                                    <span className="font-bold text-gray-800">
                                        {visit.start} <span className="text-gray-400 mx-2">to</span> {visit.end}
                                    </span>
                                    <span className="text-xs font-semibold px-2 py-1 bg-blue-100 text-blue-800 rounded-full">
                                        Completed
                                    </span>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {/* Column 1: Trips */}
                                    <div>
                                        <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 flex items-center">
                                            <Ship className="w-3 h-3 mr-1"/> Trips Joined
                                        </h4>
                                        <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
                                            {visit.trips.map((trip, idx) => (
                                                <li key={idx}>{trip}</li>
                                            ))}
                                        </ul>
                                    </div>

                                    {/* Column 2: Companions */}
                                    <div>
                                        <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 flex items-center">
                                            <Users className="w-3 h-3 mr-1"/> Group / Companions
                                        </h4>
                                        <div className="flex flex-wrap gap-2">
                                            {visit.companions.length > 0 ? (
                                                visit.companions.map((buddy, idx) => (
                                                    <span key={idx} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                        {buddy}
                                                    </span>
                                                ))
                                            ) : (
                                                <span className="text-sm text-gray-400 italic">Solo traveler</span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-gray-500 italic p-4 bg-gray-50 rounded-lg">
                        No previous visits recorded for this client.
                    </div>
                )}
            </div>
        )}

      </div>
    </div>
  );
};

export default ClientsView;
import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { FileText, Clock, Activity, ArrowRight } from 'lucide-react';

const LogsView = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    const { data, error } = await supabase
      .from('audit_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50); // Get last 50 actions

    if (error) console.error('Error fetching logs:', error);
    else setLogs(data);
    setLoading(false);
  };

  // Helper to format the "Details" column
  const renderDetails = (log) => {
    if (log.action === 'INSERT') {
      return (
        <span className="text-green-600 flex items-center text-xs">
          New Record Created
        </span>
      );
    }
    if (log.action === 'DELETE') {
      return (
        <span className="text-red-600 flex items-center text-xs">
          Record Deleted
        </span>
      );
    }
    if (log.action === 'UPDATE') {
      // Find what actually changed
      const changes = [];
      const oldD = log.old_data;
      const newD = log.new_data;
      
      Object.keys(newD).forEach(key => {
        if (oldD[key] !== newD[key] && key !== 'updated_at') {
          changes.push(
            <div key={key} className="flex items-center gap-2 mt-1">
              <span className="font-mono bg-gray-100 px-1 rounded">{key}</span>: 
              <span className="line-through text-red-400 opacity-70">{String(oldD[key])}</span>
              <ArrowRight size={10} className="text-gray-400"/>
              <span className="text-green-600 font-bold">{String(newD[key])}</span>
            </div>
          );
        }
      });
      return changes.length > 0 ? <div className="text-xs">{changes}</div> : <span className="text-gray-400 text-xs">Minor update</span>;
    }
  };

  return (
    <div className="flex flex-col h-full bg-gray-50 p-6 overflow-hidden">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center">
          <Activity className="mr-3 text-blue-600" /> System Logs
        </h2>
        <button onClick={fetchLogs} className="text-sm text-blue-600 hover:underline">Refresh</button>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg shadow-sm flex-1 overflow-y-auto">
        <table className="w-full text-left border-collapse">
          <thead className="bg-gray-50 sticky top-0 z-10 border-b border-gray-200">
            <tr>
              <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Time</th>
              <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Action</th>
              <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Target</th>
              <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Changes</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              <tr><td colSpan="4" className="p-4 text-center text-gray-400">Loading logs...</td></tr>
            ) : logs.map(log => (
              <tr key={log.id} className="hover:bg-gray-50 transition-colors">
                <td className="p-4 whitespace-nowrap text-sm text-gray-500">
                  <div className="flex items-center">
                    <Clock size={14} className="mr-2 opacity-50" />
                    {new Date(log.created_at).toLocaleString()}
                  </div>
                </td>
                <td className="p-4 whitespace-nowrap">
                  <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                    log.action === 'INSERT' ? 'bg-green-100 text-green-700' :
                    log.action === 'DELETE' ? 'bg-red-100 text-red-700' :
                    'bg-blue-100 text-blue-700'
                  }`}>
                    {log.action}
                  </span>
                </td>
                <td className="p-4 whitespace-nowrap text-sm font-bold text-gray-700">
                  {log.table_name.toUpperCase()}
                </td>
                <td className="p-4 text-sm text-gray-600">
                  {renderDetails(log)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default LogsView;
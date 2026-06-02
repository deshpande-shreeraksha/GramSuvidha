import React, { useState, useEffect } from 'react';
import { Search, Filter, Eye, AlertTriangle, Droplets, Trash2, Zap, MoreVertical, FileText, CheckCircle, XCircle } from 'lucide-react';

const mockComplaints = [
  {
    id: 'CMP-001',
    category: 'WATER SUPPLY',
    title: 'Major pipeline burst causing heavy water leakage on the sidewalk.',
    status: 'Pending',
    assigned: '-',
    location: 'S V Road, Bandra West, Mumbai',
    icon: <Droplets size={20} className="text-[#C4F8FF]" />,
    bg: 'bg-[#C4F8FF]/20',
  },
  {
    id: 'CMP-002',
    category: 'ROADS',
    title: 'Extremely deep pothole in the middle of the road, causing multiple fall...',
    status: 'In Progress',
    assigned: 'RAJESH KUMAR',
    location: 'SV Road, Bandra West, Mumbai',
    icon: <AlertTriangle size={20} className="text-[#C4F8FF]" />,
    bg: 'bg-[#C4F8FF]/20',
  },
];

const getCategoryStyles = (category) => {
  const normalized = (category || '').toUpperCase();
  if (normalized.includes('WATER')) {
    return { icon: <Droplets size={20} className="text-[#C4F8FF]" />, bg: 'bg-[#C4F8FF]/10 border border-[#C4F8FF]/20' };
  } else if (normalized.includes('ROAD')) {
    return { icon: <AlertTriangle size={20} className="text-[#C4F8FF]" />, bg: 'bg-[#C4F8FF]/10 border border-[#C4F8FF]/20' };
  } else if (normalized.includes('GARBAGE')) {
    return { icon: <Trash2 size={20} className="text-stone-400" />, bg: 'bg-stone-500/10 border border-stone-500/20' };
  } else if (normalized.includes('ELECT')) {
    return { icon: <Zap size={20} className="text-yellow-400" />, bg: 'bg-yellow-500/10 border border-yellow-500/20' };
  }
  return { icon: <AlertTriangle size={20} className="text-[#C4F8FF]" />, bg: 'bg-purple-500/10 border border-purple-500/20' };
};

const ComplaintsManagement = () => {
  const [complaints, setComplaints] = useState([]);
  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [modalStatus, setModalStatus] = useState('Pending');
  const [modalAssigned, setModalAssigned] = useState('-');
  const [modalResolutionCost, setModalResolutionCost] = useState(0);
  const [modalResolutionCostDescription, setModalResolutionCostDescription] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');

  const fetchComplaintsAndWorkers = async () => {
    try {
      const token = localStorage.getItem('token');
      const [compRes, workRes] = await Promise.all([
        fetch('/api/complaints', {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch('/api/auth/workers', {
          headers: { 'Authorization': `Bearer ${token}` }
        })
      ]);

      if (compRes.ok) {
        const data = await compRes.json();
        if (data && data.length > 0) {
          const formatted = data.map((c, i) => {
            const styles = getCategoryStyles(c.category);
            return {
              _id: c._id,
              id: c._id ? `CMP-${c._id.slice(-4).toUpperCase()}` : `CMP-00${i + 1}`,
              category: c.category ? c.category.replace('_', ' ').toUpperCase() : 'GENERAL',
              title: c.description || 'No description provided',
              status: c.status || 'Pending',
              assigned: c.assigned || '-',
              location: c.location || 'Unknown Location',
              user: c.user,
              documents: c.documents || [],
              latitude: c.latitude,
              longitude: c.longitude,
              ...styles
            };
          });
          setComplaints(formatted);
        } else {
          setComplaints(mockComplaints);
        }
      } else {
        setComplaints(mockComplaints);
      }

      if (workRes.ok) {
        const workersData = await workRes.json();
        setWorkers(workersData);
      }
    } catch (error) {
      console.error("Error fetching data, using mock fallback:", error);
      setComplaints(mockComplaints);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaintsAndWorkers();
  }, []);

  const handleOpenModal = (complaint) => {
    setSelectedComplaint(complaint);
    setModalStatus(complaint.status);
    setModalAssigned(complaint.assigned || '-');
    setModalResolutionCost(complaint.resolutionCost || 0);
    setModalResolutionCostDescription(complaint.resolutionCostDescription || '');
  };

  const handleUpdateComplaint = async () => {
    if (!selectedComplaint || !selectedComplaint._id) {
      // Mock update fallback
      const updated = complaints.map(c => 
        c.id === selectedComplaint.id ? { ...c, status: modalStatus, assigned: modalAssigned, resolutionCost: modalResolutionCost, resolutionCostDescription: modalResolutionCostDescription } : c
      );
      setComplaints(updated);
      setSelectedComplaint(null);
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/complaints/${selectedComplaint._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ 
          status: modalStatus, 
          assigned: modalAssigned,
          resolutionCost: Number(modalResolutionCost),
          resolutionCostDescription: modalResolutionCostDescription
        })
      });

      if (response.ok) {
        fetchComplaintsAndWorkers();
        setSelectedComplaint(null);
      } else {
        alert('Failed to update complaint');
      }
    } catch (err) {
      console.error(err);
      alert('Network error');
    }
  };

  const handleQuickUpdateStatus = async (status) => {
    if (!selectedComplaint || !selectedComplaint._id) {
      // Mock update fallback
      const updated = complaints.map(c => 
        c.id === selectedComplaint.id ? { ...c, status } : c
      );
      setComplaints(updated);
      setSelectedComplaint(null);
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/complaints/${selectedComplaint._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status })
      });

      if (response.ok) {
        fetchComplaintsAndWorkers();
        setSelectedComplaint(null);
      } else {
        alert('Failed to update status');
      }
    } catch (err) {
      console.error(err);
      alert('Network error');
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[#C4F8FF] flex items-center gap-3">
            Complaints
            <span className="text-xs font-bold bg-green-500/10 text-green-400 px-3 py-1 rounded-full border border-green-500/20 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse"></span> {workers.length || 28} Workers Active
            </span>
          </h1>
          <p className="text-[#C4F8FF]/70 mt-1">Detailed review and resolution of civic reports.</p>
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
            <h3 className="font-bold text-lg text-[#C4F8FF]">Civic Complaints</h3>
            {/* Status Tabs */}
            <div className="flex bg-[#0F4B70]/40 p-1 rounded-xl border border-[#C4F8FF]/15 text-xs">
              {['All', 'Pending', 'In Progress', 'Resolved', 'Rejected'].map(status => (
                <button
                  key={status}
                  onClick={() => setFilterStatus(status)}
                  className={`px-3 py-1.5 font-bold rounded-lg transition-all ${
                    filterStatus === status 
                      ? 'bg-[#0F4B70]/20 backdrop-blur-sm text-[#C4F8FF] shadow-sm' 
                      : 'text-[#C4F8FF]/70 hover:text-[#C4F8FF]'
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>
          
          <div className="flex items-center gap-3 w-full xl:w-auto">
            <div className="flex items-center gap-2 bg-[#0F4B70]/30 px-3 py-2 rounded-lg border border-[#C4F8FF]/15 w-full sm:w-64 focus-within:border-primary transition-colors">
              <Search size={16} className="text-[#C4F8FF]/60" />
              <input 
                type="text" 
                placeholder="Search by ID or details..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-transparent border-none outline-none text-sm w-full" 
              />
            </div>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          {loading ? (
            <div className="py-12 text-center text-[#C4F8FF]/70">Loading complaints...</div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="text-xs font-bold text-[#C4F8FF]/60 uppercase tracking-wider border-b border-[#C4F8FF]/15 bg-[#0F4B70]/20">
                  <th className="py-3 pl-6 w-12"></th>
                  <th className="py-3 w-1/3">Complaint Details</th>
                  <th className="py-3">Status</th>
                  <th className="py-3">Assigned Force</th>
                  <th className="py-3">Incident Location</th>
                  <th className="py-3 text-center">Actions</th>
                </tr>
              </thead>
                <tbody className="text-sm">
                  {(() => {
                    const filtered = complaints.filter(c => {
                      const matchesSearch = c.id.toLowerCase().includes(searchQuery.toLowerCase()) || 
                                            c.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                                            c.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                            c.category.toLowerCase().includes(searchQuery.toLowerCase());
                      const matchesStatus = filterStatus === 'All' || c.status === filterStatus;
                      return matchesSearch && matchesStatus;
                    });
                    if (filtered.length === 0) {
                      return (
                        <tr>
                          <td colSpan="6" className="py-8 text-center text-[#C4F8FF]/60">No complaints found matching current search and filters.</td>
                        </tr>
                      );
                    }
                    return filtered.map((complaint, i) => (
                      <tr key={complaint._id || i} className="border-b border-[#C4F8FF]/20 hover:bg-[#0F4B70]/30 transition-colors">
                        <td className="py-4 pl-6">
                          <div className={`w-10 h-10 rounded-xl ${complaint.bg || 'bg-[#0F4B70]/40'} flex items-center justify-center`}>
                            {complaint.icon || <AlertTriangle size={20} className="text-[#C4F8FF]/70" />}
                          </div>
                        </td>
                        <td className="py-4 pr-4">
                          <div className="font-bold text-[#C4F8FF] text-xs mb-1">{complaint.category}</div>
                          <div className="text-[#C4F8FF]/80 line-clamp-1">{complaint.title}</div>
                          <div className="text-xs text-[#C4F8FF]/60 mt-1 uppercase">ID: {complaint.id}</div>
                        </td>
                        <td className="py-4">
                          <span className={`text-xs font-bold px-2.5 py-1 rounded-md uppercase tracking-wider ${
                            complaint.status === 'Resolved' ? 'bg-green-500/10 text-green-400 border border-green-500/20' :
                            complaint.status === 'Approved' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                            complaint.status === 'Rejected' ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' :
                            complaint.status === 'In Progress' ? 'bg-[#C4F8FF]/10 text-[#C4F8FF] border border-[#C4F8FF]/20' :
                            'bg-purple-500/10 text-purple-400 border border-purple-500/20'
                          }`}>
                            {complaint.status === 'Pending' ? 'Awaiting Review' : complaint.status}
                          </span>
                        </td>
                        <td className="py-4">
                          {complaint.assigned && complaint.assigned !== '-' ? (
                            <span className="text-xs font-bold text-[#C4F8FF] uppercase tracking-wider bg-[#0F4B70]/10 px-2 py-1 rounded-md border border-[#C4F8FF]/10">
                              {complaint.assigned}
                            </span>
                          ) : (
                            <span className="text-[#C4F8FF]/70">-</span>
                          )}
                        </td>
                        <td className="py-4">
                          <div className="text-[#C4F8FF]/80 flex items-center gap-1.5 text-xs">
                            <span className="w-1.5 h-1.5 rounded-full bg-slate-300"></span>
                            {complaint.location}
                          </div>
                        </td>
                        <td className="py-4 text-center">
                          <button onClick={() => handleOpenModal(complaint)} className="inline-flex items-center gap-1 px-3 py-1.5 bg-[#0F4B70]/20 backdrop-blur-sm border border-[#C4F8FF]/15 rounded-md text-xs font-bold text-[#C4F8FF]/80 hover:bg-[#0F4B70]/30 shadow-sm">
                            <Eye size={14} /> View
                          </button>
                        </td>
                      </tr>
                    ));
                  })()}
                </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Details Modal */}
      {selectedComplaint && (
        <div className="fixed inset-0 bg-[#0F4B70]/30 backdrop-blur-md/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#0F4B70]/20 backdrop-blur-sm rounded-2xl max-w-lg w-full shadow-xl border border-[#C4F8FF]/15 overflow-hidden">
            <div className="px-6 py-4 bg-[#0F4B70]/30 border-b border-[#C4F8FF]/20 flex justify-between items-center">
              <h3 className="font-bold text-[#C4F8FF]">Complaint Details - {selectedComplaint.id}</h3>
              <button onClick={() => setSelectedComplaint(null)} className="text-[#C4F8FF]/60 hover:text-[#C4F8FF]/80 font-bold">✕</button>
            </div>
            <div className="p-6 space-y-4 max-h-[calc(100vh-12rem)] overflow-y-auto">
              <div>
                <label className="text-xs font-bold text-[#C4F8FF]/60 uppercase tracking-wider">Category</label>
                <p className="font-semibold text-[#C4F8FF] text-sm mt-1">{selectedComplaint.category}</p>
              </div>
              <div>
                <label className="text-xs font-bold text-[#C4F8FF]/60 uppercase tracking-wider">Citizen Details</label>
                <p className="font-medium text-[#C4F8FF] text-sm mt-1">
                  Name: {selectedComplaint.user?.name || 'Anonymous citizen'}<br/>
                  Phone: {selectedComplaint.user?.phone || 'N/A'}
                </p>
              </div>
              <div>
                <label className="text-xs font-bold text-[#C4F8FF]/60 uppercase tracking-wider">Description</label>
                <p className="text-[#C4F8FF]/80 text-sm mt-1 whitespace-pre-wrap">{selectedComplaint.title}</p>
              </div>
              <div>
                <label className="text-xs font-bold text-[#C4F8FF]/60 uppercase tracking-wider">Location</label>
                <p className="text-[#C4F8FF]/80 text-sm mt-1">{selectedComplaint.location}</p>
                {selectedComplaint.latitude && selectedComplaint.longitude && (
                  <div className="rounded-xl overflow-hidden border border-[#C4F8FF]/15 h-44 w-full mt-2">
                    <iframe
                      title="Complaint Location Map"
                      width="100%"
                      height="100%"
                      frameBorder="0"
                      scrolling="no"
                      marginHeight="0"
                      marginWidth="0"
                      src={`https://www.openstreetmap.org/export/embed.html?bbox=${selectedComplaint.longitude - 0.002}%2C${selectedComplaint.latitude - 0.002}%2C${selectedComplaint.longitude + 0.002}%2C${selectedComplaint.latitude + 0.002}&layer=mapnik&marker=${selectedComplaint.latitude}%2C${selectedComplaint.longitude}`}
                    ></iframe>
                  </div>
                )}
              </div>

              <div className="pt-4 border-t border-[#C4F8FF]/20">
                <label className="text-xs font-bold text-[#C4F8FF]/60 uppercase tracking-wider mb-2 block">Visual Evidence & Attachments</label>
                {selectedComplaint.documents && selectedComplaint.documents.length > 0 ? (
                  <div className="grid grid-cols-2 gap-3 mt-2">
                    {selectedComplaint.documents.map((doc, idx) => {
                      const isImage = /\.(jpg|jpeg|png|webp|gif)$/i.test(doc.path);
                      return (
                        <div key={idx} className="border border-[#C4F8FF]/15 rounded-xl overflow-hidden bg-[#0F4B70]/30 flex flex-col justify-between shadow-sm">
                          {isImage ? (
                            <a href={doc.path} target="_blank" rel="noreferrer" className="block overflow-hidden h-28 relative group">
                              <img 
                                src={doc.path} 
                                alt={doc.name} 
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform" 
                              />
                              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-xs font-bold transition-opacity">
                                View Full Image
                              </div>
                            </a>
                          ) : (
                            <div className="h-28 flex items-center justify-center bg-[#0F4B70]/40 text-[#C4F8FF]/60">
                              <FileText size={32} />
                            </div>
                          )}
                          <div className="p-2.5 border-t border-[#C4F8FF]/20 flex justify-between items-center bg-[#0F4B70]/20 backdrop-blur-sm">
                            <span className="text-[10px] font-bold text-[#C4F8FF]/80 truncate max-w-[120px]">{doc.name}</span>
                            <a 
                              href={doc.path} 
                              target="_blank" 
                              rel="noreferrer" 
                              className="text-[#C4F8FF] text-[10px] font-bold hover:underline"
                            >
                              Open
                            </a>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-xs text-[#C4F8FF]/60 italic mt-1">No attachments provided.</p>
                )}
              </div>
              
              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-[#C4F8FF]/20">
                <div>
                  <label className="block text-xs font-bold text-[#C4F8FF]/70 uppercase tracking-wider mb-2">Update Status</label>
                  <select
                    value={modalStatus}
                    onChange={(e) => setModalStatus(e.target.value)}
                    className="w-full border border-[#C4F8FF]/30 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary bg-[#0F4B70]/20 backdrop-blur-sm text-[#C4F8FF]"
                  >
                    <option value="Pending">Awaiting Review</option>
                    <option value="Approved">Approved</option>
                    <option value="Rejected">Rejected</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Resolved">Resolved</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#C4F8FF]/70 uppercase tracking-wider mb-2">Assign Worker</label>
                  <select
                    value={modalAssigned}
                    onChange={(e) => setModalAssigned(e.target.value)}
                    className="w-full border border-[#C4F8FF]/30 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary bg-[#0F4B70]/20 backdrop-blur-sm text-[#C4F8FF]"
                  >
                    <option value="-">None</option>
                    {workers.map(w => (
                      <option key={w._id} value={w.name}>{w.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {modalStatus === 'Resolved' && (
                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-[#C4F8FF]/20 animate-fade-in">
                  <div>
                    <label className="block text-xs font-bold text-[#C4F8FF]/70 uppercase tracking-wider mb-2">Resolution Cost (₹)</label>
                    <input 
                      type="number"
                      value={modalResolutionCost}
                      onChange={(e) => setModalResolutionCost(Number(e.target.value) || 0)}
                      className="w-full border border-[#C4F8FF]/30 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary bg-[#0F4B70]/20 backdrop-blur-sm font-semibold text-[#C4F8FF]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[#C4F8FF]/70 uppercase tracking-wider mb-2">Cost Description</label>
                    <input 
                      type="text"
                      placeholder="e.g. pipeline material & labor"
                      value={modalResolutionCostDescription}
                      onChange={(e) => setModalResolutionCostDescription(e.target.value)}
                      className="w-full border border-[#C4F8FF]/30 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary bg-[#0F4B70]/20 backdrop-blur-sm font-medium text-[#C4F8FF]"
                    />
                  </div>
                </div>
              )}
            </div>
            <div className="px-6 py-4 bg-[#0F4B70]/30 border-t border-[#C4F8FF]/20 flex justify-between items-center">
              <div className="flex gap-2">
                {selectedComplaint.status !== 'Approved' && (
                  <button 
                    onClick={() => handleQuickUpdateStatus('Approved')} 
                    className="px-4 py-2 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-lg font-bold text-xs hover:bg-emerald-500/20 transition-colors flex items-center gap-1.5"
                  >
                    <CheckCircle size={14} /> Approve
                  </button>
                )}
                {selectedComplaint.status !== 'Rejected' && (
                  <button 
                    onClick={() => handleQuickUpdateStatus('Rejected')} 
                    className="px-4 py-2 bg-rose-500/10 text-rose-400 border border-rose-500/20 rounded-lg font-bold text-xs hover:bg-rose-500/20 transition-colors flex items-center gap-1.5"
                  >
                    <XCircle size={14} /> Reject
                  </button>
                )}
              </div>
              <div className="flex gap-2">
                <button onClick={() => setSelectedComplaint(null)} className="px-4 py-2 text-xs font-semibold text-[#C4F8FF]/70 hover:text-[#C4F8FF]">Close</button>
                <button onClick={handleUpdateComplaint} className="px-4 py-2 bg-[#0F4B70] text-white border border-[#C4F8FF]/20 rounded-lg font-bold text-xs hover:bg-[#0a344f] shadow-sm transition-colors">Save Changes</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ComplaintsManagement;

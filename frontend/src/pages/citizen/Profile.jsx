import { useState, useEffect } from 'react';
import { User, Mail, Phone, Calendar, ClipboardList, Clock, CheckCircle, XCircle, MapPin, Edit3, Info } from 'lucide-react';

const Profile = () => {
  const [profileData, setProfileData] = useState(null);
  const [adminDetails, setAdminDetails] = useState(null);
  const [editData, setEditData] = useState({ name: '', phone: '', age: '', gender: '' });
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusMessage, setStatusMessage] = useState('');

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/auth/profile', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setProfileData(data);
        setEditData({
          name: data.user.name || '',
          phone: data.user.phone || '',
          age: data.user.age || '',
          gender: data.user.gender || ''
        });

        // Fetch assigned admin details
        const adminRes = await fetch('/api/auth/my-admin', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (adminRes.ok) {
          const adminData = await adminRes.json();
          setAdminDetails(adminData);
        }
      } else {
        setError('Failed to fetch profile data. Please log in again.');
      }
    } catch (err) {
      setError('Network error. Is the backend running?');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-[#C4F8FF]/10 border border-red-400/30 text-red-400 px-4 py-3 rounded-lg relative" role="alert">
        <strong className="font-bold">Error! </strong>
        <span className="block sm:inline">{error}</span>
      </div>
    );
  }

  const { user, applications } = profileData || { user: {}, applications: [] };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Approved': return <CheckCircle className="text-green-500" size={18} />;
      case 'Rejected': return <XCircle className="text-red-500" size={18} />;
      default: return <Clock className="text-yellow-500" size={18} />;
    }
  };

  const getStatusClass = (status) => {
    switch (status) {
      case 'Approved': return 'bg-green-100 text-green-400';
      case 'Rejected': return 'bg-red-100 text-red-400';
      default: return 'bg-yellow-100 text-yellow-800';
    }
  };

  const saveProfile = async (e) => {
    e.preventDefault();
    setStatusMessage('Saving...');
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name: editData.name,
          phone: editData.phone,
          age: editData.age,
          gender: editData.gender
        })
      });

      const result = await res.json();
      if (res.ok) {
        setProfileData((prev) => ({ ...prev, user: result.user }));
        setIsEditing(false);
        setStatusMessage('Profile updated successfully.');
        setTimeout(() => setStatusMessage(''), 4000);
      } else {
        setStatusMessage(result.message || 'Update failed.');
      }
    } catch (err) {
      console.error(err);
      setStatusMessage('Update failed.');
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-8 animate-fade-in">
      
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-extrabold text-[#C4F8FF] tracking-tight flex items-center gap-3">
            <User className="text-[#C4F8FF] animate-pulse" size={32} />
            Citizen Profile
          </h1>
          <p className="text-[#C4F8FF]/70 mt-1 text-sm">
            View or edit your residency details, contact numbers, and check your assigned Panchayat Administrator.
          </p>
        </div>
        <button
          onClick={() => {
            setIsEditing(!isEditing);
            setStatusMessage('');
          }}
          className="px-4 py-2 border border-primary/20 bg-[#0F4B70]/80/5 hover:bg-[#C4F8FF]/10/10 text-[#C4F8FF] text-xs font-bold rounded-xl transition-all flex items-center gap-1.5"
        >
          <Edit3 size={14} /> {isEditing ? 'Cancel Edit' : 'Edit Profile'}
        </button>
      </div>

      {statusMessage && (
        <div className={`p-4 rounded-xl text-xs font-bold flex items-center gap-2 border ${
          statusMessage.includes('successfully') 
            ? 'bg-[#C4F8FF]/10 text-green-400 border-green-400/30' 
            : 'bg-[#C4F8FF]/10 text-[#C4F8FF] border-[#C4F8FF]/30'
        }`}>
          <CheckCircle size={16} />
          {statusMessage}
        </div>
      )}

      {/* Main Profile Block */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Avatar & Basic Meta */}
        <div className="bg-[#0F4B70]/20 backdrop-blur-sm rounded-2xl border border-[#C4F8FF]/15 p-6 text-center h-fit shadow-sm space-y-6 group">
          <div className="relative w-32 h-32 mx-auto">
            <div className="w-32 h-32 bg-[#0F4B70]/80 rounded-full flex items-center justify-center text-white text-4xl font-extrabold border-4 border-blue-50 overflow-hidden shadow-inner">
              {user.profilePhoto ? (
                <img src={user.profilePhoto} alt={user.name} className="w-full h-full object-cover" />
              ) : (
                user.name ? user.name.charAt(0).toUpperCase() : 'U'
              )}
            </div>
            <label className="absolute bottom-1 right-1 bg-[#0F4B70]/20 backdrop-blur-sm p-2 rounded-full shadow-md border border-[#C4F8FF]/20 cursor-pointer hover:bg-[#0F4B70]/30 transition-colors group-hover:scale-110">
              <User size={16} className="text-[#C4F8FF]" />
              <input 
                type="file" 
                name="photo"
                className="hidden" 
                accept=".jpg,.jpeg,.png"
                onChange={async (e) => {
                  if (e.target.files[0]) {
                    const file = e.target.files[0];
                    const formData = new FormData();
                    formData.append('photo', file);
                    
                    try {
                      const token = localStorage.getItem('token');
                      const res = await fetch('/api/auth/profile/photo', {
                        method: 'POST',
                        headers: { 'Authorization': `Bearer ${token}` },
                        body: formData
                      });
                      
                      if (res.ok) {
                        fetchProfile();
                        setStatusMessage('Profile photo updated successfully.');
                      } else {
                        const errorData = await res.json();
                        alert(errorData.message || "Failed to upload photo.");
                      }
                    } catch (err) {
                      console.error(err);
                      alert("Error uploading photo.");
                    }
                  }
                }}
              />
            </label>
          </div>
          
          <div>
            <h2 className="text-xl font-bold text-[#C4F8FF]">{user.name || 'Panchayat Resident'}</h2>
            <p className="text-[#C4F8FF]/70 text-xs font-bold uppercase tracking-wider mt-1">{user.role || 'Citizen'}</p>
          </div>

          <div className="border-t border-[#C4F8FF]/20 pt-4 text-left space-y-2 text-xs text-[#C4F8FF]/70">
            <div>
              <span className="text-[#C4F8FF]/60 block text-[9px] font-bold uppercase">Account ID</span>
              <span className="font-mono text-[#C4F8FF] font-bold">{user._id}</span>
            </div>
            <div>
              <span className="text-[#C4F8FF]/60 block text-[9px] font-bold uppercase">Residency Verification</span>
              <span className="font-bold text-[#C4F8FF]">Official Panchayat Resident</span>
            </div>
          </div>
        </div>

        {/* Right Columns: Display / Edit Form */}
        <div className="lg:col-span-2 bg-[#0F4B70]/20 backdrop-blur-sm rounded-2xl border border-[#C4F8FF]/15 p-6 shadow-sm">
          {!isEditing ? (
            /* DISPLAY MODE */
            <div className="space-y-6">
              <h3 className="font-bold text-[#C4F8FF] text-base border-b pb-3 flex items-center gap-2">
                <Info size={18} className="text-[#C4F8FF]" /> Profile Credentials
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="flex items-center gap-3 text-[#C4F8FF]/80">
                  <Mail size={18} className="text-[#C4F8FF]" />
                  <div>
                    <p className="text-[10px] text-[#C4F8FF]/60 font-bold uppercase tracking-wider">Email Address</p>
                    <p className="font-bold text-[#C4F8FF]">{user.email || 'Not set'}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-[#C4F8FF]/80">
                  <Phone size={18} className="text-[#C4F8FF]" />
                  <div>
                    <p className="text-[10px] text-[#C4F8FF]/60 font-bold uppercase tracking-wider">Contact Number</p>
                    <p className="font-bold text-[#C4F8FF]">{user.phone || 'Not set'}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-[#C4F8FF]/80">
                  <Calendar size={18} className="text-[#C4F8FF]" />
                  <div>
                    <p className="text-[10px] text-[#C4F8FF]/60 font-bold uppercase tracking-wider">Age (Years)</p>
                    <p className="font-bold text-[#C4F8FF]">{user.age || 'Not set'}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-[#C4F8FF]/80">
                  <User size={18} className="text-[#C4F8FF]" />
                  <div>
                    <p className="text-[10px] text-[#C4F8FF]/60 font-bold uppercase tracking-wider">Gender</p>
                    <p className="font-bold text-[#C4F8FF] capitalize">{user.gender || 'Not set'}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-[#C4F8FF]/80">
                  <MapPin size={18} className="text-[#C4F8FF]" />
                  <div>
                    <p className="text-[10px] text-[#C4F8FF]/60 font-bold uppercase tracking-wider">Registered Village</p>
                    <p className="font-bold text-[#C4F8FF]">{user.village || 'Not set'}</p>
                  </div>
                </div>
              </div>

              {/* Assigned Panchayat Administrator Block */}
              <h3 className="font-bold text-[#C4F8FF] text-base border-b pb-3 pt-4 flex items-center gap-2">
                <Info size={18} className="text-[#C4F8FF]" /> My Assigned Panchayat Administrator
              </h3>
              
              {adminDetails ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="flex items-center gap-3 text-[#C4F8FF]/80">
                    <User size={18} className="text-[#C4F8FF]" />
                    <div>
                      <p className="text-[10px] text-[#C4F8FF]/60 font-bold uppercase tracking-wider">Admin Name</p>
                      <p className="font-bold text-[#C4F8FF]">{adminDetails.name}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 text-[#C4F8FF]/80">
                    <Phone size={18} className="text-[#C4F8FF]" />
                    <div>
                      <p className="text-[10px] text-[#C4F8FF]/60 font-bold uppercase tracking-wider">Admin Phone</p>
                      <p className="font-bold text-[#C4F8FF]">{adminDetails.phone}</p>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-[#C4F8FF]/60 italic">Loading administrator details...</p>
              )}

            </div>
          ) : (
            /* EDIT FORM MODE */
            <form onSubmit={saveProfile} className="space-y-6">
              <h3 className="font-bold text-[#C4F8FF] text-base border-b pb-3 flex items-center gap-2">
                <Edit3 size={18} className="text-[#C4F8FF]" /> Update Particulars
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-[#C4F8FF]/70 uppercase mb-1.5">Full Name</label>
                  <input
                    type="text"
                    required
                    value={editData.name}
                    onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                    className="w-full border border-[#C4F8FF]/15 rounded-xl px-3 py-2.5 text-xs font-semibold focus:outline-none focus:border-primary text-[#C4F8FF] bg-[#0F4B70]/20"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-[#C4F8FF]/70 uppercase mb-1.5">Phone Number</label>
                  <input
                    type="text"
                    required
                    value={editData.phone}
                    onChange={(e) => setEditData({ ...editData, phone: e.target.value })}
                    className="w-full border border-[#C4F8FF]/15 rounded-xl px-3 py-2.5 text-xs font-semibold focus:outline-none focus:border-primary text-[#C4F8FF] bg-[#0F4B70]/20"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-[#C4F8FF]/70 uppercase mb-1.5">Age</label>
                  <input
                    type="number"
                    required
                    value={editData.age}
                    onChange={(e) => setEditData({ ...editData, age: e.target.value })}
                    className="w-full border border-[#C4F8FF]/15 rounded-xl px-3 py-2.5 text-xs font-semibold focus:outline-none focus:border-primary text-[#C4F8FF] bg-[#0F4B70]/20"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-[#C4F8FF]/70 uppercase mb-1.5">Gender</label>
                  <select
                    value={editData.gender}
                    onChange={(e) => setEditData({ ...editData, gender: e.target.value })}
                    className="w-full border border-[#C4F8FF]/15 rounded-xl px-3 py-2.5 text-xs font-semibold focus:outline-none focus:border-primary text-[#C4F8FF] bg-[#0F4B70]/20"
                  >
                    <option value="">Select gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div className="sm:col-span-2 bg-[#0F4B70]/10 p-4 border border-dashed border-[#C4F8FF]/15 rounded-xl">
                  <div className="flex items-start gap-2.5 text-[#C4F8FF]/70">
                    <MapPin size={18} className="text-[#C4F8FF] flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-wider">Registered Village (Locked)</p>
                      <p className="text-xs font-bold text-[#C4F8FF] mt-1">{user.village || 'Panchayat Area'}</p>
                      <p className="text-[9px] text-[#C4F8FF]/50 mt-1.5">Citizens cannot change their village name. Please contact your Panchayat office for address verification changes.</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-[#C4F8FF]/15">
                <button
                  type="button"
                  onClick={() => {
                    setIsEditing(false);
                    setEditData({
                      name: user.name || '',
                      phone: user.phone || '',
                      age: user.age || '',
                      gender: user.gender || ''
                    });
                  }}
                  className="px-4 py-2 text-xs font-bold text-[#C4F8FF]/70 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-[#0F4B70] text-white border border-[#C4F8FF]/20 rounded-xl font-bold text-xs hover:bg-[#0a344f] shadow-sm transition-all"
                >
                  Save Changes
                </button>
              </div>
            </form>
          )}
        </div>
      </div>

      {/* Scheme Applications List */}
      <div className="bg-[#0F4B70]/20 backdrop-blur-sm rounded-2xl border border-[#C4F8FF]/15 p-6 shadow-sm">
        <h3 className="text-xl font-bold text-[#C4F8FF] mb-6 flex items-center gap-2">
          <ClipboardList className="text-[#C4F8FF]" />
          My Scheme Applications
        </h3>
        
        {applications.length === 0 ? (
          <div className="text-center py-8 bg-[#0F4B70]/30 rounded-xl border border-[#C4F8FF]/20">
            <p className="text-[#C4F8FF]/70 text-sm">You haven't applied for any schemes yet.</p>
          </div>
        ) : (
          <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
            {applications.map((app) => (
              <div key={app._id} className="p-4 border border-[#C4F8FF]/20 bg-[#0F4B70]/30 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-[#C4F8FF]/15 transition-colors">
                <div>
                  <h4 className="font-bold text-[#C4F8FF] text-base mb-1">{app.schemeName}</h4>
                  <div className="flex flex-wrap items-center gap-3 text-xs text-[#C4F8FF]/70 font-medium">
                    <span className="flex items-center gap-1"><User size={12} /> {app.applicantName} ({app.relationship})</span>
                    <span className="flex items-center gap-1"><Calendar size={12} /> {new Date(app.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
                <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider ${getStatusClass(app.status)} whitespace-nowrap`}>
                  {getStatusIcon(app.status)}
                  {app.status}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};

export default Profile;

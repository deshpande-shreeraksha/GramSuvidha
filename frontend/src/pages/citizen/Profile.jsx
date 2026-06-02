import { useState, useEffect } from 'react';
import { User, Mail, Phone, Calendar, ClipboardList, Clock, CheckCircle, XCircle, MapPin } from 'lucide-react';

const Profile = () => {
  const [profileData, setProfileData] = useState(null);
  const [editData, setEditData] = useState({ name: '', age: '', gender: '', village: '' });
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusMessage, setStatusMessage] = useState('');

  useEffect(() => {
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
            age: data.user.age || '',
            gender: data.user.gender || '',
            village: data.user.village || ''
          });
        } else {
          setError('Failed to fetch profile data. Please log in again.');
        }
      } catch (err) {
        setError('Network error. Is the backend running?');
      } finally {
        setLoading(false);
      }
    };

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

  const { user, applications } = profileData || { user: { name: 'John Doe', email: 'john@example.com', phone: '1234567890', age: 30, role: 'citizen' }, applications: [] };

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

  const saveProfile = async () => {
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
          age: editData.age,
          gender: editData.gender,
          village: editData.village
        })
      });

      const result = await res.json();
      if (res.ok) {
        setProfileData((prev) => ({ ...prev, user: result.user || { ...prev.user, ...editData } }));
        setIsEditing(false);
        setStatusMessage('Profile updated successfully.');
      } else {
        setStatusMessage(result.message || 'Update failed.');
      }
    } catch (err) {
      console.error(err);
      setStatusMessage('Update failed.');
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-8">
      <h1 className="text-3xl font-bold text-[#C4F8FF] flex items-center gap-2 mb-6">
        <User className="text-[#C4F8FF]" />
        Citizen Profile
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* User Info Card */}
        <div className="md:col-span-1 space-y-6">
          <div className="bg-[#0F4B70]/20 backdrop-blur-sm rounded-2xl shadow-sm border border-[#C4F8FF]/15 p-6 text-center group">
            <div className="relative w-32 h-32 mx-auto mb-4">
              <div className="w-32 h-32 bg-[#0F4B70]/80 rounded-full flex items-center justify-center text-white text-4xl font-bold border-4 border-blue-50 overflow-hidden shadow-inner">
                {user.profilePhoto ? (
                  <img src={user.profilePhoto} alt={user.name} className="w-full h-full object-cover" />
                ) : (
                  user.name ? user.name.charAt(0) : 'U'
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
                          window.location.reload(); 
                        } else {
                          const errorData = await res.json();
                          alert(errorData.message || "Failed to upload photo. Please ensure it's a valid image (JPG, PNG).");
                        }
                      } catch (err) {
                        console.error(err);
                        alert("Error uploading photo. Is the server running?");
                      }
                    }
                  }}
                />
              </label>
            </div>
            <h2 className="text-xl font-bold text-[#C4F8FF]">{user.name}</h2>
            {!isEditing && (
              <button
                type="button"
                onClick={() => {
                  setIsEditing(true);
                  setStatusMessage('');
                }}
                className="mt-3 inline-flex items-center justify-center rounded-full border border-primary bg-[#0F4B70]/80/10 px-4 py-2 text-sm font-semibold text-[#C4F8FF] hover:bg-[#C4F8FF]/10 transition-colors"
              >
                Edit Profile
              </button>
            )}
          </div>

          <div className="bg-[#0F4B70]/20 backdrop-blur-sm rounded-2xl shadow-sm border border-[#C4F8FF]/15 p-6 space-y-4">
            <div className="flex items-center justify-between gap-4">
              <h3 className="font-bold text-[#C4F8FF] border-b pb-2 text-xs uppercase tracking-wider">Basic Details</h3>
              {isEditing && (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setIsEditing(false);
                      setStatusMessage('');
                      setEditData({
                        name: user.name || '',
                        age: user.age || '',
                        gender: user.gender || '',
                        village: user.village || ''
                      });
                    }}
                    className="rounded-full border border-[#C4F8FF]/15 bg-[#0F4B70]/40 px-3 py-1 text-xs font-semibold text-[#C4F8FF] hover:bg-slate-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={saveProfile}
                    className="rounded-full bg-[#0F4B70]/80 px-3 py-1 text-xs font-semibold text-white hover:bg-[#C4F8FF]/10/90"
                  >
                    Save
                  </button>
                </div>
              )}
            </div>

            <div className="flex flex-col gap-4">
              <div className="flex items-start gap-3 text-[#C4F8FF]/80">
                <User size={18} className="text-[#C4F8FF] pt-1" />
                <div className="text-sm w-full">
                  <p className="text-[10px] text-[#C4F8FF]/60 font-bold uppercase tracking-wider">Name</p>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editData.name}
                      onChange={(e) => setEditData((prev) => ({ ...prev, name: e.target.value }))}
                      className="mt-1 w-full rounded-xl border border-[#C4F8FF]/15 px-3 py-2 text-sm"
                    />
                  ) : (
                    <p className="font-semibold text-[#C4F8FF]">{user.name || 'Not set'}</p>
                  )}
                </div>
              </div>
              <div className="flex items-start gap-3 text-[#C4F8FF]/80">
                <Calendar size={18} className="text-[#C4F8FF] pt-1" />
                <div className="text-sm w-full">
                  <p className="text-[10px] text-[#C4F8FF]/60 font-bold uppercase tracking-wider">Age</p>
                  {isEditing ? (
                    <input
                      type="number"
                      value={editData.age}
                      onChange={(e) => setEditData((prev) => ({ ...prev, age: e.target.value }))}
                      className="mt-1 w-full rounded-xl border border-[#C4F8FF]/15 px-3 py-2 text-sm"
                    />
                  ) : (
                    <p className="font-semibold text-[#C4F8FF]">{user.age || 'Not set'}</p>
                  )}
                </div>
              </div>
              <div className="flex items-start gap-3 text-[#C4F8FF]/80">
                <User size={18} className="text-[#C4F8FF] pt-1" />
                <div className="text-sm w-full">
                  <p className="text-[10px] text-[#C4F8FF]/60 font-bold uppercase tracking-wider">Gender</p>
                  {isEditing ? (
                    <select
                      value={editData.gender}
                      onChange={(e) => setEditData((prev) => ({ ...prev, gender: e.target.value }))}
                      className="mt-1 w-full rounded-xl border border-[#C4F8FF]/15 px-3 py-2 text-sm"
                    >
                      <option value="">Select gender</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  ) : (
                    <p className="font-semibold text-[#C4F8FF] capitalize">{user.gender || 'Not set'}</p>
                  )}
                </div>
              </div>
              <div className="flex items-start gap-3 text-[#C4F8FF]/80">
                <MapPin size={18} className="text-[#C4F8FF] pt-1" />
                <div className="text-sm w-full">
                  <p className="text-[10px] text-[#C4F8FF]/60 font-bold uppercase tracking-wider">Village</p>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editData.village}
                      onChange={(e) => setEditData((prev) => ({ ...prev, village: e.target.value }))}
                      className="mt-1 w-full rounded-xl border border-[#C4F8FF]/15 px-3 py-2 text-sm"
                    />
                  ) : (
                    <p className="font-semibold text-[#C4F8FF]">{user.village || 'Not set'}</p>
                  )}
                </div>
              </div>
            </div>

            {statusMessage && (
              <p className="text-sm text-[#C4F8FF]/70">{statusMessage}</p>
            )}
          </div>
        </div>

        {/* Applications List */}
        <div className="md:col-span-2 space-y-6">
          <div className="bg-[#0F4B70]/20 backdrop-blur-sm rounded-2xl shadow-sm border border-[#C4F8FF]/15 p-6">
            <h3 className="text-xl font-bold text-[#C4F8FF] mb-6 flex items-center gap-2">
              <ClipboardList className="text-[#C4F8FF]" />
              My Scheme Applications
            </h3>
            
            {applications.length === 0 ? (
              <div className="text-center py-8 bg-[#0F4B70]/30 rounded-xl border border-[#C4F8FF]/20">
                <p className="text-[#C4F8FF]/70 text-sm">You haven't applied for any schemes yet.</p>
              </div>
            ) : (
              <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
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
      </div>
    </div>
  );
};

export default Profile;

import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Shield, Upload, MapPin, Navigation, CheckCircle, Loader2 } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

const RegisterComplaint = () => {
  const navigate = useNavigate();
  const locationState = useLocation();
  const { t } = useLanguage();

  // Pre-select category if passed in route state
  const initialCategory = locationState.state?.category || 'water_leakage';

  const [category, setCategory] = useState(initialCategory);
  const [priority, setPriority] = useState('Medium');
  const [description, setDescription] = useState('');
  const [address, setAddress] = useState('Bengeri, Vishweshwara Nagar, Hubli, Hubballi Urban Taluka, Dharwad, Karnataka, 580020, India');
  const [coordinates, setCoordinates] = useState(null);
  const [locationMode, setLocationMode] = useState('gps'); // 'gps' | 'manual'
  const [loading, setLoading] = useState(false);
  const [fetchingLocation, setFetchingLocation] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [selectedFiles, setSelectedFiles] = useState([]);

  // Handle auto-population from landing page redirects
  useEffect(() => {
    if (locationState.state?.category) {
      setCategory(locationState.state.category);
    }
  }, [locationState]);

  // Geocode address manually using Nominatim forward geocoding
  const resolveManualAddress = async () => {
    if (!address.trim()) {
      setError(t('Please type an address first.'));
      return;
    }
    setFetchingLocation(true);
    setError('');
    setMessage('');
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1&accept-language=en`);
      if (response.ok) {
        const data = await response.json();
        if (data && data.length > 0) {
          const { lat, lon, display_name } = data[0];
          setCoordinates({ lat: parseFloat(lat), lon: parseFloat(lon) });
          setAddress(display_name);
          setMessage(t('Address located successfully on map!'));
          setTimeout(() => setMessage(''), 3000);
        } else {
          setError(t('Could not find this address on the map. Please refine the text.'));
        }
      } else {
        setError(t('Error reaching address lookup service.'));
      }
    } catch (err) {
      setError(t('Network error searching address.'));
    } finally {
      setFetchingLocation(false);
    }
  };

  // Geolocation Fetching utilizing OSM Nominatim Reverse Geocoder
  const fetchLiveLocation = () => {
    if (!navigator.geolocation) {
      setError(t('Geolocation is not supported by your browser.'));
      return;
    }

    setFetchingLocation(true);
    setError('');
    setMessage('');

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&accept-language=en`);
          if (response.ok) {
            const data = await response.json();
            setAddress(data.display_name || `${latitude}, ${longitude}`);
            setCoordinates({ lat: latitude, lon: longitude });
            setMessage(t('Live location fetched successfully!'));
            setTimeout(() => setMessage(''), 3000);
          } else {
            setAddress(`${latitude}, ${longitude}`);
            setCoordinates({ lat: latitude, lon: longitude });
          }
        } catch (err) {
          setAddress(`${latitude}, ${longitude}`);
          setCoordinates({ lat: latitude, lon: longitude });
        } finally {
          setFetchingLocation(false);
        }
      },
      (err) => {
        setError(t('Failed to fetch live location. Please allow browser location permissions or type manually.'));
        setFetchingLocation(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const handleFileChange = (e) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      setSelectedFiles(prev => [...prev, ...filesArray].slice(0, 5)); // Cap at 5 files
    }
  };

  const handleRemoveFile = (index) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (!description.trim()) {
      setError(t('Please provide a detailed description of the issue.'));
      return;
    }

    setLoading(true);

    // Retrieve user _id from localStorage user object
    let userId = '60d5ec4986b245209c123456'; // Fallback dummy ObjectId
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        const userObj = JSON.parse(userStr);
        if (userObj && userObj._id) {
          userId = userObj._id;
        }
      } catch (err) {
        console.error("Failed to parse user from local storage", err);
      }
    }

    const formData = new FormData();
    formData.append('category', category);
    formData.append('priority', priority);
    formData.append('description', description);
    formData.append('location', address);
    formData.append('user', userId);
    if (coordinates) {
      formData.append('latitude', coordinates.lat);
      formData.append('longitude', coordinates.lon);
    }
    
    selectedFiles.forEach(file => {
      formData.append('documents', file);
    });

    try {
      const response = await fetch('/api/complaints', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: formData
      });

      const data = await response.json();
      if (response.ok) {
        setMessage(t('Complaint registered successfully! Redirecting...'));
        setTimeout(() => {
          navigate('/citizen/dashboard');
        }, 1500);
      } else {
        setError(data.message || t('Failed to submit complaint.'));
      }
    } catch (err) {
      setError(t('Network error. Is the backend running?'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto space-y-6 animate-fade-in text-[#C4F8FF]">
      <div className="card border-primary/20 bg-[#0F4B70]/10 flex items-center gap-4">
        <div className="w-12 h-12 rounded-full bg-[#C4F8FF]/10 text-[#C4F8FF] flex items-center justify-center flex-shrink-0">
          <Shield size={24} />
        </div>
        <div>
          <h2 className="text-xl font-bold text-[#C4F8FF]">{t('Register New Complaint')}</h2>
          <p className="text-sm text-[#C4F8FF]/80 mt-1">{t('Provide detailed information to help our volunteers address the issue.')}</p>
        </div>
      </div>

      {error && <div className="bg-[#C4F8FF]/10 border border-red-400/30 text-red-400 px-4 py-3 rounded-lg text-sm font-semibold">{t(error)}</div>}
      {message && <div className="bg-[#C4F8FF]/10 border border-green-400/30 text-green-400 px-4 py-3 rounded-lg text-sm font-semibold">{t(message)}</div>}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* 1. Complaint Details */}
        <div className="space-y-4">
          <h3 className="font-bold text-[#C4F8FF] flex items-center gap-2">
            {t('1. Complaint Details')}
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#C4F8FF]/70 uppercase tracking-wider mb-2">{t('Issue Category *')}</label>
              <select 
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full border border-[#C4F8FF]/30 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary appearance-none bg-[#0F4B70]/20 backdrop-blur-sm text-[#C4F8FF]"
              >
                <option value="water_leakage" className="bg-[#061926]">{t('Water Leakage')}</option>
                <option value="road_damage" className="bg-[#061926]">{t('Road Damage')}</option>
                <option value="garbage_dump" className="bg-[#061926]">{t('Garbage Dump')}</option>
                <option value="electricity_issue" className="bg-[#061926]">{t('Electricity Issue')}</option>
                <option value="drainage_issue" className="bg-[#061926]">{t('Drainage Issue')}</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#C4F8FF]/70 uppercase tracking-wider mb-2">{t('Complaint Priority *')}</label>
              <select 
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="w-full border border-[#C4F8FF]/30 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary appearance-none bg-[#0F4B70]/20 backdrop-blur-sm text-[#C4F8FF]"
              >
                <option value="High" className="bg-[#061926]">{t('High (Urgent Resolution Required)')}</option>
                <option value="Medium" className="bg-[#061926]">{t('Medium (Standard Timeline)')}</option>
                <option value="Low" className="bg-[#061926]">{t('Low (General Infrastructure Improvement)')}</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#C4F8FF]/70 uppercase tracking-wider mb-2">{t('Detailed Description *')}</label>
            <textarea 
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={t('Describe the issue in detail. Include landmarks or specific observations.')}
              className="w-full border border-[#C4F8FF]/30 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary bg-[#0F4B70]/20 backdrop-blur-sm text-[#C4F8FF] placeholder-[#C4F8FF]/50 resize-none"
            ></textarea>
          </div>
        </div>

        {/* 2. Visual Evidence */}
        <div className="space-y-4">
          <h3 className="font-bold text-[#C4F8FF] flex items-center gap-2">
            {t('2. Visual Evidence & Documentation')}
          </h3>
          
          <label className="border-2 border-dashed border-[#C4F8FF]/30 rounded-xl p-10 flex flex-col items-center justify-center text-center bg-[#0F4B70]/30 hover:bg-[#0F4B70]/40 transition-colors cursor-pointer group relative block">
            <input 
              type="file" 
              multiple 
              onChange={handleFileChange}
              accept="image/*,video/*,.pdf,.doc,.docx"
              className="hidden" 
            />
            <div className="w-16 h-16 bg-[#0F4B70]/30 rounded-full flex items-center justify-center text-[#C4F8FF] mb-4 group-hover:scale-110 transition-transform">
              <Upload size={28} />
            </div>
            <div className="font-bold text-[#C4F8FF] mb-1">{t('Click to upload photos, videos or documents')}</div>
            <div className="text-sm text-[#C4F8FF]/70 mb-6">{t('Images (JPG, PNG), Videos (MP4), Documents (PDF, DOC)')}</div>
            <div className="text-xs text-[#C4F8FF]/60">{t('Up to 5 files (Max 10MB each)')}</div>
            
            <div className="mt-6 px-6 py-2 bg-[#0F4B70]/20 backdrop-blur-sm border border-[#C4F8FF]/30 rounded-lg text-sm font-bold text-[#C4F8FF]/80 shadow-sm hover:bg-[#0F4B70]/30 flex items-center gap-2">
              <Upload size={16} /> {t('Browse Files')}
            </div>
          </label>
          
          {selectedFiles.length > 0 && (
            <div className="mt-4 space-y-2">
              <p className="text-xs font-bold text-[#C4F8FF]/70 uppercase tracking-wider">{t('Selected Files')}</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {selectedFiles.map((file, idx) => (
                  <div key={idx} className="flex items-center justify-between p-2.5 bg-[#0F4B70]/20 backdrop-blur-sm border border-[#C4F8FF]/15 rounded-lg text-xs shadow-sm">
                    <div className="flex items-center gap-2 truncate">
                      <span className="font-semibold text-[#C4F8FF] truncate">{file.name}</span>
                      <span className="text-[#C4F8FF]/60">({(file.size / 1024 / 1024).toFixed(2)} MB)</span>
                    </div>
                    <button 
                      type="button" 
                      onClick={(e) => { e.preventDefault(); handleRemoveFile(idx); }}
                      className="text-red-500 hover:text-red-400 font-bold px-1.5 py-0.5 hover:bg-[#C4F8FF]/10 rounded"
                    >
                      {t('Remove')}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* 3. Location Information */}
        <div className="space-y-4">
          <h3 className="font-bold text-[#C4F8FF] flex items-center gap-2">
            {t('3. Location Information')}
          </h3>
          
          <div className="flex rounded-lg overflow-hidden border border-[#C4F8FF]/15 p-1 bg-[#0F4B70]/40">
            <button 
              type="button" 
              onClick={() => { setLocationMode('gps'); fetchLiveLocation(); }}
              className={`flex-1 py-2 text-sm font-bold rounded-md transition-all flex justify-center items-center gap-2 ${
                locationMode === 'gps' ? 'bg-[#0F4B70]/20 backdrop-blur-sm text-[#C4F8FF] shadow-sm' : 'text-[#C4F8FF]/70 hover:text-[#C4F8FF]'
              }`}
            >
              <Navigation size={16} className={fetchingLocation && locationMode === 'gps' ? "animate-spin text-[#C4F8FF]" : ""} /> {t('Auto GPS Detect')}
            </button>
            <button 
              type="button" 
              onClick={() => setLocationMode('manual')}
              className={`flex-1 py-2 text-sm font-bold rounded-md transition-all flex justify-center items-center gap-2 ${
                locationMode === 'manual' ? 'bg-[#0F4B70]/20 backdrop-blur-sm text-[#C4F8FF] shadow-sm' : 'text-[#C4F8FF]/70 hover:text-[#C4F8FF]'
              }`}
            >
              <MapPin size={16} /> {t('Manual Input')}
            </button>
          </div>

          {locationMode === 'gps' ? (
            <button 
              type="button" 
              onClick={fetchLiveLocation}
              disabled={fetchingLocation}
              className="w-full py-3 bg-[#0F4B70] text-[#C4F8FF] border border-[#C4F8FF]/20 rounded-lg font-bold text-sm flex items-center justify-center gap-2 shadow-sm hover:bg-[#0a344f] transition-all disabled:opacity-55"
            >
              {fetchingLocation ? (
                <>
                  <Loader2 size={16} className="animate-spin" /> {t('Geocoding Live Coordinates...')}
                </>
              ) : (
                <>
                  <Navigation size={16} /> {t('Auto-Detect My Live Location')}
                </>
              )}
            </button>
          ) : (
            <button 
              type="button" 
              onClick={resolveManualAddress}
              disabled={fetchingLocation}
              className="w-full py-3 bg-[#0F4B70] text-[#C4F8FF] border border-[#C4F8FF]/20 rounded-lg font-bold text-sm flex items-center justify-center gap-2 shadow-sm hover:bg-[#0a344f] transition-all disabled:opacity-55"
            >
              {fetchingLocation ? (
                <>
                  <Loader2 size={16} className="animate-spin" /> {t('Searching Address...')}
                </>
              ) : (
                <>
                  <MapPin size={16} /> {t('Search & Pin Address on Map')}
                </>
              )}
            </button>
          )}

          <div className="relative h-48 rounded-xl overflow-hidden border border-[#C4F8FF]/15 bg-[#0F4B70]/40 flex items-center justify-center">
            {coordinates ? (
              <iframe
                title="Location Map"
                width="100%"
                height="100%"
                frameBorder="0"
                scrolling="no"
                marginHeight="0"
                marginWidth="0"
                src={`https://www.openstreetmap.org/export/embed.html?bbox=${coordinates.lon - 0.002}%2C${coordinates.lat - 0.002}%2C${coordinates.lon + 0.002}%2C${coordinates.lat + 0.002}&layer=mapnik&marker=${coordinates.lat}%2C${coordinates.lon}`}
              ></iframe>
            ) : (
              <>
                {/* Map placeholder */}
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
                <div className="relative z-10 flex flex-col items-center">
                  <div className="w-8 h-8 text-red-500 mb-2 drop-shadow-md">
                    <MapPin size={32} />
                  </div>
                  <div className="bg-[#0F4B70]/20 backdrop-blur-sm px-4 py-2 rounded-lg shadow-md text-xs font-bold text-[#C4F8FF] flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#C4F8FF]/100 animate-pulse"></span> {t('LIVE GEOLOCATION ENGINE')}
                  </div>
                </div>
              </>
            )}
            
            <div className="absolute bottom-4 left-4 right-4 bg-[#0F4B70]/20 backdrop-blur-sm/90 backdrop-blur-sm p-3 rounded-lg border border-[#C4F8FF]/15 shadow-sm animate-fade-in">
              <div className="text-[10px] font-bold text-[#C4F8FF]/60 uppercase tracking-wider mb-1">{t('DETECTED PHYSICAL LOCATION')}</div>
              <div className="text-xs font-semibold text-[#C4F8FF] truncate">{address}</div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#C4F8FF]/70 uppercase tracking-wider mb-2">{t('Final Verified Address')}</label>
            <div className="flex gap-2">
              <input 
                type="text" 
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder={t('Type your address manually here...')}
                className="flex-grow border border-[#C4F8FF]/30 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary bg-[#0F4B70]/20 backdrop-blur-sm text-[#C4F8FF]"
              />
              <button
                type="button"
                onClick={resolveManualAddress}
                disabled={fetchingLocation}
                className="px-4 py-2 bg-[#0F4B70]/40 text-[#C4F8FF] border border-[#C4F8FF]/20 rounded-lg font-bold text-xs hover:bg-[#0F4B70]/60 transition-colors flex items-center gap-1.5 disabled:opacity-50"
              >
                <MapPin size={14} /> {t('Locate')}
              </button>
            </div>
          </div>
        </div>

        <div className="pt-6 border-t border-[#C4F8FF]/15 flex flex-col sm:flex-row gap-4">
          <button 
            type="button" 
            onClick={() => navigate('/citizen/dashboard')}
            className="px-6 py-3 border border-[#C4F8FF]/30 rounded-lg font-bold text-[#C4F8FF]/80 hover:bg-[#0F4B70]/30 sm:w-1/3"
          >
            {t('Cancel')}
          </button>
          <button 
            type="submit" 
            disabled={loading}
            className="px-6 py-3 bg-[#0F4B70] text-[#C4F8FF] border border-[#C4F8FF]/20 rounded-lg font-bold hover:bg-[#0a344f] shadow-sm sm:w-2/3 flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
          >
            <CheckCircle size={18} /> {loading ? t('Registering...') : t('Register Complaint')}
          </button>
        </div>
        
        <p className="text-center text-xs text-[#C4F8FF]/70 flex items-center justify-center gap-1.5 mt-4">
          <Shield size={12} /> {t('Your IP address and location will be logged for verification.')}
        </p>
      </form>
    </div>
  );
};

export default RegisterComplaint;

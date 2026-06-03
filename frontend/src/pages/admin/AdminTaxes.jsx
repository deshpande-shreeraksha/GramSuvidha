import React, { useState, useEffect } from 'react';
import { CreditCard, PlusCircle, Search, Filter, Calendar, FileText, CheckCircle, XCircle } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

const AdminTaxes = () => {
  const { t } = useLanguage();
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');

  // New Assessment State
  const [newOwner, setNewOwner] = useState('');
  const [newType, setNewType] = useState('Residential');
  const [newConstruction, setNewConstruction] = useState('Pucca');
  const [newArea, setNewArea] = useState(1000);
  const [citizenEmail, setCitizenEmail] = useState('');
  const [assessedTax, setAssessedTax] = useState(0);
  const [isCreatingAssessment, setIsCreatingAssessment] = useState(false);

  const fetchProperties = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/taxes', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const propData = await response.json();
        setProperties(propData);
      } else {
        setError(true);
      }
    } catch (err) {
      console.error(err);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProperties();
  }, []);

  // Compute Indian Panchayat Tax logic
  const calculatePanchayatTax = (type, construction, area) => {
    const baseRates = { Residential: 2.0, Commercial: 5.0, Industrial: 8.0, Vacant: 0.5 };
    const multipliers = { Pucca: 1.25, 'Semi-Pucca': 1.0, Kutcha: 0.5, None: 1.0 };

    const baseRate = baseRates[type] || 2.0;
    const multiplier = type === 'Vacant' ? 1.0 : (multipliers[construction] || 1.0);
    const subtotal = area * baseRate * multiplier;
    
    // Cesses: Sanitation 10%, Lighting 10%, Water 5% (Total 25% Cess)
    const totalTax = subtotal * 1.25;
    return Math.round(totalTax);
  };

  // Re-calculate tax dynamically on form changes
  useEffect(() => {
    const tax = calculatePanchayatTax(newType, newConstruction, newArea);
    setAssessedTax(tax);
  }, [newType, newConstruction, newArea]);

  const handleCreateAssessment = async (e) => {
    e.preventDefault();
    if (!newOwner || !citizenEmail) {
      alert(t('Please fill out Owner Name and Citizen Email'));
      return;
    }

    setIsCreatingAssessment(true);
    try {
      const token = localStorage.getItem('token');
      
      const res = await fetch('/api/taxes/assessment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ownerName: newOwner,
          propertyType: newType,
          constructionType: newType === 'Vacant' ? 'None' : newConstruction,
          builtUpArea: newArea,
          taxAmount: assessedTax,
          village: 'Panchayat Area',
          email: citizenEmail
        })
      });

      if (res.ok) {
        setNewOwner('');
        setCitizenEmail('');
        fetchProperties();
        alert(t('Property Tax assessment registered successfully!'));
      } else {
        const errorData = await res.json();
        alert(t(errorData.message || 'Failed to create assessment'));
      }
    } catch (err) {
      console.error(err);
      alert(t('Network error creating assessment'));
    } finally {
      setIsCreatingAssessment(false);
    }
  };

  return (
    <div className="w-full space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-[#C4F8FF] tracking-tight flex items-center gap-3">
            <CreditCard className="text-[#C4F8FF] animate-pulse" size={32} />
            {t('Property Taxes Management')}
          </h1>
          <p className="text-[#C4F8FF]/70 mt-1 text-sm">
            {t('Audit property details, compute Indian government rules-based taxes, and log local ledger assessments.')}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Tax Ledger list */}
        <div className="lg:col-span-2 space-y-6">
          <div className="card bg-[#0F4B70]/20 backdrop-blur-sm p-6 rounded-2xl border border-[#C4F8FF]/15 shadow-sm">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
              <h3 className="font-bold text-lg text-[#C4F8FF]">{t('Property Tax Ledger')}</h3>
              
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <div className="flex items-center gap-2 bg-[#0F4B70]/30 px-3 py-2 rounded-lg border border-[#C4F8FF]/15 w-full sm:w-64 focus-within:border-primary transition-colors">
                  <Search size={16} className="text-[#C4F8FF]/60" />
                  <input 
                    type="text" 
                    placeholder={t('Search by ID or owner...')} 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="bg-transparent border-none outline-none text-sm w-full" 
                  />
                </div>
                <div className="flex items-center gap-2 px-3 py-2 border border-[#C4F8FF]/15 rounded-lg text-sm font-medium text-[#C4F8FF]/80 bg-[#0F4B70]/20 backdrop-blur-sm hover:bg-[#0F4B70]/30 transition-colors">
                  <Filter size={16} className="text-[#C4F8FF]/60" />
                  <select 
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="bg-transparent border-none outline-none text-sm font-medium text-[#C4F8FF]/80 cursor-pointer"
                  >
                    <option value="All">{t('All Statuses')}</option>
                    <option value="Paid">{t('Paid')}</option>
                    <option value="Unpaid">{t('Unpaid')}</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              {loading ? (
                <div className="py-12 text-center text-[#C4F8FF]/60 font-medium">{t('Loading ledger...')}</div>
              ) : (
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="text-xs font-bold text-[#C4F8FF]/60 uppercase tracking-wider border-b border-[#C4F8FF]/15 bg-[#0F4B70]/20">
                      <th className="py-3 pl-6">{t('Owner / Property ID')}</th>
                      <th className="py-3">{t('Details')}</th>
                      <th className="py-3">{t('Annual Tax')}</th>
                      <th className="py-3">{t('Status')}</th>
                      <th className="py-3">{t('Receipt / Txn ID')}</th>
                    </tr>
                  </thead>
                  <tbody className="text-sm">
                    {(() => {
                      const filtered = properties.filter(p => {
                        const matchesSearch = p.ownerName.toLowerCase().includes(searchQuery.toLowerCase()) || 
                                              p.propertyId.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                              (p.user?.email || '').toLowerCase().includes(searchQuery.toLowerCase());
                        const matchesStatus = filterStatus === 'All' || p.paymentStatus === filterStatus;
                        return matchesSearch && matchesStatus;
                      });

                      if (filtered.length === 0) {
                        return (
                          <tr>
                            <td colSpan="5" className="py-8 text-center text-[#C4F8FF]/60">{t('No records found.')}</td>
                          </tr>
                        );
                      }

                      return filtered.map((prop) => (
                        <tr key={prop._id} className="border-b border-[#C4F8FF]/20 hover:bg-[#0F4B70]/30 transition-colors">
                          <td className="py-4 pl-6">
                            <div className="font-bold text-[#C4F8FF]">{prop.ownerName}</div>
                            <div className="text-xs text-[#C4F8FF]/60 font-mono mt-0.5">{prop.propertyId}</div>
                          </td>
                          <td className="py-4">
                            <div className="text-[#C4F8FF]/80 text-xs">
                              <span className="font-semibold">{t(prop.propertyType)}</span> | {prop.builtUpArea} sq ft<br/>
                              {prop.propertyType !== 'Vacant' && <span className="text-[10px] text-[#C4F8FF]/60">{t(prop.constructionType)} {t('construction')}</span>}
                            </div>
                          </td>
                          <td className="py-4 font-bold text-[#C4F8FF]">
                            ₹{prop.taxAmount}
                          </td>
                          <td className="py-4">
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${
                              prop.paymentStatus === 'Paid' ? 'bg-green-100 text-green-400' : 'bg-red-100 text-red-400'
                            }`}>
                              {t(prop.paymentStatus)}
                            </span>
                          </td>
                          <td className="py-4 font-mono text-xs text-[#C4F8FF]/70">
                            {prop.paymentStatus === 'Paid' ? (
                              <div>
                                <span className="font-bold text-[#C4F8FF]">{prop.transactionId}</span>
                                <div className="text-[9px] text-[#C4F8FF]/60">{prop.paidAt ? new Date(prop.paidAt).toLocaleDateString() : t('Paid')}</div>
                              </div>
                            ) : (
                              <span className="text-[#C4F8FF]/70">—</span>
                            )}
                          </td>
                        </tr>
                      ));
                    })()}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>

        {/* Right 1 Col: Assess form */}
        <div className="space-y-6">
          {/* Create Assessment Form */}
          <div className="card bg-[#0F4B70]/20 backdrop-blur-sm p-6 rounded-2xl border border-[#C4F8FF]/15 shadow-sm">
            <h3 className="font-bold text-lg text-[#C4F8FF] mb-2 flex items-center gap-2">
              <PlusCircle size={20} className="text-[#C4F8FF]" /> {t('Assign Tax Assessment')}
            </h3>
            <p className="text-xs text-[#C4F8FF]/70 mb-6">{t('Create property tax bills manually for village citizens.')}</p>

            <form onSubmit={handleCreateAssessment} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#C4F8FF]/70 uppercase mb-2">{t('Citizen Email Address')}</label>
                <input
                  type="email"
                  placeholder="e.g. citizen@panchayat.gov.in"
                  value={citizenEmail}
                  onChange={(e) => setCitizenEmail(e.target.value)}
                  className="w-full border border-[#C4F8FF]/15 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-primary bg-[#0F4B70]/20 backdrop-blur-sm font-medium text-[#C4F8FF]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#C4F8FF]/70 uppercase mb-2">{t('Owner Full Name')}</label>
                <input
                  type="text"
                  placeholder="e.g. Anand Deshmukh"
                  value={newOwner}
                  onChange={(e) => setNewOwner(e.target.value)}
                  className="w-full border border-[#C4F8FF]/15 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-primary bg-[#0F4B70]/20 backdrop-blur-sm font-medium text-[#C4F8FF]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#C4F8FF]/70 uppercase mb-1">{t('Type')}</label>
                  <select
                    value={newType}
                    onChange={(e) => setNewType(e.target.value)}
                    className="w-full border border-[#C4F8FF]/15 rounded-xl px-2 py-1.5 text-xs focus:outline-none focus:border-primary bg-[#0F4B70]/20 backdrop-blur-sm font-medium text-[#C4F8FF]"
                  >
                    <option value="Residential">{t('Residential')}</option>
                    <option value="Commercial">{t('Commercial')}</option>
                    <option value="Industrial">{t('Industrial')}</option>
                    <option value="Vacant">{t('Vacant')}</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#C4F8FF]/70 uppercase mb-1">{t('Construction')}</label>
                  <select
                    value={newConstruction}
                    onChange={(e) => setNewConstruction(e.target.value)}
                    disabled={newType === 'Vacant'}
                    className="w-full border border-[#C4F8FF]/15 rounded-xl px-2 py-1.5 text-xs focus:outline-none focus:border-primary bg-[#0F4B70]/20 backdrop-blur-sm font-medium text-[#C4F8FF] disabled:bg-[#0F4B70]/30"
                  >
                    <option value="Pucca">{t('Pucca')}</option>
                    <option value="Semi-Pucca">{t('Semi-Pucca')}</option>
                    <option value="Kutcha">{t('Kutcha')}</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 items-end">
                <div>
                  <label className="block text-xs font-bold text-[#C4F8FF]/70 uppercase mb-1">{t('Area (sq ft)')}</label>
                  <input
                    type="number"
                    value={newArea}
                    onChange={(e) => setNewArea(Math.max(1, parseInt(e.target.value) || 0))}
                    className="w-full border border-[#C4F8FF]/15 rounded-xl px-2 py-1.5 text-xs focus:outline-none focus:border-primary bg-[#0F4B70]/20 backdrop-blur-sm font-semibold text-[#C4F8FF]"
                  />
                </div>
                <div className="text-right pb-1.5 pr-2">
                  <div className="text-[10px] font-bold text-[#C4F8FF]/60">{t('Assessed Tax:')}</div>
                  <div className="text-sm font-black text-[#C4F8FF]">₹{assessedTax}</div>
                </div>
              </div>

              <button
                type="submit"
                disabled={isCreatingAssessment}
                className="w-full py-3 bg-[#0F4B70]/30 backdrop-blur-md hover:bg-black text-white rounded-xl font-bold text-xs shadow-md transition-all flex items-center justify-center gap-1.5"
              >
                <PlusCircle size={14} /> {isCreatingAssessment ? t('Registering...') : t('Register Property & Bill')}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminTaxes;

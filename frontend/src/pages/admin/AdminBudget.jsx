import React, { useState, useEffect } from 'react';
import { DollarSign, PlusCircle, Trash2, Calendar, FileText, CheckCircle, Info } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

const AdminBudget = () => {
  const { t } = useLanguage();
  const defaultItems = [
    { category: 'Road Development', allocatedAmount: 100000000, description: 'Laying asphalt and repairing major link roads' },
    { category: 'Infrastructure (Schools, etc.)', allocatedAmount: 20000000, description: 'Constructing library blocks and digital classrooms' },
    { category: 'Water Supply & Sanitation', allocatedAmount: 15000000, description: 'Sinking borewells and pipeline distribution' },
    { category: 'Healthcare Services', allocatedAmount: 10000000, description: 'Stocking generic health centers and organizing camps' },
    { category: 'Solar Street Lights', allocatedAmount: 5000000, description: 'Fitting solar cells and street LEDs' }
  ];

  const [budgetItems, setBudgetItems] = useState(defaultItems);
  const [budgetAmount, setBudgetAmount] = useState(0);
  const [budgetDesc, setBudgetDesc] = useState('');
  const [budgetYear, setBudgetYear] = useState('2026-2027');
  const [budgetLoading, setBudgetLoading] = useState(false);
  const [savedBudgets, setSavedBudgets] = useState([]);
  const [fetchLoading, setFetchLoading] = useState(true);

  const fetchBudgetForYear = async (year) => {
    try {
      setFetchLoading(true);
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/budget?year=${year}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        if (data) {
          setBudgetDesc(data.description || '');
          setBudgetItems(data.items && data.items.length > 0 ? data.items : defaultItems);
          setBudgetAmount(data.allocatedAmount || 0);
        } else {
          // If no budget is saved for this year, start fresh with default items
          setBudgetDesc('');
          setBudgetItems(defaultItems);
          const total = defaultItems.reduce((sum, item) => sum + item.allocatedAmount, 0);
          setBudgetAmount(total);
        }
      }
    } catch (err) {
      console.error('Error fetching budget for year:', err);
    } finally {
      setFetchLoading(false);
    }
  };

  const fetchAllSavedBudgets = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/budget?all=true', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setSavedBudgets(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error('Error fetching all budgets:', err);
    }
  };

  useEffect(() => {
    fetchBudgetForYear(budgetYear);
    fetchAllSavedBudgets();
  }, [budgetYear]);

  useEffect(() => {
    const total = budgetItems.reduce((sum, item) => sum + (Number(item.allocatedAmount) || 0), 0);
    setBudgetAmount(total);
  }, [budgetItems]);

  const handleUpdateItem = (index, field, value) => {
    const updated = [...budgetItems];
    if (field === 'allocatedAmount') {
      updated[index][field] = Number(value) || 0;
    } else {
      updated[index][field] = value;
    }
    setBudgetItems(updated);
  };

  const handleAddItem = () => {
    setBudgetItems([...budgetItems, { category: '', allocatedAmount: 0, description: '' }]);
  };

  const handleRemoveItem = (index) => {
    const updated = budgetItems.filter((_, i) => i !== index);
    setBudgetItems(updated);
  };

  const formatIndianCurrency = (num) => {
    if (num >= 10000000) {
      return `${(num / 10000000).toFixed(2)} ${t('Crore')}`;
    } else if (num >= 100000) {
      return `${(num / 100000).toFixed(2)} ${t('Lakh')}`;
    }
    return num.toLocaleString('en-IN');
  };

  const handleAllocateBudget = async (e) => {
    e.preventDefault();
    if (!budgetDesc) {
      alert('Please fill out general budget description');
      return;
    }
    if (budgetItems.length === 0) {
      alert('Please add at least one budget category item');
      return;
    }

    setBudgetLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/budget', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          allocatedAmount: Number(budgetAmount),
          description: budgetDesc,
          year: budgetYear,
          items: budgetItems
        })
      });

      if (res.ok) {
        alert(`FY ${budgetYear} budget allocation saved successfully! Email alerts triggered to citizens.`);
        fetchAllSavedBudgets();
      } else {
        alert('Failed to save budget allocation');
      }
    } catch (err) {
      console.error(err);
      alert('Network error allocating budget');
    } finally {
      setBudgetLoading(false);
    }
  };

  return (
    <div className="w-full space-y-6">
      <div>
        <h1 className="text-3xl font-extrabold text-[#C4F8FF] tracking-tight flex items-center gap-3">
          <DollarSign className="text-[#C4F8FF] animate-pulse" size={32} />
          {t('Panchayat Budget Allocation')}
        </h1>
        <p className="text-[#C4F8FF]/70 mt-1 text-sm">
          {t('Configure total funds distribution by year and sector categories. Submitted allocations automatically email all registered citizens.')}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Budget Editor Panel */}
        <div className="lg:col-span-2 space-y-6">
          <div className="card bg-[#0F4B70]/20 backdrop-blur-sm p-6 rounded-2xl border border-[#C4F8FF]/15 shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-extrabold text-lg text-[#C4F8FF]">{t('Budget Editor Console')}</h3>
              
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-[#C4F8FF]/70 uppercase">{t('Fiscal Year:')}</span>
                <select
                  value={budgetYear}
                  onChange={(e) => setBudgetYear(e.target.value)}
                  className="border border-[#C4F8FF]/15 rounded-xl px-3 py-1.5 text-xs font-bold text-[#C4F8FF] bg-[#0F4B70]/20 backdrop-blur-sm"
                >
                  <option value="2026-2027">FY 2026-2027</option>
                  <option value="2027-2028">FY 2027-2028</option>
                  <option value="2028-2029">FY 2028-2029</option>
                  <option value="2029-2030">FY 2029-2030</option>
                </select>
              </div>
            </div>

            {fetchLoading ? (
              <div className="py-20 text-center text-[#C4F8FF]/60 font-bold">{t('Loading FY data...')}</div>
            ) : (
              <form onSubmit={handleAllocateBudget} className="space-y-6">
                <div className="bg-[#0F4B70]/30 rounded-2xl p-5 border border-[#C4F8FF]/15 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-[#C4F8FF]/60 uppercase tracking-widest">{t('Total Distributed Budget')}</span>
                    <h2 className="text-3xl font-black text-[#C4F8FF]">₹{formatIndianCurrency(budgetAmount)}</h2>
                  </div>
                  <div className="text-xs text-[#C4F8FF]/70 max-w-xs sm:text-right">
                    {t('Calculated automatically from the items configured below. Limit allocations as per village grants.')}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-extrabold text-[#C4F8FF]/70 uppercase tracking-wider mb-2">{t('Panchayat Budget Directives (Description)')}</label>
                  <textarea
                    rows="3"
                    required
                    placeholder={t('Provide a general statement on the development objectives and funding sources for this fiscal year...')}
                    value={budgetDesc}
                    onChange={(e) => setBudgetDesc(e.target.value)}
                    className="w-full border border-[#C4F8FF]/15 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary bg-[#0F4B70]/20 backdrop-blur-sm text-[#C4F8FF] font-medium"
                  ></textarea>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between items-center border-b border-[#C4F8FF]/20 pb-2">
                    <label className="block text-sm font-extrabold text-[#C4F8FF] uppercase">{t('Itemized Sector Distribution')}</label>
                    <span className="text-xs font-bold text-[#C4F8FF]/60 bg-[#0F4B70]/40 px-2.5 py-1 rounded-lg">
                      {budgetItems.length} {t('Categories')}
                    </span>
                  </div>

                  <div className="space-y-3 max-h-[450px] overflow-y-auto pr-1">
                    {budgetItems.map((item, idx) => (
                      <div key={idx} className="p-4 bg-[#0F4B70]/30/70 border border-[#C4F8FF]/15 rounded-2xl relative border-l-4 border-l-[#C4F8FF] flex flex-col gap-3 group">
                        <button
                          type="button"
                          onClick={() => handleRemoveItem(idx)}
                          className="absolute top-3 right-3 text-[#C4F8FF]/60 hover:text-red-500 transition-colors p-1"
                          title={t('Remove item')}
                        >
                          <Trash2 size={16} />
                        </button>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-[9px] font-bold text-[#C4F8FF]/60 uppercase tracking-wider mb-1">{t('Sector / Category Name')}</label>
                            <input
                              type="text"
                              required
                              placeholder={t('e.g. Health, Road Infrastructure')}
                              value={item.category}
                              onChange={(e) => handleUpdateItem(idx, 'category', e.target.value)}
                              className="w-full bg-[#0F4B70]/20 backdrop-blur-sm border border-[#C4F8FF]/15 rounded-xl px-3 py-2 text-xs font-extrabold text-[#C4F8FF] focus:outline-none focus:border-primary"
                            />
                          </div>
                          <div>
                            <label className="block text-[9px] font-bold text-[#C4F8FF]/60 uppercase tracking-wider mb-1">{t('Allocated Amount (₹)')}</label>
                            <div className="relative">
                              <input
                                type="number"
                                required
                                min="0"
                                placeholder={t('Amount in Rs.')}
                                value={item.allocatedAmount || ''}
                                onChange={(e) => handleUpdateItem(idx, 'allocatedAmount', e.target.value)}
                                className="w-full bg-[#0F4B70]/20 backdrop-blur-sm border border-[#C4F8FF]/15 rounded-xl px-3 py-2 text-xs font-bold text-[#C4F8FF] focus:outline-none focus:border-primary pr-20"
                              />
                              <span className="absolute right-3 top-2 text-[10px] font-black text-[#C4F8FF]">
                                {formatIndianCurrency(item.allocatedAmount || 0)}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div>
                          <label className="block text-[9px] font-bold text-[#C4F8FF]/60 uppercase tracking-wider mb-1">{t('Sector Objective / Description')}</label>
                          <input
                            type="text"
                            placeholder={t('Detailed description of works (e.g. Constructing library block)...')}
                            value={item.description || ''}
                            onChange={(e) => handleUpdateItem(idx, 'description', e.target.value)}
                            className="w-full bg-[#0F4B70]/20 backdrop-blur-sm border border-[#C4F8FF]/15 rounded-xl px-3 py-2 text-xs font-medium text-[#C4F8FF]/80 focus:outline-none focus:border-primary"
                          />
                        </div>
                      </div>
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={handleAddItem}
                    className="w-full py-2.5 border border-dashed border-[#C4F8FF]/30 text-[#C4F8FF]/70 hover:text-[#C4F8FF] hover:border-primary hover:bg-[#C4F8FF]/10/5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5"
                  >
                    <PlusCircle size={14} /> {t('Add New Sector Category')}
                  </button>
                </div>

                <button
                  type="submit"
                  disabled={budgetLoading}
                  className="w-full py-3 bg-[#0F4B70]/80 hover:bg-[#C4F8FF]/10-dark text-white rounded-xl font-bold shadow-lg shadow-primary/20 transition-all flex items-center justify-center gap-2"
                >
                  <CheckCircle size={18} /> {budgetLoading ? t('Broadcasting Budget via Emails...') : t('Publish FY Budget & Notify Citizens')}
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Budget Audit Log Sidebar */}
        <div className="space-y-6">
          <div className="card bg-[#0F4B70]/20 backdrop-blur-sm p-6 rounded-2xl border border-[#C4F8FF]/15 shadow-sm">
            <h3 className="font-extrabold text-lg text-[#C4F8FF] mb-2 flex items-center gap-2">
              <Calendar size={18} className="text-[#C4F8FF]" /> {t('Saved Budget Ledgers')}
            </h3>
            <p className="text-xs text-[#C4F8FF]/70 mb-4">{t('Chronological list of registered Panchayat annual budgets.')}</p>

            <div className="space-y-3">
              {!Array.isArray(savedBudgets) || savedBudgets.length === 0 ? (
                <div className="py-6 text-center text-xs text-[#C4F8FF]/60 italic">{t('No budgets published yet.')}</div>
              ) : (
                savedBudgets.map(b => (
                  <div 
                    key={b._id} 
                    onClick={() => setBudgetYear(b.year)}
                    className={`p-4 rounded-xl border transition-all duration-200 cursor-pointer ${
                      budgetYear === b.year 
                        ? 'border-primary bg-[#0F4B70]/80/5 shadow-sm' 
                        : 'border-[#C4F8FF]/15 hover:bg-[#0F4B70]/30'
                    }`}
                  >
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-extrabold text-sm text-[#C4F8FF]">FY {b.year}</span>
                      <span className="text-[10px] bg-[#0F4B70]/80 text-white font-extrabold px-2 py-0.5 rounded-full">
                        ₹{formatIndianCurrency(b.allocatedAmount)}
                      </span>
                    </div>
                    <p className="text-[11px] text-[#C4F8FF]/70 line-clamp-2 leading-relaxed">
                      {b.description}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="card bg-[#C4F8FF]/10 border border-[#C4F8FF]/20 p-5 rounded-2xl space-y-3">
            <div className="flex items-center gap-2 text-[#C4F8FF]">
              <Info size={18} />
              <h4 className="font-bold text-sm">{t('Transparency Standard')}</h4>
            </div>
            <p className="text-xs text-[#C4F8FF]/80 leading-relaxed">
              {t('Under Section 4 of the Indian Right to Information Act, Gram Panchayats must publicly list all yearly fiscal allocations, sector distributions, and developmental audit metrics to encourage accountability.')}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminBudget;

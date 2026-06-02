import React, { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import { DollarSign, Calendar, TrendingUp, Info } from 'lucide-react';

const COLORS = ['#0d47a1', '#1976d2', '#2196f3', '#4fc3f7', '#80deea', '#0097a7', '#006064'];

const CitizenBudget = () => {
  const [budgetYear, setBudgetYear] = useState('2026-2027');
  const [budget, setBudget] = useState(null);
  const [savedYears, setSavedYears] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchBudgetForYear = async (year) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/budget?year=${year}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setBudget(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchSavedYears = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/budget?all=true', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          setSavedYears(data.map(b => b.year));
          // If current year is in the list, keep it. Otherwise, set it to the first available year.
          if (!data.some(b => b.year === budgetYear)) {
            setBudgetYear(data[0].year);
          }
        } else {
          setSavedYears(['2026-2027']);
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchSavedYears();
  }, []);

  useEffect(() => {
    fetchBudgetForYear(budgetYear);
  }, [budgetYear]);

  const formatIndianCurrency = (num) => {
    if (num >= 10000000) {
      return `${(num / 10000000).toFixed(2)} Crore`;
    } else if (num >= 100000) {
      return `${(num / 100000).toFixed(2)} Lakh`;
    }
    return num.toLocaleString('en-IN');
  };

  const chartData = budget && budget.items ? budget.items.map(item => ({
    name: item.category,
    value: item.allocatedAmount,
    formattedValue: formatIndianCurrency(item.allocatedAmount)
  })) : [];

  return (
    <div className="w-full space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-[#C4F8FF] tracking-tight flex items-center gap-3">
            <DollarSign className="text-[#C4F8FF] animate-pulse" size={32} />
            Panchayat Budget Allocations
          </h1>
          <p className="text-[#C4F8FF]/70 mt-1 text-sm">
            Access transparent breakdowns of the Gram Panchayat annual development budgets and visual sector allocations.
          </p>
        </div>

        {/* Year Selector */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-[#C4F8FF]/70 uppercase">Fiscal Year:</span>
          <select
            value={budgetYear}
            onChange={(e) => setBudgetYear(e.target.value)}
            className="border border-[#C4F8FF]/15 rounded-xl px-4 py-2 text-xs font-bold text-[#C4F8FF] bg-[#0F4B70]/20 backdrop-blur-sm shadow-sm focus:outline-none focus:border-primary"
          >
            {savedYears.map(year => (
              <option key={year} value={year}>FY {year}</option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="py-20 text-center text-[#C4F8FF]/60 font-bold">Retrieving Budget Records...</div>
      ) : !budget ? (
        <div className="card bg-[#0F4B70]/20 backdrop-blur-sm p-12 text-center border border-[#C4F8FF]/15 rounded-2xl">
          <Info size={40} className="text-slate-350 mx-auto mb-3" />
          <p className="text-[#C4F8FF]/85 font-bold">No budget details registered for fiscal year {budgetYear}.</p>
          <p className="text-[#C4F8FF]/60 text-xs mt-1">Please check back later or select a different year.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Top stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="card bg-[#0F4B70]/20 backdrop-blur-sm p-6 rounded-2xl border border-[#C4F8FF]/15 shadow-sm flex items-center gap-4">
              <div className="p-3 bg-[#0F4B70]/80/5 text-[#C4F8FF] rounded-xl">
                <DollarSign size={24} />
              </div>
              <div>
                <span className="text-[10px] font-bold text-[#C4F8FF]/60 uppercase tracking-wider block">Total Allocated Funds</span>
                <span className="text-2xl font-black text-[#C4F8FF]">₹{formatIndianCurrency(budget.allocatedAmount)}</span>
              </div>
            </div>

            <div className="card bg-[#0F4B70]/20 backdrop-blur-sm p-6 rounded-2xl border border-[#C4F8FF]/15 shadow-sm flex items-center gap-4 md:col-span-2">
              <div className="p-3 bg-[#C4F8FF]/10 text-green-400 rounded-xl">
                <TrendingUp size={24} />
              </div>
              <div className="flex-1">
                <span className="text-[10px] font-bold text-[#C4F8FF]/60 uppercase tracking-wider block">Development Objectives</span>
                <p className="text-xs text-[#C4F8FF]/80 font-medium leading-relaxed mt-0.5">{budget.description}</p>
              </div>
            </div>
          </div>

          {/* Visual Breakdown charts */}
          {chartData.length > 0 && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Pie Chart Card */}
              <div className="card bg-[#0F4B70]/20 backdrop-blur-sm p-6 rounded-2xl border border-[#C4F8FF]/15 shadow-sm flex flex-col items-center">
                <h3 className="font-bold text-sm text-[#C4F8FF] uppercase tracking-wider mb-6 w-full text-left">Sector Percentage Share</h3>
                <div className="w-full h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={chartData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={85}
                        paddingAngle={4}
                        dataKey="value"
                      >
                        {chartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip 
                        formatter={(value) => [`₹${value.toLocaleString('en-IN')}`, 'Allocation']} 
                        contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px rgba(0,0,0,0.02)' }}
                      />
                      <Legend verticalAlign="bottom" height={36} iconType="circle" iconSize={8} wrapperStyle={{ fontSize: '10px', fontWeight: 'bold' }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Bar Chart Card */}
              <div className="card bg-[#0F4B70]/20 backdrop-blur-sm p-6 rounded-2xl border border-[#C4F8FF]/15 shadow-sm flex flex-col items-center">
                <h3 className="font-bold text-sm text-[#C4F8FF] uppercase tracking-wider mb-6 w-full text-left">Funds Weight Analysis</h3>
                <div className="w-full h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} margin={{ top: 10, right: 10, left: 10, bottom: 20 }}>
                      <XAxis dataKey="name" tick={{ fontSize: 9, fontWeight: 'bold' }} angle={-15} textAnchor="end" />
                      <YAxis tick={{ fontSize: 9 }} tickFormatter={(val) => `₹${formatIndianCurrency(val).replace(' Crore', 'Cr').replace(' Lakh', 'L')}`} />
                      <Tooltip formatter={(value) => `₹${value.toLocaleString('en-IN')}`} />
                      <Bar dataKey="value" fill="#0d47a1" radius={[4, 4, 0, 0]}>
                        {chartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          )}

          {/* Table Details */}
          <div className="card bg-[#0F4B70]/20 backdrop-blur-sm p-6 rounded-2xl border border-[#C4F8FF]/15 shadow-sm">
            <h3 className="font-bold text-base text-[#C4F8FF] mb-4">Itemized Category Allocations</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="text-xs font-bold text-[#C4F8FF]/60 uppercase tracking-wider border-b border-[#C4F8FF]/20 bg-[#0F4B70]/20">
                    <th className="py-3 pl-4">Sector Category</th>
                    <th className="py-3">Funding Target</th>
                    <th className="py-3 text-right pr-4">Amount Allocated</th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  {budget.items && budget.items.map((item, idx) => (
                    <tr key={idx} className="border-b border-[#C4F8FF]/20 hover:bg-[#0F4B70]/30/40 transition-colors">
                      <td className="py-3.5 pl-4 flex items-center gap-3">
                        <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                        <span className="font-extrabold text-[#C4F8FF]">{item.category}</span>
                      </td>
                      <td className="py-3.5 text-[#C4F8FF]/70 text-xs">
                        {item.description || 'General Panchayat development works.'}
                      </td>
                      <td className="py-3.5 text-right pr-4 font-black text-[#C4F8FF] font-mono">
                        ₹{item.allocatedAmount.toLocaleString('en-IN')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CitizenBudget;

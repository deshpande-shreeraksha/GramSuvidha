import React, { useState, useEffect } from 'react';
import { CreditCard, Calculator, FileText, CheckCircle, Search, HelpCircle, ArrowRight, ShieldCheck, RefreshCw, Layers } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

const Taxes = () => {
  const { t } = useLanguage();
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [payingProperty, setPayingProperty] = useState(null);
  
  // Payment Modal State
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('upi'); // 'upi' | 'card' | 'netbanking'
  const [upiId, setUpiId] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [paymentProcessing, setPaymentProcessing] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [txnId, setTxnId] = useState('');

  // Tax Calculator State
  const [calcType, setCalcType] = useState('Residential');
  const [calcConstruction, setCalcConstruction] = useState('Pucca');
  const [calcArea, setCalcArea] = useState(1000);
  const [calcOwner, setCalcOwner] = useState('');
  const [calculatedTax, setCalculatedTax] = useState(null);
  const [isRegisteringProperty, setIsRegisteringProperty] = useState(false);

  // Selected Receipt state for Modal
  const [selectedReceipt, setSelectedReceipt] = useState(null);

  const fetchProperties = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/taxes', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setProperties(data);
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
    // Base Rates per sq ft per year
    const baseRates = {
      Residential: 2.0,
      Commercial: 5.0,
      Industrial: 8.0,
      Vacant: 0.5
    };

    // Construction Multipliers
    const multipliers = {
      Pucca: 1.25,      // RCC
      'Semi-Pucca': 1.0, // Tiled/Sheet
      Kutcha: 0.5,      // Mud/Thatch
      None: 1.0         // For vacant land
    };

    const baseRate = baseRates[type] || 2.0;
    const multiplier = type === 'Vacant' ? 1.0 : (multipliers[construction] || 1.0);
    
    const subtotal = area * baseRate * multiplier;
    
    // Cesses (Sanitation 10%, Lighting 10%, Water 5%) = Total 25% Cess
    const sanitationCess = subtotal * 0.10;
    const lightingCess = subtotal * 0.10;
    const waterCess = subtotal * 0.05;
    const totalCess = sanitationCess + lightingCess + waterCess;
    const totalTax = subtotal + totalCess;

    return {
      subtotal: Math.round(subtotal),
      sanitationCess: Math.round(sanitationCess),
      lightingCess: Math.round(lightingCess),
      waterCess: Math.round(waterCess),
      totalCess: Math.round(totalCess),
      totalTax: Math.round(totalTax)
    };
  };

  // Re-calculate whenever inputs change
  useEffect(() => {
    const res = calculatePanchayatTax(calcType, calcConstruction, calcArea);
    setCalculatedTax(res);
  }, [calcType, calcConstruction, calcArea]);

  const handleRegisterProperty = async (e) => {
    e.preventDefault();
    if (!calcOwner) {
      alert(t('Please enter Owner Name'));
      return;
    }
    setIsRegisteringProperty(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/taxes/assessment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ownerName: calcOwner,
          propertyType: calcType,
          constructionType: calcType === 'Vacant' ? 'None' : calcConstruction,
          builtUpArea: calcArea,
          taxAmount: calculatedTax.totalTax,
          village: 'Panchayat Area'
        })
      });

      if (res.ok) {
        setCalcOwner('');
        fetchProperties();
        alert(t('Property registered successfully and tax assessed!'));
      } else {
        alert(t('Failed to register property'));
      }
    } catch (err) {
      console.error(err);
      alert(t('Network error'));
    } finally {
      setIsRegisteringProperty(false);
    }
  };

  const handleOpenPayment = (property) => {
    setPayingProperty(property);
    setShowPaymentModal(true);
    setPaymentSuccess(false);
    setPaymentProcessing(false);
    setCardNumber('');
    setUpiId('');
  };

  const handleProcessPayment = async () => {
    setPaymentProcessing(true);
    
    // Simulate API network latency
    setTimeout(async () => {
      try {
        const token = localStorage.getItem('token');
        const gateway = paymentMethod === 'upi' ? `UPI (${upiId || 'GPay'})` : paymentMethod === 'card' ? 'Debit/Credit Card' : 'Net Banking';
        const res = await fetch(`/api/taxes/pay/${payingProperty.propertyId}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ paymentGateway: gateway })
        });

        if (res.ok) {
          const result = await res.json();
          setTxnId(result.property.transactionId);
          setPaymentSuccess(true);
          fetchProperties();
        } else {
          alert(t('Payment Failed on server'));
        }
      } catch (err) {
        console.error(err);
        alert(t('Payment failure due to server error'));
      } finally {
        setPaymentProcessing(false);
      }
    }, 2000);
  };

  const handlePrintReceipt = (property) => {
    setSelectedReceipt(property);
  };

  const executeBrowserPrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 animate-fade-in text-[#C4F8FF]">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[#C4F8FF]">{t('Property Taxes')}</h1>
          <p className="text-[#C4F8FF]/70 mt-1">{t('Manage Panchayat tax assessments and pay taxes digitally.')}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Registered Properties & Calculator */}
        <div className="lg:col-span-2 space-y-6">
          {/* Properties List */}
          <div className="card bg-[#0F4B70]/20 backdrop-blur-sm p-6 rounded-2xl border border-[#C4F8FF]/15 shadow-sm">
            <h3 className="font-bold text-lg text-[#C4F8FF] mb-4 flex items-center gap-2">
              <FileText size={20} className="text-[#C4F8FF]" /> {t('My Tax Assessments')}
            </h3>

            {loading ? (
              <div className="py-12 text-center text-[#C4F8FF]/60 font-medium">{t('Loading properties...')}</div>
            ) : error ? (
              <div className="py-12 text-center text-red-500 font-semibold">{t('Failed to fetch properties')}</div>
            ) : properties.length === 0 ? (
              <div className="py-12 text-center text-[#C4F8FF]/60 font-medium">{t('No properties registered. Use the calculator to assess and add properties.')}</div>
            ) : (
              <div className="space-y-4">
                {properties.map((prop) => (
                  <div key={prop._id} className="bg-[#0F4B70]/30 border border-[#C4F8FF]/15 rounded-2xl p-5 flex flex-col sm:flex-row justify-between sm:items-center gap-4 hover:shadow-md transition-shadow">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-[#C4F8FF] text-base">{prop.ownerName}</span>
                        <span className="text-[10px] font-extrabold px-2 py-0.5 bg-[#0F4B70]/30 text-[#C4F8FF]/80 rounded border border-[#C4F8FF]/20">
                          {prop.propertyId}
                        </span>
                      </div>
                      <p className="text-xs text-[#C4F8FF]/70 mt-1">
                        {t('Type')}: <span className="font-semibold text-[#C4F8FF]">{t(prop.propertyType)}</span> | {t('Build Area')}: <span className="font-semibold text-[#C4F8FF]">{prop.builtUpArea} sq.ft.</span> {prop.propertyType !== 'Vacant' && `| ${t('Construction')}: ${t(prop.constructionType)}`}
                      </p>
                      <p className="text-xs text-[#C4F8FF]/70 mt-0.5">{t('Village Ward')}: {t(prop.village) || t('Panchayat Area')}</p>
                    </div>

                    <div className="flex sm:flex-col items-start sm:items-end justify-between border-t sm:border-t-0 pt-3 sm:pt-0 border-[#C4F8FF]/15">
                      <div className="text-left sm:text-right">
                        <div className="text-xs font-bold text-[#C4F8FF]/60 uppercase">{t('Annual Property Tax')}</div>
                        <div className="text-xl font-bold text-[#C4F8FF] mt-0.5">₹{prop.taxAmount}</div>
                      </div>
                      <div className="mt-2 flex gap-2">
                        {prop.paymentStatus === 'Paid' ? (
                          <>
                            <span className="text-xs font-bold text-green-400 bg-green-500/10 border border-green-500/20 px-3 py-1.5 rounded-lg flex items-center gap-1">
                              <CheckCircle size={12} /> {t('Paid')}
                            </span>
                            <button 
                              onClick={() => handlePrintReceipt(prop)}
                              className="text-xs font-extrabold bg-[#0F4B70]/20 backdrop-blur-sm hover:bg-[#0F4B70]/40 text-[#C4F8FF] border border-[#C4F8FF]/15 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1 shadow-sm"
                            >
                              <FileText size={12} /> {t('Receipt')}
                            </button>
                          </>
                        ) : (
                          <button
                            onClick={() => handleOpenPayment(prop)}
                            className="text-xs font-extrabold bg-[#0F4B70] hover:bg-[#0a344f] border border-[#C4F8FF]/20 text-[#C4F8FF] px-4 py-2 rounded-lg shadow-md shadow-primary/20 transition-all flex items-center gap-1"
                          >
                            <CreditCard size={12} /> {t('Pay Tax')}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Dynamic Indian Property Tax Calculator */}
          <div className="card bg-[#0F4B70]/20 backdrop-blur-sm p-6 rounded-2xl border border-[#C4F8FF]/15 shadow-sm">
            <h3 className="font-bold text-lg text-[#C4F8FF] mb-2 flex items-center gap-2">
              <Calculator size={20} className="text-[#C4F8FF]" /> {t('Indian Gram Panchayat Tax Calculator')}
            </h3>
            <p className="text-xs text-[#C4F8FF]/70 mb-6">{t('Uses legal unit area computation parameters under Panchayati Raj mandates.')}</p>

            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#C4F8FF]/70 uppercase mb-2">{t('Asset/Property Category')}</label>
                  <select
                    value={calcType}
                    onChange={(e) => {
                      setCalcType(e.target.value);
                      if (e.target.value === 'Vacant') setCalcConstruction('None');
                    }}
                    className="w-full border border-[#C4F8FF]/30 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary bg-[#0F4B70]/20 backdrop-blur-sm font-medium text-[#C4F8FF]"
                  >
                    <option value="Residential" className="bg-[#061926]">{t('Residential Building')}</option>
                    <option value="Commercial" className="bg-[#061926]">{t('Commercial Building')}</option>
                    <option value="Industrial" className="bg-[#061926]">{t('Industrial Building')}</option>
                    <option value="Vacant" className="bg-[#061926]">{t('Vacant Land')}</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#C4F8FF]/70 uppercase mb-2">{t('Construction Quality')}</label>
                  <select
                    value={calcConstruction}
                    onChange={(e) => setCalcConstruction(e.target.value)}
                    disabled={calcType === 'Vacant'}
                    className="w-full border border-[#C4F8FF]/30 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary bg-[#0F4B70]/20 backdrop-blur-sm font-medium text-[#C4F8FF] disabled:bg-[#0F4B70]/30 disabled:text-[#C4F8FF]/60"
                  >
                    <option value="Pucca" className="bg-[#061926]">{t('Pucca (RCC Concrete Roof)')}</option>
                    <option value="Semi-Pucca" className="bg-[#061926]">{t('Semi-Pucca (Tiled/Iron Roof)')}</option>
                    <option value="Kutcha" className="bg-[#061926]">{t('Kutcha (Mud/Thatch Roof)')}</option>
                    <option value="None" className="bg-[#061926]">{t('None (Vacant Land)')}</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#C4F8FF]/70 uppercase mb-2">{t('Plinth/Built Area (sq ft)')}</label>
                  <input
                    type="number"
                    min="1"
                    value={calcArea}
                    onChange={(e) => setCalcArea(Math.max(1, parseInt(e.target.value) || 0))}
                    className="w-full border border-[#C4F8FF]/30 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary bg-[#0F4B70]/20 backdrop-blur-sm font-semibold text-[#C4F8FF]"
                  />
                </div>
              </div>

              {/* Assessment Breakdown Panel */}
              {calculatedTax && (
                <div className="bg-[#C4F8FF]/10 border border-[#C4F8FF]/20 rounded-2xl p-5 grid grid-cols-1 md:grid-cols-2 gap-6 animate-scale-in text-[#C4F8FF]">
                  <div>
                    <h4 className="font-extrabold text-sm text-[#C4F8FF] mb-3 uppercase tracking-wider">{t('Computation Itemization')}</h4>
                    <table className="w-full text-xs text-[#C4F8FF]/90 font-medium space-y-2">
                      <tbody>
                        <tr className="flex justify-between border-b border-[#C4F8FF]/20 pb-1.5 text-[#C4F8FF]">
                          <td className="text-[#C4F8FF]/70">{t('Base Building Tax:')}</td>
                          <td>
                            {calcArea} sq.ft. &times; ₹
                            {calcType === 'Residential' ? '2.00' : calcType === 'Commercial' ? '5.00' : calcType === 'Industrial' ? '8.00' : '0.50'}
                          </td>
                        </tr>
                        <tr className="flex justify-between border-b border-[#C4F8FF]/20 py-1.5">
                          <td className="text-[#C4F8FF]/70">{t('Construction Factor Multiplier:')}</td>
                          <td>
                            {calcType === 'Vacant' ? '1.0' : calcConstruction === 'Pucca' ? '1.25' : calcConstruction === 'Semi-Pucca' ? '1.0' : '0.5'}
                          </td>
                        </tr>
                        <tr className="flex justify-between border-b border-[#C4F8FF]/20 py-1.5">
                          <td className="text-[#C4F8FF]/70">{t('Subtotal Annual Tax:')}</td>
                          <td className="font-bold">₹{calculatedTax.subtotal}</td>
                        </tr>
                        <tr className="flex justify-between border-b border-[#C4F8FF]/20 py-1.5 text-[11px]">
                          <td className="text-[#C4F8FF]/70">{t('Sanitation Cess (10%):')}</td>
                          <td>₹{calculatedTax.sanitationCess}</td>
                        </tr>
                        <tr className="flex justify-between border-b border-[#C4F8FF]/20 py-1.5 text-[11px]">
                          <td className="text-[#C4F8FF]/70">{t('Panchayat Lighting Cess (10%):')}</td>
                          <td>₹{calculatedTax.lightingCess}</td>
                        </tr>
                        <tr className="flex justify-between border-b border-[#C4F8FF]/20 py-1.5 text-[11px]">
                          <td className="text-[#C4F8FF]/70">{t('Drinking Water Cess (5%):')}</td>
                          <td>₹{calculatedTax.waterCess}</td>
                        </tr>
                        <tr className="flex justify-between pt-2 text-sm text-[#C4F8FF] font-extrabold uppercase">
                          <td>{t('Total Annual Tax Due:')}</td>
                          <td className="text-[#C4F8FF]">₹{calculatedTax.totalTax}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  <div className="flex flex-col justify-between">
                    <div>
                      <h4 className="font-extrabold text-sm text-[#C4F8FF] mb-2 uppercase tracking-wider">{t('Tax Seeding Info')}</h4>
                      <p className="text-xs text-[#C4F8FF]/80 leading-relaxed">
                        {t('This calculator estimates annual property tax due according to active Panchayat bylaws.')}
                      </p>
                      <p className="text-xs text-[#C4F8FF]/70 mt-3 leading-relaxed">
                        {t('Official tax bills and properties are registered on your profile by the Panchayat Administrator. Citizens cannot register properties directly.')}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right 1 Col: Info about tax */}
        <div className="space-y-6">
          <div className="card bg-[#0F4B70]/30 backdrop-blur-md text-white border-none p-6 flex flex-col justify-between min-h-[350px]">
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-widest bg-[#C4F8FF] text-[#061926] px-2.5 py-1 rounded">
                {t('LEGAL COMPLIANCE')}
              </span>
              <h4 className="font-bold text-xl mt-4 mb-3 text-[#C4F8FF]">{t('Gram Panchayat Property Taxation')}</h4>
              <p className="text-xs text-[#C4F8FF]/70 leading-relaxed mb-4">
                {t('Under the Indian Panchayati Raj Acts, Gram Panchayats are empowered to levy taxes on buildings and lands to fund local public services.')}
              </p>
              <div className="space-y-3 mt-4 text-xs">
                <div className="flex gap-3 items-start">
                  <ShieldCheck size={16} className="text-emerald-400 flex-shrink-0 mt-0.5" />
                  <p className="text-[#C4F8FF]/70">{t('Annual base valuations scale dynamically based on Commercial, Residential, or Industrial classification.')}</p>
                </div>
                <div className="flex gap-3 items-start">
                  <ShieldCheck size={16} className="text-emerald-400 flex-shrink-0 mt-0.5" />
                  <p className="text-[#C4F8FF]/70">{t('RCC constructed structures carry higher multipliers compared to tiles or mud roofs due to material durability.')}</p>
                </div>
                <div className="flex gap-3 items-start">
                  <ShieldCheck size={16} className="text-emerald-400 flex-shrink-0 mt-0.5" />
                  <p className="text-[#C4F8FF]/70">{t('Sanitation, water, and lighting cesses are collected as percentages to directly offset maintenance costs of village grids.')}</p>
                </div>
              </div>
            </div>
            <div className="border-t border-[#C4F8FF]/20 pt-4 mt-6 text-[10px] text-[#C4F8FF]/70 font-semibold uppercase tracking-wider flex justify-between">
              <span>{t('Fiscal Year')}</span>
              <span className="text-white">2026 – 2027</span>
            </div>
          </div>
        </div>
      </div>

      {/* RAZORPAY-STYLE GATEWAY MODAL SIMULATOR */}
      {showPaymentModal && payingProperty && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in text-[#C4F8FF]">
          <div className="bg-[#061926]/95 backdrop-blur-md rounded-3xl overflow-hidden shadow-2xl max-w-md w-full border border-[#C4F8FF]/20">
            {/* Header with Razorpay Simulation */}
            <div className="bg-[#0F4B70]/30 backdrop-blur-md text-white p-6 relative flex justify-between items-center">
              <div>
                <div className="text-xs uppercase font-extrabold tracking-widest text-blue-400">{t('Payment Gateway')}</div>
                <h3 className="font-extrabold text-lg mt-1 text-white">{t('GramSuvidha checkout')}</h3>
              </div>
              <button 
                onClick={() => setShowPaymentModal(false)}
                className="w-8 h-8 rounded-full bg-slate-800 text-[#C4F8FF]/60 hover:text-white flex items-center justify-center font-bold text-sm transition-colors"
              >
                &times;
              </button>
            </div>

            {/* Sub-Header details */}
            <div className="px-6 py-4 bg-[#0F4B70]/30 border-b border-[#C4F8FF]/15 flex justify-between items-center text-xs">
              <div>
                <p className="font-bold text-[#C4F8FF]/70 uppercase">{t('Assessment ID')}</p>
                <p className="font-extrabold text-[#C4F8FF] mt-0.5">{payingProperty.propertyId}</p>
              </div>
              <div className="text-right">
                <p className="font-bold text-[#C4F8FF]/70 uppercase">{t('Amount Due')}</p>
                <p className="text-base font-extrabold text-[#C4F8FF]">₹{payingProperty.taxAmount}</p>
              </div>
            </div>

            {!paymentSuccess ? (
              <div className="p-6 space-y-6">
                {/* Method selector tabs */}
                <div className="flex bg-[#0F4B70]/40 rounded-xl p-1 border border-[#C4F8FF]/15">
                  <button 
                    onClick={() => setPaymentMethod('upi')}
                    className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${paymentMethod === 'upi' ? 'bg-[#0F4B70]/20 backdrop-blur-sm text-[#C4F8FF] shadow-sm' : 'text-[#C4F8FF]/70'}`}
                  >
                    {t('UPI / Apps')}
                  </button>
                  <button 
                    onClick={() => setPaymentMethod('card')}
                    className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${paymentMethod === 'card' ? 'bg-[#0F4B70]/20 backdrop-blur-sm text-[#C4F8FF] shadow-sm' : 'text-[#C4F8FF]/70'}`}
                  >
                    {t('Cards')}
                  </button>
                  <button 
                    onClick={() => setPaymentMethod('netbanking')}
                    className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${paymentMethod === 'netbanking' ? 'bg-[#0F4B70]/20 backdrop-blur-sm text-[#C4F8FF] shadow-sm' : 'text-[#C4F8FF]/70'}`}
                  >
                    {t('Net Banking')}
                  </button>
                </div>

                {/* Form fields based on selected payment method */}
                {paymentMethod === 'upi' && (
                  <div className="space-y-4">
                    <label className="block text-xs font-bold text-[#C4F8FF]/70 uppercase">{t('Enter Virtual Payment Address (UPI VPA)')}</label>
                    <input
                      type="text"
                      placeholder="e.g. name@okhdfcbank"
                      value={upiId}
                      onChange={(e) => setUpiId(e.target.value)}
                      className="w-full border border-[#C4F8FF]/30 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-primary font-medium text-[#C4F8FF] bg-[#0F4B70]/20 backdrop-blur-sm"
                    />
                    <div className="bg-[#0F4B70]/30 border border-[#C4F8FF]/15 rounded-xl p-4 text-xs text-[#C4F8FF]/70 text-center">
                      {t('Or pay using your preferred UPI app directly.')}
                    </div>
                  </div>
                )}

                {paymentMethod === 'card' && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-[#C4F8FF]/70 uppercase mb-2">{t('Card Number')}</label>
                      <input
                        type="text"
                        placeholder="4111 2222 3333 4444"
                        value={cardNumber}
                        onChange={(e) => setCardNumber(e.target.value)}
                        className="w-full border border-[#C4F8FF]/30 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-primary font-medium text-[#C4F8FF] bg-[#0F4B70]/20 backdrop-blur-sm"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-[#C4F8FF]/70 uppercase mb-2">{t('Expiry Date')}</label>
                        <input
                          type="text"
                          placeholder="MM/YY"
                          value={cardExpiry}
                          onChange={(e) => setCardExpiry(e.target.value)}
                          className="w-full border border-[#C4F8FF]/30 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-primary font-medium text-[#C4F8FF] bg-[#0F4B70]/20 backdrop-blur-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-[#C4F8FF]/70 uppercase mb-2">{t('CVV / CVC')}</label>
                        <input
                          type="password"
                          placeholder="123"
                          value={cardCvv}
                          onChange={(e) => setCardCvv(e.target.value)}
                          className="w-full border border-[#C4F8FF]/30 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-primary font-medium text-[#C4F8FF] bg-[#0F4B70]/20 backdrop-blur-sm"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {paymentMethod === 'netbanking' && (
                  <div className="space-y-4">
                    <label className="block text-xs font-bold text-[#C4F8FF]/70 uppercase">{t('Select Netbanking Bank')}</label>
                    <select
                      className="w-full border border-[#C4F8FF]/30 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-primary font-semibold text-[#C4F8FF] bg-[#0F4B70]/20 backdrop-blur-sm"
                    >
                      <option className="bg-[#061926]">{t('State Bank of India')}</option>
                      <option className="bg-[#061926]">{t('HDFC Bank')}</option>
                      <option className="bg-[#061926]">{t('ICICI Bank')}</option>
                      <option className="bg-[#061926]">{t('Punjab National Bank')}</option>
                      <option className="bg-[#061926]">{t('Axis Bank')}</option>
                    </select>
                  </div>
                )}

                {/* Submit button */}
                <button
                  onClick={handleProcessPayment}
                  disabled={paymentProcessing}
                  className="w-full py-3.5 bg-[#0F4B70] hover:bg-[#0a344f] border border-[#C4F8FF]/30 text-white font-extrabold rounded-2xl shadow-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {paymentProcessing ? (
                    <>
                      <RefreshCw className="animate-spin" size={16} /> {t('Processing Secure Payment...')}
                    </>
                  ) : (
                    <>
                      {t('Authorize Payment of')} ₹{payingProperty.taxAmount}
                    </>
                  )}
                </button>
              </div>
            ) : (
              // Success Screen
              <div className="p-8 text-center space-y-6 animate-scale-in text-[#C4F8FF]">
                <div className="w-16 h-16 rounded-full bg-green-500/10 text-green-400 border border-green-500/20 flex items-center justify-center mx-auto">
                  <CheckCircle size={40} />
                </div>
                <div>
                  <h4 className="font-extrabold text-xl">{t('Payment Successful')}</h4>
                  <p className="text-xs text-[#C4F8FF]/70 mt-1">{t('Property tax collection has been logged in Gram Panchayat archives.')}</p>
                </div>
                <div className="bg-[#0F4B70]/30 border border-[#C4F8FF]/15 rounded-2xl p-4 text-xs font-medium space-y-2 text-[#C4F8FF]/80 text-left">
                  <div className="flex justify-between">
                    <span>{t('Transaction ID:')}</span>
                    <span className="font-mono font-bold text-[#C4F8FF]">{txnId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>{t('Paid Amount:')}</span>
                    <span className="font-bold text-[#C4F8FF]">₹{payingProperty.taxAmount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>{t('Mode:')}</span>
                    <span className="font-bold text-[#C4F8FF] capitalize">{t(paymentMethod)} {t('Gateway')}</span>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setShowPaymentModal(false);
                    handlePrintReceipt({ ...payingProperty, paymentStatus: 'Paid', transactionId: txnId, paidAt: new Date() });
                  }}
                  className="w-full py-3 bg-[#0F4B70] hover:bg-[#0a344f] border border-[#C4F8FF]/20 text-white font-bold rounded-xl shadow-md transition-colors"
                >
                  {t('Generate Tax Receipt')}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* DETAILED TAX RECEIPT PRINT VIEW (MODAL) */}
      {selectedReceipt && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl overflow-hidden shadow-2xl max-w-2xl w-full border border-slate-200 relative flex flex-col max-h-[95vh]">
            
            {/* Modal Actions */}
            <div className="p-4 border-b border-slate-200 bg-slate-50 flex justify-between items-center print:hidden">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Official Document Preview</span>
              <div className="flex gap-2">
                <button 
                  onClick={executeBrowserPrint}
                  className="bg-slate-800 hover:bg-slate-900 border border-slate-700 text-white px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-1.5"
                >
                  <FileText size={14} /> Print / Export PDF
                </button>
                <button 
                  onClick={() => setSelectedReceipt(null)}
                  className="bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 px-4 py-2 rounded-xl text-xs font-bold transition-all"
                >
                  Close
                </button>
              </div>
            </div>

            {/* PRINTABLE RECEIPT LAYOUT */}
            <div className="p-8 space-y-6 overflow-y-auto flex-1 bg-white printable-receipt text-slate-800">
              
              {/* Receipt Header */}
              <div className="flex justify-between items-start border-b-2 border-slate-300 pb-6">
                <div className="flex gap-4 items-center">
                  <div className="w-16 h-16 rounded-xl border-2 border-slate-300 flex items-center justify-center text-slate-800 font-extrabold text-2xl">
                    🌾
                  </div>
                  <div>
                    <h2 className="text-xl font-extrabold uppercase tracking-tight text-slate-900">Gram Panchayat Digital Portal</h2>
                    <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Government of India / State Panchayati Raj Department</p>
                    <p className="text-xs text-slate-500 mt-0.5 font-medium">Village Ward: {t(selectedReceipt.village) || t('Panchayat Area')}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-extrabold bg-green-50 text-green-700 px-3 py-1 rounded border border-green-300 uppercase tracking-widest">
                    TAX RECEIPT
                  </span>
                  <p className="text-xs font-mono font-bold text-slate-500 mt-2">FY: {selectedReceipt.taxYear}</p>
                </div>
              </div>

              {/* Owner and assessment information */}
              <div className="grid grid-cols-2 gap-6 text-xs bg-slate-50 border border-slate-200 rounded-2xl p-5 text-slate-700">
                <div className="space-y-1.5">
                  <p className="font-bold text-slate-400 uppercase tracking-wider">Property Details</p>
                  <p className="font-bold text-slate-900">Assessment No: <span className="font-mono text-slate-900">{selectedReceipt.propertyId}</span></p>
                  <p className="text-slate-700">Property Type: <span className="font-bold text-slate-800">{t(selectedReceipt.propertyType)}</span></p>
                  {selectedReceipt.propertyType !== 'Vacant' && (
                    <p className="text-slate-700">Construction Class: <span className="font-bold text-slate-800">{t(selectedReceipt.constructionType)}</span></p>
                  )}
                  <p className="text-slate-700">Plinth / Built Area: <span className="font-bold text-slate-800">{selectedReceipt.builtUpArea} sq. ft.</span></p>
                </div>

                <div className="space-y-1.5 text-right sm:text-left">
                  <p className="font-bold text-slate-400 uppercase tracking-wider">Taxpayer Details</p>
                  <p className="font-bold text-slate-900">Owner: {selectedReceipt.ownerName}</p>
                  <p className="text-slate-700">Status: <span className="font-extrabold text-green-600 uppercase">Paid & Cleared</span></p>
                  <p className="text-slate-700">Receipt Date: {selectedReceipt.paidAt ? new Date(selectedReceipt.paidAt).toLocaleDateString() : new Date().toLocaleDateString()}</p>
                  <p className="text-slate-700">Txn Ref: <span className="font-mono font-semibold text-slate-900">{selectedReceipt.transactionId || 'TXN-N/A'}</span></p>
                </div>
              </div>

              {/* Detailed Bill Breakdown */}
              <div className="space-y-4">
                <h4 className="font-extrabold text-sm uppercase tracking-wider text-slate-950 border-b border-slate-350 pb-2">Financial Breakdown</h4>
                
                {/* Calculations for breakdown */}
                {(() => {
                  const breakdown = calculatePanchayatTax(selectedReceipt.propertyType, selectedReceipt.constructionType, selectedReceipt.builtUpArea);
                  return (
                    <table className="w-full text-sm text-slate-800">
                      <thead>
                        <tr className="border-b border-slate-300 text-xs font-bold text-slate-500 uppercase text-left pb-2">
                          <th className="pb-2">Tax Description Component</th>
                          <th className="pb-2 text-right">Amount (₹)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200">
                        <tr className="py-2.5">
                          <td className="py-2.5">Property Base Building / Land Valuation Tax (Annual)</td>
                          <td className="py-2.5 text-right">₹{breakdown.subtotal}</td>
                        </tr>
                        <tr className="py-2.5">
                          <td className="py-2.5">Local Public Health & Sanitation Cess (10%)</td>
                          <td className="py-2.5 text-right">₹{breakdown.sanitationCess}</td>
                        </tr>
                        <tr className="py-2.5">
                          <td className="py-2.5">Street Lighting Maintenance Cess (10%)</td>
                          <td className="py-2.5 text-right">₹{breakdown.lightingCess}</td>
                        </tr>
                        <tr className="py-2.5">
                          <td className="py-2.5">Panchayat Drinking Water Supply Cess (5%)</td>
                          <td className="py-2.5 text-right">₹{breakdown.waterCess}</td>
                        </tr>
                        <tr className="border-t border-slate-400 font-extrabold text-base text-slate-950 bg-slate-50">
                          <td className="py-3 px-3 uppercase tracking-wider">Total Certified Payment</td>
                          <td className="py-3 px-3 text-right text-slate-950">₹{selectedReceipt.taxAmount}</td>
                        </tr>
                      </tbody>
                    </table>
                  );
                })()}
              </div>

              {/* Receipt Footer stamp */}
              <div className="pt-8 border-t border-slate-300 flex justify-between items-center text-xs">
                <div>
                  <p className="text-[10px] text-slate-500 font-extrabold uppercase">Audit Clearance</p>
                  <p className="font-bold text-slate-800 mt-1">Gram Panchayat Comptroller Office</p>
                  <p className="text-slate-500 mt-0.5">Digitally verified through GramSuvidha node registry.</p>
                </div>
                
                <div className="text-center relative">
                  {/* Mock rubber stamp */}
                  <div className="border-4 border-dashed border-green-600/80 text-green-700 rounded-full w-24 h-24 flex items-center justify-center font-black text-xs uppercase transform rotate-12 flex-shrink-0">
                    <div className="text-center">
                      <p>PAID</p>
                      <p className="text-[8px] font-bold">PANCHAYAT</p>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Taxes;

const express = require('express');
const router = express.Router();
const Complaint = require('../models/Complaint');
const { Citizen, Admin, Worker } = require('../models/User');
const { protect, adminOnly } = require('../middleware/authMiddleware');
const translateText = require('../utils/translate');

// @route   GET /api/admin/system-intel
// @desc    Get live system intelligence stats computed from DB
// @access  Admin only
router.get('/system-intel', protect, adminOnly, async (req, res) => {
  try {
    const now = new Date();

    // --- Complaint stats ---
    const [allComplaints, resolvedComplaints, pendingComplaints, highPriorityPending] = await Promise.all([
      Complaint.find({}).select('status priority createdAt category assigned'),
      Complaint.countDocuments({ status: 'Resolved' }),
      Complaint.countDocuments({ status: 'Pending' }),
      Complaint.countDocuments({ status: { $ne: 'Resolved' }, priority: 'High' })
    ]);

    const totalComplaints = allComplaints.length;
    const resolutionRate = totalComplaints > 0
      ? Math.round((resolvedComplaints / totalComplaints) * 100)
      : 0;

    // --- Worker stats ---
    const [totalWorkers, activeWorkers] = await Promise.all([
      Worker.countDocuments({}),
      Worker.countDocuments({ isActive: true })
    ]);
    const workerActivityRate = totalWorkers > 0
      ? Math.round((activeWorkers / totalWorkers) * 100)
      : 0;

    // --- Citizens registered (filtered by admin's villageId) ---
    const citizenFilter = req.user.villageId ? { villageId: req.user.villageId } : {};
    const totalCitizens = await Citizen.countDocuments(citizenFilter);

    // --- Peak hour analysis (from complaint createdAt timestamps) ---
    const hourCounts = {};
    allComplaints.forEach(c => {
      const hour = new Date(c.createdAt).getHours();
      hourCounts[hour] = (hourCounts[hour] || 0) + 1;
    });
    let peakHour = null;
    let peakCount = 0;
    Object.entries(hourCounts).forEach(([hour, count]) => {
      if (count > peakCount) {
        peakCount = count;
        peakHour = parseInt(hour);
      }
    });

    const formatHour = (h) => {
      if (h === null) return 'N/A';
      const suffix = h < 12 ? 'AM' : 'PM';
      const display = h % 12 === 0 ? 12 : h % 12;
      const nextH = (h + 2) % 24;
      const nextSuffix = nextH < 12 ? 'AM' : 'PM';
      const nextDisplay = nextH % 12 === 0 ? 12 : nextH % 12;
      return `${display} ${suffix} – ${nextDisplay} ${nextSuffix}`;
    };

    // --- Unassigned complaints ---
    const unassignedCount = allComplaints.filter(
      c => !c.assigned || c.assigned === '-' || c.assigned === ''
    ).length;

    // --- Category breakdown ---
    const categoryCounts = {};
    allComplaints.forEach(c => {
      const cat = c.category || 'general';
      categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
    });
    const topCategory = Object.entries(categoryCounts).sort((a, b) => b[1] - a[1])[0];

    // --- Build intel items ---
    const intel = [
      {
        id: 'INTEL-001',
        title: 'Peak Submission Hours',
        description: peakHour !== null
          ? `Highest complaint volume detected at ${formatHour(peakHour)} with ${peakCount} submission${peakCount !== 1 ? 's' : ''}.`
          : 'Not enough data to detect peak hours yet.',
        type: 'info',
        icon: 'clock',
        badge: peakHour !== null ? 'DETECTED' : 'MONITORING',
        value: peakHour !== null ? `${peakCount} submissions` : '—'
      },
      {
        id: 'INTEL-002',
        title: 'Volunteer Force Status',
        description: totalWorkers > 0
          ? `${workerActivityRate}% of registered volunteers (${activeWorkers}/${totalWorkers}) are currently active on the platform.`
          : 'No field workers registered yet.',
        type: workerActivityRate >= 75 ? 'success' : workerActivityRate >= 40 ? 'warning' : 'danger',
        icon: 'users',
        badge: workerActivityRate >= 75 ? 'HIGH' : workerActivityRate >= 40 ? 'MODERATE' : 'LOW',
        value: `${workerActivityRate}% active`
      },
      {
        id: 'INTEL-003',
        title: 'Complaint Resolution Rate',
        description: totalComplaints > 0
          ? `${resolutionRate}% of all complaints have been successfully resolved (${resolvedComplaints} out of ${totalComplaints} total).`
          : 'No complaints registered yet.',
        type: resolutionRate >= 70 ? 'success' : resolutionRate >= 40 ? 'warning' : 'danger',
        icon: 'check',
        badge: resolutionRate >= 70 ? 'EXCELLENT' : resolutionRate >= 40 ? 'MODERATE' : 'NEEDS ATTENTION',
        value: `${resolutionRate}%`
      },
      {
        id: 'INTEL-004',
        title: 'High Priority Backlog',
        description: highPriorityPending > 0
          ? `${highPriorityPending} high-priority complaint${highPriorityPending !== 1 ? 's are' : ' is'} unresolved and require immediate attention.`
          : 'No unresolved high-priority complaints. All critical issues are handled.',
        type: highPriorityPending === 0 ? 'success' : highPriorityPending <= 3 ? 'warning' : 'danger',
        icon: 'alert',
        badge: highPriorityPending === 0 ? 'CLEAR' : 'URGENT',
        value: `${highPriorityPending} pending`
      },
      {
        id: 'INTEL-005',
        title: 'Unassigned Complaints',
        description: unassignedCount > 0
          ? `${unassignedCount} complaint${unassignedCount !== 1 ? 's' : ''} have not been assigned to a field worker yet.`
          : 'All filed complaints have been assigned to field workers.',
        type: unassignedCount === 0 ? 'success' : unassignedCount <= 5 ? 'warning' : 'danger',
        icon: 'user-x',
        badge: unassignedCount === 0 ? 'CLEAR' : 'ACTION NEEDED',
        value: `${unassignedCount} unassigned`
      },
      {
        id: 'INTEL-006',
        title: 'Top Complaint Category',
        description: topCategory
          ? `"${topCategory[0].replace(/_/g, ' ').toUpperCase()}" is the most reported issue with ${topCategory[1]} complaint${topCategory[1] !== 1 ? 's' : ''} filed.`
          : 'No complaints registered to analyze categories.',
        type: 'info',
        icon: 'trending',
        badge: 'ANALYSIS',
        value: topCategory ? topCategory[0].replace(/_/g, ' ').toUpperCase() : '—'
      }
    ];

    const userLang = req.headers['x-language'] || req.user?.language || 'en';
    if (userLang !== 'en') {
      const convertNativeDigitsToArabic = (text) => {
        if (typeof text !== 'string') return text;
        const mapping = {
          '೦': '0', '೧': '1', '೨': '2', '೩': '3', '೪': '4', '೫': '5', '೬': '6', '೭': '7', '೮': '8', '೯': '9',
          '०': '0', '१': '1', '२': '2', '३': '3', '४': '4', '५': '5', '६': '6', '७': '7', '८': '8', '९': '9'
        };
        return text.split('').map(char => mapping[char] || char).join('');
      };

      for (let i = 0; i < intel.length; i++) {
        intel[i].title = convertNativeDigitsToArabic(await translateText(intel[i].title, userLang, 'en'));
        intel[i].description = convertNativeDigitsToArabic(await translateText(intel[i].description, userLang, 'en'));
        intel[i].badge = convertNativeDigitsToArabic(await translateText(intel[i].badge, userLang, 'en'));
        intel[i].value = convertNativeDigitsToArabic(await translateText(intel[i].value, userLang, 'en'));
      }
    }

    res.json({
      lastUpdated: now.toISOString(),
      summary: {
        totalComplaints,
        resolvedComplaints,
        pendingComplaints,
        resolutionRate,
        totalWorkers,
        activeWorkers,
        workerActivityRate,
        totalCitizens,
        highPriorityPending,
        unassignedCount
      },
      intel
    });
  } catch (error) {
    console.error('System Intel Error:', error.message);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
});

// @route   GET /api/admin/worker-stats
// @desc    Get field worker stats for FieldWorkers page
// @access  Admin only
router.get('/worker-stats', protect, adminOnly, async (req, res) => {
  try {
    const [total, active, inactive, recentWorkers] = await Promise.all([
      Worker.countDocuments({}),
      Worker.countDocuments({ isActive: true }),
      Worker.countDocuments({ isActive: false }),
      Worker.find({}).sort({ createdAt: -1 }).limit(5).select('name village createdAt isActive')
    ]);

    // Complaints assigned to workers
    const workers = await Worker.find({}).select('name');
    const workerNames = workers.map(w => w.name);
    const assignedComplaints = await Complaint.countDocuments({
      assigned: { $in: workerNames }
    });

    res.json({
      total,
      active,
      inactive,
      assignedComplaints,
      recentWorkers
    });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
});

// @route   GET /api/admin/citizen-count
// @desc    Get live citizen count for the admin's village
// @access  Admin only
router.get('/citizen-count', protect, adminOnly, async (req, res) => {
  try {
    const adminVillageId = req.user.villageId;
    if (!adminVillageId) {
      const count = await Citizen.countDocuments({});
      return res.json({ count, villageId: 'All' });
    }
    const count = await Citizen.countDocuments({ villageId: adminVillageId });
    res.json({ count, villageId: adminVillageId });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
});

module.exports = router;

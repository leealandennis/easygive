const express = require('express');
const { body, validationResult } = require('express-validator');
const { protect, authorize, checkCompanyAccess } = require('../middleware/auth');
const { prisma } = require('../config/database');

const router = express.Router();

// @desc    Get all companies (Super Admin only)
// @route   GET /api/companies
// @access  Private (Super Admin)
router.get('/', protect, authorize('SUPER_ADMIN'), async (req, res) => {
  try {
    const { page = 1, limit = 10, search, status } = req.query;
    
    let where = {};
    
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { domain: { contains: search, mode: 'insensitive' } },
        { ein: { contains: search, mode: 'insensitive' } }
      ];
    }
    
    // Note: Prisma doesn't support direct JSON field queries in where clause easily
    // Status filtering on nested JSON needs different approach
    
    const companies = await prisma.company.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: parseInt(limit),
      skip: (parseInt(page) - 1) * parseInt(limit)
    });
    
    // Filter by subscription status if provided
    let filteredCompanies = companies;
    if (status) {
      filteredCompanies = companies.filter(c => {
        const sub = c.subscription || {};
        return sub.status === status;
      });
    }
    
    const total = await prisma.company.count({ where });
    
    res.json({
      success: true,
      data: filteredCompanies,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (error) {
    console.error('Get companies error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Get single company
// @route   GET /api/companies/:id
// @access  Private
router.get('/:id', protect, checkCompanyAccess, async (req, res) => {
  try {
    const company = await prisma.company.findUnique({
      where: { id: req.params.id }
    });
    
    if (!company) {
      return res.status(404).json({
        success: false,
        message: 'Company not found'
      });
    }
    
    res.json({
      success: true,
      data: company
    });
  } catch (error) {
    console.error('Get company error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Create new company (Super Admin only)
// @route   POST /api/companies
// @access  Private (Super Admin)
router.post('/', protect, authorize('SUPER_ADMIN'), [
  body('name').trim().isLength({ min: 1 }),
  body('domain').trim().isLength({ min: 1 }),
  body('ein').trim().isLength({ min: 1 }),
  body('address.street').trim().isLength({ min: 1 }),
  body('address.city').trim().isLength({ min: 1 }),
  body('address.state').trim().isLength({ min: 1 }),
  body('address.zipCode').trim().isLength({ min: 1 }),
  body('contactInfo.email').isEmail().normalizeEmail(),
  body('contactInfo.phone').trim().isLength({ min: 1 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const company = await prisma.company.create({
      data: {
        name: req.body.name,
        domain: req.body.domain,
        ein: req.body.ein,
        address: req.body.address,
        contactInfo: req.body.contactInfo,
        subscription: req.body.subscription || {},
        matchingProgram: req.body.matchingProgram || {},
        settings: req.body.settings || {}
      }
    });

    res.status(201).json({
      success: true,
      data: company
    });
  } catch (error) {
    console.error('Create company error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Update company
// @route   PUT /api/companies/:id
// @access  Private (HR Admin or Super Admin)
router.put('/:id', protect, authorize('HR_ADMIN', 'SUPER_ADMIN'), checkCompanyAccess, [
  body('name').optional().trim().isLength({ min: 1 }),
  body('address.street').optional().trim().isLength({ min: 1 }),
  body('address.city').optional().trim().isLength({ min: 1 }),
  body('address.state').optional().trim().isLength({ min: 1 }),
  body('address.zipCode').optional().trim().isLength({ min: 1 }),
  body('contactInfo.email').optional().isEmail().normalizeEmail(),
  body('contactInfo.phone').optional().trim().isLength({ min: 1 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const company = await prisma.company.findUnique({
      where: { id: req.params.id }
    });
    
    if (!company) {
      return res.status(404).json({
        success: false,
        message: 'Company not found'
      });
    }

    // Build update data
    const updateData = {};
    
    // Update allowed fields
    if (req.body.name) updateData.name = req.body.name;
    if (req.body.address) {
      updateData.address = { ...(company.address || {}), ...req.body.address };
    }
    if (req.body.contactInfo) {
      updateData.contactInfo = { ...(company.contactInfo || {}), ...req.body.contactInfo };
    }
    if (req.body.settings) {
      updateData.settings = { ...(company.settings || {}), ...req.body.settings };
    }

    // Only super admins can update subscription and matching program
    if (req.user.role === 'SUPER_ADMIN') {
      if (req.body.subscription) {
        updateData.subscription = { ...(company.subscription || {}), ...req.body.subscription };
      }
      if (req.body.matchingProgram) {
        updateData.matchingProgram = { ...(company.matchingProgram || {}), ...req.body.matchingProgram };
      }
    }

    const updatedCompany = await prisma.company.update({
      where: { id: req.params.id },
      data: updateData
    });

    res.json({
      success: true,
      data: updatedCompany
    });
  } catch (error) {
    console.error('Update company error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Update matching program
// @route   PUT /api/companies/:id/matching
// @access  Private (HR Admin or Super Admin)
router.put('/:id/matching', protect, authorize('HR_ADMIN', 'SUPER_ADMIN'), checkCompanyAccess, [
  body('enabled').isBoolean(),
  body('type').isIn(['percentage', 'fixed', 'none']),
  body('percentage').optional().isFloat({ min: 0, max: 100 }),
  body('fixedAmount').optional().isFloat({ min: 0 }),
  body('annualLimit').optional().isFloat({ min: 0 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const company = await prisma.company.findUnique({
      where: { id: req.params.id }
    });
    
    if (!company) {
      return res.status(404).json({
        success: false,
        message: 'Company not found'
      });
    }

    const { enabled, type, percentage, fixedAmount, annualLimit, preferredCharities } = req.body;

    const matchingProgram = company.matchingProgram || {};
    matchingProgram.enabled = enabled;
    matchingProgram.type = type;
    
    if (percentage !== undefined) matchingProgram.percentage = percentage;
    if (fixedAmount !== undefined) matchingProgram.fixedAmount = fixedAmount;
    if (annualLimit !== undefined) matchingProgram.annualLimit = annualLimit;
    if (preferredCharities) matchingProgram.preferredCharities = preferredCharities;

    const updatedCompany = await prisma.company.update({
      where: { id: req.params.id },
      data: { matchingProgram }
    });

    res.json({
      success: true,
      data: updatedCompany.matchingProgram
    });
  } catch (error) {
    console.error('Update matching program error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Get company dashboard data
// @route   GET /api/companies/:id/dashboard
// @access  Private (HR Admin or Super Admin)
router.get('/:id/dashboard', protect, authorize('HR_ADMIN', 'SUPER_ADMIN'), checkCompanyAccess, async (req, res) => {
  try {
    const { year = new Date().getFullYear() } = req.query;
    
    const company = await prisma.company.findUnique({
      where: { id: req.params.id }
    });
    
    if (!company) {
      return res.status(404).json({
        success: false,
        message: 'Company not found'
      });
    }

    const startDate = new Date(year, 0, 1);
    const endDate = new Date(year, 11, 31, 23, 59, 59);

    // Get all donations for the company
    const donations = await prisma.donation.findMany({
      where: {
        companyId: req.params.id,
        status: 'COMPLETED',
        createdAt: { gte: startDate, lte: endDate }
      },
      include: {
        charity: {
          select: {
            name: true,
            category: true
          }
        }
      }
    });

    // Calculate donation summary
    const totalDonations = donations.reduce((sum, d) => sum + parseFloat(d.amount), 0);
    const totalMatching = donations.reduce((sum, d) => sum + parseFloat(d.matchingAmount), 0);
    const totalAmount = donations.reduce((sum, d) => sum + parseFloat(d.totalAmount), 0);
    const donationCount = donations.length;
    const uniqueDonors = new Set(donations.map(d => d.userId)).size;
    
    // Get employee participation
    const totalEmployees = await prisma.user.count({ 
      where: {
        companyId: req.params.id, 
        role: 'EMPLOYEE',
        isActive: true 
      }
    });
    
    // Get participating employees (those who have donated)
    const donorIds = new Set(donations.map(d => d.userId));
    const participatingEmployees = donorIds.size;
    
    // Calculate top charities
    const charityData = {};
    donations.forEach(d => {
      if (!charityData[d.charityId]) {
        charityData[d.charityId] = {
          charityName: d.charity.name,
          charityCategory: d.charity.category,
          totalAmount: 0,
          donationCount: 0
        };
      }
      charityData[d.charityId].totalAmount += parseFloat(d.totalAmount);
      charityData[d.charityId].donationCount += 1;
    });

    const topCharities = Object.values(charityData)
      .sort((a, b) => b.totalAmount - a.totalAmount)
      .slice(0, 10);
    
    // Calculate monthly donation trends
    const monthlyData = {};
    donations.forEach(d => {
      const month = d.createdAt.getMonth() + 1;
      if (!monthlyData[month]) {
        monthlyData[month] = { totalAmount: 0, donationCount: 0 };
      }
      monthlyData[month].totalAmount += parseFloat(d.totalAmount);
      monthlyData[month].donationCount += 1;
    });

    const monthlyTrends = Object.entries(monthlyData).map(([month, data]) => ({
      _id: parseInt(month),
      totalAmount: data.totalAmount,
      donationCount: data.donationCount
    })).sort((a, b) => a._id - b._id);
    
    // Get matching program status
    const matchingProgram = company.matchingProgram || {};
    const matchingStatus = {
      enabled: matchingProgram.enabled || false,
      usedAmount: matchingProgram.usedAmount || 0,
      annualLimit: matchingProgram.annualLimit || 0,
      remainingAmount: (matchingProgram.annualLimit || 0) - (matchingProgram.usedAmount || 0),
      utilizationPercentage: matchingProgram.annualLimit > 0 
        ? ((matchingProgram.usedAmount || 0) / matchingProgram.annualLimit) * 100 
        : 0
    };

    res.json({
      success: true,
      data: {
        company: {
          name: company.name,
          subscription: company.subscription,
          matchingProgram: company.matchingProgram
        },
        summary: {
          totalDonations,
          totalMatching,
          totalAmount,
          donationCount,
          uniqueDonorCount: uniqueDonors
        },
        participation: {
          totalEmployees,
          participatingEmployees,
          participationRate: totalEmployees > 0 ? (participatingEmployees / totalEmployees) * 100 : 0
        },
        topCharities,
        monthlyTrends,
        matchingStatus
      }
    });
  } catch (error) {
    console.error('Get company dashboard error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Get company employees
// @route   GET /api/companies/:id/employees
// @access  Private (HR Admin or Super Admin)
router.get('/:id/employees', protect, authorize('HR_ADMIN', 'SUPER_ADMIN'), checkCompanyAccess, async (req, res) => {
  try {
    const { page = 1, limit = 10, search, department } = req.query;
    
    let where = { companyId: req.params.id, role: 'EMPLOYEE', isActive: true };
    
    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { employeeId: { contains: search, mode: 'insensitive' } }
      ];
    }
    
    if (department) {
      where.department = department;
    }
    
    const employees = await prisma.user.findMany({
      where,
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        employeeId: true,
        department: true,
        position: true,
        phone: true,
        gamification: true,
        isActive: true,
        createdAt: true
      },
      orderBy: { createdAt: 'desc' },
      take: parseInt(limit),
      skip: (parseInt(page) - 1) * parseInt(limit)
    });
    
    const total = await prisma.user.count({ where });
    
    res.json({
      success: true,
      data: employees,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (error) {
    console.error('Get company employees error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Get company reports
// @route   GET /api/companies/:id/reports
// @access  Private (HR Admin or Super Admin)
router.get('/:id/reports', protect, authorize('HR_ADMIN', 'SUPER_ADMIN'), checkCompanyAccess, async (req, res) => {
  try {
    const { year = new Date().getFullYear(), format = 'json' } = req.query;
    
    const startDate = new Date(year, 0, 1);
    const endDate = new Date(year, 11, 31, 23, 59, 59);
    
    // Get detailed donation report
    const donations = await prisma.donation.findMany({
      where: {
        companyId: req.params.id,
        status: 'COMPLETED',
        createdAt: { gte: startDate, lte: endDate }
      },
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            employeeId: true,
            department: true
          }
        },
        charity: {
          select: {
            name: true,
            category: true,
            ein: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    
    // Calculate summary
    const totalDonations = donations.reduce((sum, d) => sum + parseFloat(d.amount), 0);
    const totalMatching = donations.reduce((sum, d) => sum + parseFloat(d.matchingAmount), 0);
    const totalAmount = donations.reduce((sum, d) => sum + parseFloat(d.totalAmount), 0);
    const donationCount = donations.length;
    const uniqueDonors = new Set(donations.map(d => d.userId)).size;
    
    // Calculate department breakdown
    const departmentData = {};
    donations.forEach(d => {
      const dept = d.user.department || 'Unassigned';
      if (!departmentData[dept]) {
        departmentData[dept] = {
          department: dept,
          totalAmount: 0,
          donationCount: 0,
          uniqueDonors: new Set()
        };
      }
      departmentData[dept].totalAmount += parseFloat(d.totalAmount);
      departmentData[dept].donationCount += 1;
      departmentData[dept].uniqueDonors.add(d.userId);
    });

    const departmentBreakdown = Object.values(departmentData).map(d => ({
      department: d.department,
      totalAmount: d.totalAmount,
      donationCount: d.donationCount,
      uniqueDonorCount: d.uniqueDonors.size
    })).sort((a, b) => b.totalAmount - a.totalAmount);
    
    const company = await prisma.company.findUnique({
      where: { id: req.params.id },
      select: { name: true, ein: true }
    });
    
    const reportData = {
      company,
      year,
      generatedAt: new Date(),
      summary: {
        totalDonations,
        totalMatching,
        totalAmount,
        donationCount,
        uniqueDonorCount: uniqueDonors
      },
      donations,
      departmentBreakdown
    };
    
    if (format === 'csv') {
      // Convert to CSV format
      const csvData = convertToCSV(reportData);
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="donation-report-${year}.csv"`);
      return res.send(csvData);
    }
    
    res.json({
      success: true,
      data: reportData
    });
  } catch (error) {
    console.error('Get company reports error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Helper function to convert report data to CSV
function convertToCSV(data) {
  const headers = [
    'Date',
    'Employee Name',
    'Employee ID',
    'Department',
    'Charity Name',
    'Charity EIN',
    'Donation Amount',
    'Matching Amount',
    'Total Amount'
  ];
  
  const rows = data.donations.map(donation => [
    donation.createdAt.toISOString().split('T')[0],
    `${donation.user.firstName} ${donation.user.lastName}`,
    donation.user.employeeId,
    donation.user.department || '',
    donation.charity.name,
    donation.charity.ein,
    donation.amount,
    donation.matchingAmount,
    donation.totalAmount
  ]);
  
  return [headers, ...rows].map(row => row.join(',')).join('\n');
}

module.exports = router;

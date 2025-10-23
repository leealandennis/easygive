const express = require('express');
const { body, validationResult } = require('express-validator');
const { protect, authorize } = require('../middleware/auth');
const { prisma } = require('../config/database');

const router = express.Router();

// All admin routes require super admin access
router.use(protect);
router.use(authorize('SUPER_ADMIN'));

// @desc    Get system dashboard
// @route   GET /api/admin/dashboard
// @access  Private (Super Admin)
router.get('/dashboard', async (req, res) => {
  try {
    const { year = new Date().getFullYear() } = req.query;
    
    // Get system-wide statistics
    const totalCompanies = await prisma.company.count();
    const activeCompanies = await prisma.company.count({ where: { isActive: true } });
    const totalUsers = await prisma.user.count();
    const activeUsers = await prisma.user.count({ where: { isActive: true } });
    const totalCharities = await prisma.charity.count({ where: { isActive: true } });
    
    // Count verified charities (JSON field filtering)
    const allCharities = await prisma.charity.findMany({ where: { isActive: true } });
    const verifiedCharities = allCharities.filter(c => {
      const verification = c.verification || {};
      return verification.isVerified === true;
    }).length;

    // Get donation statistics for the year
    const startDate = new Date(year, 0, 1);
    const endDate = new Date(year, 11, 31, 23, 59, 59);
    
    const donations = await prisma.donation.findMany({
      where: {
        status: 'COMPLETED',
        createdAt: { gte: startDate, lte: endDate }
      },
      include: {
        company: { select: { name: true, domain: true } },
        charity: { select: { name: true, category: true } }
      }
    });

    // Calculate donation stats
    const totalDonations = donations.reduce((sum, d) => sum + parseFloat(d.amount), 0);
    const totalMatching = donations.reduce((sum, d) => sum + parseFloat(d.matchingAmount), 0);
    const totalAmount = donations.reduce((sum, d) => sum + parseFloat(d.totalAmount), 0);
    const donationCount = donations.length;
    const uniqueDonors = new Set(donations.map(d => d.userId)).size;
    const uniqueCharities = new Set(donations.map(d => d.charityId)).size;

    // Calculate monthly trends
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

    // Calculate top companies
    const companyData = {};
    donations.forEach(d => {
      if (!companyData[d.companyId]) {
        companyData[d.companyId] = {
          companyName: d.company.name,
          companyDomain: d.company.domain,
          totalAmount: 0,
          donationCount: 0,
          uniqueDonors: new Set()
        };
      }
      companyData[d.companyId].totalAmount += parseFloat(d.totalAmount);
      companyData[d.companyId].donationCount += 1;
      companyData[d.companyId].uniqueDonors.add(d.userId);
    });

    const topCompanies = Object.values(companyData).map(c => ({
      companyName: c.companyName,
      companyDomain: c.companyDomain,
      totalAmount: c.totalAmount,
      donationCount: c.donationCount,
      uniqueDonorCount: c.uniqueDonors.size
    })).sort((a, b) => b.totalAmount - a.totalAmount).slice(0, 10);

    // Calculate top charities
    const charityData = {};
    donations.forEach(d => {
      if (!charityData[d.charityId]) {
        charityData[d.charityId] = {
          charityName: d.charity.name,
          charityCategory: d.charity.category,
          totalAmount: 0,
          donationCount: 0,
          uniqueDonors: new Set()
        };
      }
      charityData[d.charityId].totalAmount += parseFloat(d.totalAmount);
      charityData[d.charityId].donationCount += 1;
      charityData[d.charityId].uniqueDonors.add(d.userId);
    });

    const topCharities = Object.values(charityData).map(c => ({
      charityName: c.charityName,
      charityCategory: c.charityCategory,
      totalAmount: c.totalAmount,
      donationCount: c.donationCount,
      uniqueDonorCount: c.uniqueDonors.size
    })).sort((a, b) => b.totalAmount - a.totalAmount).slice(0, 10);

    // Calculate subscription statistics
    const allCompanies = await prisma.company.findMany();
    const subscriptionData = {};
    allCompanies.forEach(c => {
      const plan = (c.subscription || {}).plan || 'unknown';
      if (!subscriptionData[plan]) {
        subscriptionData[plan] = 0;
      }
      subscriptionData[plan] += 1;
    });

    const subscriptionStats = Object.entries(subscriptionData).map(([plan, count]) => ({
      _id: plan,
      count
    }));

    res.json({
      success: true,
      data: {
        overview: {
          totalCompanies,
          activeCompanies,
          totalUsers,
          activeUsers,
          totalCharities,
          verifiedCharities
        },
        donations: {
          totalDonations,
          totalMatching,
          totalAmount,
          donationCount,
          uniqueDonorCount: uniqueDonors,
          uniqueCharityCount: uniqueCharities
        },
        monthlyTrends,
        topCompanies,
        topCharities,
        subscriptionStats
      }
    });
  } catch (error) {
    console.error('Get admin dashboard error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Get all companies with details
// @route   GET /api/admin/companies
// @access  Private (Super Admin)
router.get('/companies', async (req, res) => {
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
    
    // Get additional stats for each company
    const currentYear = new Date().getFullYear();
    const startDate = new Date(currentYear, 0, 1);
    const endDate = new Date(currentYear, 11, 31, 23, 59, 59);

    const companiesWithStats = await Promise.all(
      filteredCompanies.map(async (company) => {
        const userCount = await prisma.user.count({ 
          where: { companyId: company.id, isActive: true } 
        });
        
        const donations = await prisma.donation.findMany({
          where: {
            companyId: company.id,
            status: 'COMPLETED',
            createdAt: { gte: startDate, lte: endDate }
          }
        });

        const donationStats = {
          totalDonations: donations.reduce((sum, d) => sum + parseFloat(d.amount), 0),
          totalMatching: donations.reduce((sum, d) => sum + parseFloat(d.matchingAmount), 0),
          totalAmount: donations.reduce((sum, d) => sum + parseFloat(d.totalAmount), 0),
          donationCount: donations.length,
          uniqueDonorCount: new Set(donations.map(d => d.userId)).size
        };
        
        return {
          ...company,
          userCount,
          donationStats
        };
      })
    );
    
    res.json({
      success: true,
      data: companiesWithStats,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (error) {
    console.error('Get admin companies error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Update company subscription
// @route   PUT /api/admin/companies/:id/subscription
// @access  Private (Super Admin)
router.put('/companies/:id/subscription', [
  body('plan').isIn(['basic', 'premium', 'enterprise']),
  body('status').isIn(['active', 'inactive', 'suspended']),
  body('maxEmployees').optional().isInt({ min: 1 }),
  body('endDate').optional().isISO8601()
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

    const { plan, status, maxEmployees, endDate } = req.body;

    const subscription = company.subscription || {};
    subscription.plan = plan;
    subscription.status = status;
    if (maxEmployees) subscription.maxEmployees = maxEmployees;
    if (endDate) subscription.endDate = new Date(endDate).toISOString();

    const updatedCompany = await prisma.company.update({
      where: { id: req.params.id },
      data: { subscription }
    });

    res.json({
      success: true,
      data: updatedCompany.subscription
    });
  } catch (error) {
    console.error('Update company subscription error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Get system users
// @route   GET /api/admin/users
// @access  Private (Super Admin)
router.get('/users', async (req, res) => {
  try {
    const { page = 1, limit = 10, search, role, company } = req.query;
    
    let where = {};
    
    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } }
      ];
    }
    
    if (role) where.role = role.toUpperCase();
    if (company) where.companyId = company;
    
    const users = await prisma.user.findMany({
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
        isActive: true,
        isVerified: true,
        createdAt: true,
        company: {
          select: {
            name: true,
            domain: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: parseInt(limit),
      skip: (parseInt(page) - 1) * parseInt(limit)
    });
    
    const total = await prisma.user.count({ where });
    
    res.json({
      success: true,
      data: users,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (error) {
    console.error('Get admin users error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Get system charities
// @route   GET /api/admin/charities
// @access  Private (Super Admin)
router.get('/charities', async (req, res) => {
  try {
    const { page = 1, limit = 10, search, category, verified } = req.query;
    
    let where = {};
    
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ];
    }
    
    if (category) where.category = category.toUpperCase();
    
    const charities = await prisma.charity.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: parseInt(limit),
      skip: (parseInt(page) - 1) * parseInt(limit)
    });

    // Filter by verification status if provided (JSON field)
    let filteredCharities = charities;
    if (verified !== undefined) {
      const isVerified = verified === 'true';
      filteredCharities = charities.filter(c => {
        const verification = c.verification || {};
        return verification.isVerified === isVerified;
      });
    }
    
    const total = await prisma.charity.count({ where });
    
    res.json({
      success: true,
      data: filteredCharities,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (error) {
    console.error('Get admin charities error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Get system reports
// @route   GET /api/admin/reports
// @access  Private (Super Admin)
router.get('/reports', async (req, res) => {
  try {
    const { year = new Date().getFullYear(), format = 'json' } = req.query;
    
    const startDate = new Date(year, 0, 1);
    const endDate = new Date(year, 11, 31, 23, 59, 59);
    
    // Get comprehensive system report
    const donations = await prisma.donation.findMany({
      where: {
        status: 'COMPLETED',
        createdAt: { gte: startDate, lte: endDate }
      },
      include: {
        company: {
          select: {
            name: true,
            domain: true
          }
        },
        user: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
            employeeId: true,
            department: true
          }
        },
        charity: {
          select: {
            name: true,
            ein: true,
            category: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    
    // Format donations for report
    const systemReport = donations.map(d => ({
      date: d.createdAt,
      companyName: d.company.name,
      companyDomain: d.company.domain,
      userName: `${d.user.firstName} ${d.user.lastName}`,
      userEmail: d.user.email,
      userEmployeeId: d.user.employeeId,
      userDepartment: d.user.department,
      charityName: d.charity.name,
      charityEin: d.charity.ein,
      charityCategory: d.charity.category,
      donationAmount: parseFloat(d.amount),
      matchingAmount: parseFloat(d.matchingAmount),
      totalAmount: parseFloat(d.totalAmount)
    }));
    
    // Calculate summary statistics
    const totalDonations = donations.reduce((sum, d) => sum + parseFloat(d.amount), 0);
    const totalMatching = donations.reduce((sum, d) => sum + parseFloat(d.matchingAmount), 0);
    const totalAmount = donations.reduce((sum, d) => sum + parseFloat(d.totalAmount), 0);
    const donationCount = donations.length;
    const uniqueDonors = new Set(donations.map(d => d.userId)).size;
    const uniqueCharities = new Set(donations.map(d => d.charityId)).size;
    const uniqueCompanies = new Set(donations.map(d => d.companyId)).size;
    
    const reportData = {
      year: parseInt(year),
      generatedAt: new Date(),
      summary: {
        totalDonations,
        totalMatching,
        totalAmount,
        donationCount,
        uniqueDonorCount: uniqueDonors,
        uniqueCharityCount: uniqueCharities,
        uniqueCompanyCount: uniqueCompanies
      },
      donations: systemReport
    };
    
    if (format === 'csv') {
      // Convert to CSV format
      const csvData = convertSystemReportToCSV(reportData);
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="system-report-${year}.csv"`);
      return res.send(csvData);
    }
    
    res.json({
      success: true,
      data: reportData
    });
  } catch (error) {
    console.error('Get admin reports error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Helper function to convert system report to CSV
function convertSystemReportToCSV(data) {
  const headers = [
    'Date',
    'Company Name',
    'Company Domain',
    'User Name',
    'User Email',
    'Employee ID',
    'Department',
    'Charity Name',
    'Charity EIN',
    'Charity Category',
    'Donation Amount',
    'Matching Amount',
    'Total Amount'
  ];
  
  const rows = data.donations.map(donation => [
    donation.date.toISOString().split('T')[0],
    donation.companyName,
    donation.companyDomain,
    donation.userName,
    donation.userEmail,
    donation.userEmployeeId || '',
    donation.userDepartment || '',
    donation.charityName,
    donation.charityEin,
    donation.charityCategory,
    donation.donationAmount,
    donation.matchingAmount,
    donation.totalAmount
  ]);
  
  return [headers, ...rows].map(row => row.join(',')).join('\n');
}

module.exports = router;

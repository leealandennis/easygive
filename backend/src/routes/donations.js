const express = require('express');
const { body, validationResult } = require('express-validator');
const { protect, authorize, checkUserAccess } = require('../middleware/auth');
const { prisma } = require('../config/database');

const router = express.Router();

// @desc    Get all donations
// @route   GET /api/donations
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      status, 
      type, 
      year,
      charity,
      user
    } = req.query;
    
    let where = {};
    
    // HR admins can see all company donations, employees see only their own
    if (req.user.role === 'EMPLOYEE') {
      where.userId = req.user.id;
    } else if (req.user.role === 'HR_ADMIN') {
      where.companyId = req.user.companyId;
    } else if (req.user.role === 'SUPER_ADMIN') {
      // Super admins can see all donations
    }
    
    // Add filters
    if (status) where.status = status.toUpperCase();
    if (type) where.type = type.toUpperCase();
    if (charity) where.charityId = charity;
    if (user && (req.user.role === 'HR_ADMIN' || req.user.role === 'SUPER_ADMIN')) {
      where.userId = user;
    }
    
    // Add year filter
    if (year) {
      const startDate = new Date(year, 0, 1);
      const endDate = new Date(year, 11, 31, 23, 59, 59);
      where.createdAt = { gte: startDate, lte: endDate };
    }
    
    const donations = await prisma.donation.findMany({
      where,
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
        },
        company: {
          select: {
            name: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: parseInt(limit),
      skip: (parseInt(page) - 1) * parseInt(limit)
    });
    
    const total = await prisma.donation.count({ where });
    
    res.json({
      success: true,
      data: donations,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (error) {
    console.error('Get donations error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Get donation summary for user
// @route   GET /api/donations/summary/user
// @access  Private
router.get('/summary/user', protect, async (req, res) => {
  try {
    const { year = new Date().getFullYear() } = req.query;
    
    const startDate = new Date(year, 0, 1);
    const endDate = new Date(year, 11, 31, 23, 59, 59);
    
    // Get all completed donations for the user in the year
    const donations = await prisma.donation.findMany({
      where: {
        userId: req.user.id,
        status: 'COMPLETED',
        createdAt: {
          gte: startDate,
          lte: endDate
        }
      },
      include: {
        charity: {
          select: {
            id: true,
            name: true,
            category: true
          }
        }
      }
    });

    // Calculate summary
    const totalDonated = donations.reduce((sum, d) => sum + parseFloat(d.amount), 0);
    const totalMatching = donations.reduce((sum, d) => sum + parseFloat(d.matchingAmount), 0);
    const totalAmount = donations.reduce((sum, d) => sum + parseFloat(d.totalAmount), 0);
    const donationCount = donations.length;
    const uniqueCharities = new Set(donations.map(d => d.charityId));
    const uniqueCharityCount = uniqueCharities.size;

    // Calculate monthly breakdown
    const monthlyData = {};
    donations.forEach(d => {
      const month = d.createdAt.getMonth() + 1;
      if (!monthlyData[month]) {
        monthlyData[month] = { totalAmount: 0, donationCount: 0 };
      }
      monthlyData[month].totalAmount += parseFloat(d.totalAmount);
      monthlyData[month].donationCount += 1;
    });

    const monthlyBreakdown = Object.entries(monthlyData).map(([month, data]) => ({
      month: parseInt(month),
      totalAmount: data.totalAmount,
      donationCount: data.donationCount
    })).sort((a, b) => a.month - b.month);

    // Calculate top charities
    const charityData = {};
    donations.forEach(d => {
      if (!charityData[d.charityId]) {
        charityData[d.charityId] = {
          charityId: d.charityId,
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
      .slice(0, 5);

    res.json({
      success: true,
      data: {
        summary: {
          totalDonated,
          totalMatching,
          totalAmount,
          donationCount,
          uniqueCharityCount
        },
        monthlyBreakdown,
        topCharities
      }
    });
  } catch (error) {
    console.error('Get donation summary error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Get donation summary for company (HR Admin only)
// @route   GET /api/donations/summary/company
// @access  Private (HR Admin)
router.get('/summary/company', protect, authorize('HR_ADMIN', 'SUPER_ADMIN'), async (req, res) => {
  try {
    const { year = new Date().getFullYear() } = req.query;
    
    const companyId = req.user.role === 'SUPER_ADMIN' ? req.query.companyId : req.user.companyId;
    
    if (!companyId) {
      return res.status(400).json({
        success: false,
        message: 'Company ID is required'
      });
    }

    const startDate = new Date(year, 0, 1);
    const endDate = new Date(year, 11, 31, 23, 59, 59);

    // Get all completed donations for the company in the year
    const donations = await prisma.donation.findMany({
      where: {
        companyId: companyId,
        status: 'COMPLETED',
        createdAt: {
          gte: startDate,
          lte: endDate
        }
      }
    });

    // Calculate summary
    const totalDonations = donations.reduce((sum, d) => sum + parseFloat(d.amount), 0);
    const totalMatching = donations.reduce((sum, d) => sum + parseFloat(d.matchingAmount), 0);
    const totalAmount = donations.reduce((sum, d) => sum + parseFloat(d.totalAmount), 0);
    const donationCount = donations.length;
    const uniqueDonors = new Set(donations.map(d => d.userId));
    const uniqueDonorCount = uniqueDonors.size;

    res.json({
      success: true,
      data: {
        totalDonations,
        totalMatching,
        totalAmount,
        donationCount,
        uniqueDonorCount
      }
    });
  } catch (error) {
    console.error('Get company donation summary error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Get single donation
// @route   GET /api/donations/:id
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const donation = await prisma.donation.findUnique({
      where: { id: req.params.id },
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
        },
        company: {
          select: {
            name: true
          }
        }
      }
    });
    
    if (!donation) {
      return res.status(404).json({
        success: false,
        message: 'Donation not found'
      });
    }
    
    // Check access permissions
    if (req.user.role === 'EMPLOYEE' && donation.userId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this donation'
      });
    }
    
    if (req.user.role === 'HR_ADMIN' && donation.companyId !== req.user.companyId) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this donation'
      });
    }
    
    res.json({
      success: true,
      data: donation
    });
  } catch (error) {
    console.error('Get donation error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Create new donation
// @route   POST /api/donations
// @access  Private
router.post('/', protect, [
  body('charityId').isString().notEmpty(),
  body('amount').isFloat({ min: 0.01 }),
  body('type').isIn(['ONE_TIME', 'RECURRING']),
  body('frequency').optional().isIn(['WEEKLY', 'BIWEEKLY', 'MONTHLY', 'QUARTERLY', 'ANNUALLY']),
  body('paymentMethod').isIn(['PAYROLL_DEDUCTION', 'DIRECT_PAYMENT']),
  body('payrollInfo.deductionType').optional().isIn(['percentage', 'fixed_amount']),
  body('payrollInfo.deductionValue').optional().isFloat({ min: 0.01 }),
  body('notes').optional().trim().isLength({ max: 500 })
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

    const { 
      charityId, 
      amount, 
      type, 
      frequency, 
      paymentMethod, 
      payrollInfo, 
      notes,
      isAnonymous = false 
    } = req.body;

    // Validate charity exists
    const charity = await prisma.charity.findUnique({
      where: { id: charityId }
    });
    
    if (!charity || !charity.isActive) {
      return res.status(400).json({
        success: false,
        message: 'Charity not found or inactive'
      });
    }

    // Validate recurring donation requirements
    if (type === 'RECURRING' && !frequency) {
      return res.status(400).json({
        success: false,
        message: 'Frequency is required for recurring donations'
      });
    }

    // Validate payroll deduction requirements
    if (paymentMethod === 'PAYROLL_DEDUCTION' && (!payrollInfo || !payrollInfo.deductionType || !payrollInfo.deductionValue)) {
      return res.status(400).json({
        success: false,
        message: 'Payroll deduction information is required'
      });
    }

    // Get company and calculate matching
    const company = await prisma.company.findUnique({
      where: { id: req.user.companyId }
    });
    
    if (!company) {
      return res.status(400).json({
        success: false,
        message: 'Company not found'
      });
    }

    // Calculate matching amount
    let matchingAmount = 0;
    if (company.matchingProgram && company.matchingProgram.enabled) {
      const matchingRate = company.matchingProgram.matchRate || 0;
      const maxMatch = company.matchingProgram.maxMatchPerEmployee || Infinity;
      matchingAmount = Math.min(amount * matchingRate, maxMatch);
    }

    const totalAmount = parseFloat(amount) + parseFloat(matchingAmount);

    // Determine initial status
    const requiresApproval = company.settings && company.settings.requireApprovalForDonations;
    const initialStatus = requiresApproval ? 'PENDING' : 'APPROVED';

    // Create donation
    const donation = await prisma.donation.create({
      data: {
        userId: req.user.id,
        companyId: req.user.companyId,
        charityId: charityId,
        amount: amount,
        matchingAmount: matchingAmount,
        totalAmount: totalAmount,
        type: type,
        frequency: frequency || null,
        paymentMethod: paymentMethod,
        payrollInfo: payrollInfo || {},
        notes: notes || null,
        isAnonymous: isAnonymous,
        status: initialStatus,
        processingInfo: {},
        taxInfo: {}
      },
      include: {
        charity: {
          select: {
            name: true,
            category: true,
            ein: true
          }
        },
        user: {
          select: {
            firstName: true,
            lastName: true,
            employeeId: true
          }
        }
      }
    });

    // Update user gamification
    if (initialStatus !== 'PENDING') {
      const currentGamification = req.user.gamification || {};
      await prisma.user.update({
        where: { id: req.user.id },
        data: {
          gamification: {
            ...currentGamification,
            totalPoints: (currentGamification.totalPoints || 0) + Math.floor(amount),
            totalDonated: (currentGamification.totalDonated || 0) + parseFloat(amount)
          }
        }
      });
    }

    // Update charity statistics
    await prisma.charity.update({
      where: { id: charityId },
      data: {
        totalDonations: {
          increment: totalAmount
        },
        totalDonors: {
          increment: 1
        }
      }
    });

    res.status(201).json({
      success: true,
      data: donation
    });
  } catch (error) {
    console.error('Create donation error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Update donation status (HR Admin only)
// @route   PUT /api/donations/:id/status
// @access  Private (HR Admin)
router.put('/:id/status', protect, authorize('HR_ADMIN', 'SUPER_ADMIN'), [
  body('status').isIn(['PENDING', 'APPROVED', 'PROCESSING', 'COMPLETED', 'FAILED', 'CANCELLED']),
  body('failureReason').optional().trim()
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

    const donation = await prisma.donation.findUnique({
      where: { id: req.params.id }
    });
    
    if (!donation) {
      return res.status(404).json({
        success: false,
        message: 'Donation not found'
      });
    }

    // Check company access
    if (req.user.role === 'HR_ADMIN' && donation.companyId !== req.user.companyId) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this donation'
      });
    }

    const { status, failureReason } = req.body;

    const updatedDonation = await prisma.donation.update({
      where: { id: req.params.id },
      data: {
        status: status,
        processingInfo: {
          ...donation.processingInfo,
          lastStatusUpdate: new Date().toISOString(),
          failureReason: failureReason || null
        }
      }
    });

    res.json({
      success: true,
      data: updatedDonation
    });
  } catch (error) {
    console.error('Update donation status error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Cancel donation
// @route   PUT /api/donations/:id/cancel
// @access  Private
router.put('/:id/cancel', protect, async (req, res) => {
  try {
    const donation = await prisma.donation.findUnique({
      where: { id: req.params.id }
    });
    
    if (!donation) {
      return res.status(404).json({
        success: false,
        message: 'Donation not found'
      });
    }

    // Check access permissions
    if (req.user.role === 'EMPLOYEE' && donation.userId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to cancel this donation'
      });
    }

    if (req.user.role === 'HR_ADMIN' && donation.companyId !== req.user.companyId) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to cancel this donation'
      });
    }

    // Only allow cancellation of pending or approved donations
    if (!['PENDING', 'APPROVED'].includes(donation.status)) {
      return res.status(400).json({
        success: false,
        message: 'Cannot cancel donation with current status'
      });
    }

    const updatedDonation = await prisma.donation.update({
      where: { id: req.params.id },
      data: {
        status: 'CANCELLED',
        processingInfo: {
          ...donation.processingInfo,
          cancelledAt: new Date().toISOString()
        }
      }
    });

    res.json({
      success: true,
      message: 'Donation cancelled successfully',
      data: updatedDonation
    });
  } catch (error) {
    console.error('Cancel donation error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

module.exports = router;

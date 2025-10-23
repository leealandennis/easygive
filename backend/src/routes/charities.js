const express = require('express');
const { body, validationResult } = require('express-validator');
const { protect, authorize, optionalAuth } = require('../middleware/auth');
const { prisma } = require('../config/database');

const router = express.Router();

// @desc    Get all charities
// @route   GET /api/charities
// @access  Public
router.get('/', optionalAuth, async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 20, 
      search, 
      category, 
      verified, 
      featured,
      sortBy = 'name',
      sortOrder = 'asc'
    } = req.query;
    
    let where = { isActive: true };
    
    // Add search filter (simple search on name and description)
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ];
    }
    
    // Add category filter
    if (category) {
      where.category = category.toUpperCase();
    }
    
    // Add verification filter
    if (verified === 'true') {
      where.verification = {
        path: ['isVerified'],
        equals: true
      };
    }
    
    // Add featured filter
    if (featured === 'true') {
      where.isFeatured = true;
    }
    
    // Build sort object
    let orderBy = {};
    if (sortBy === 'name') {
      orderBy.name = sortOrder === 'desc' ? 'desc' : 'asc';
    } else if (sortBy === 'totalDonations') {
      orderBy.totalDonations = sortOrder === 'desc' ? 'desc' : 'asc';
    } else {
      orderBy.createdAt = 'desc';
    }
    
    const charities = await prisma.charity.findMany({
      where,
      orderBy,
      take: parseInt(limit),
      skip: (parseInt(page) - 1) * parseInt(limit)
    });
    
    const total = await prisma.charity.count({ where });
    
    res.json({
      success: true,
      data: charities,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (error) {
    console.error('Get charities error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Get featured charities
// @route   GET /api/charities/featured
// @access  Public
router.get('/featured', optionalAuth, async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    
    const charities = await prisma.charity.findMany({
      where: {
        isActive: true,
        isFeatured: true
      },
      orderBy: {
        totalDonations: 'desc'
      },
      take: parseInt(limit)
    });
    
    res.json({
      success: true,
      data: charities
    });
  } catch (error) {
    console.error('Get featured charities error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Get charities by category
// @route   GET /api/charities/category/:category
// @access  Public
router.get('/category/:category', optionalAuth, async (req, res) => {
  try {
    const { category } = req.params;
    const { limit = 20 } = req.query;
    
    const charities = await prisma.charity.findMany({
      where: {
        isActive: true,
        category: category.toUpperCase()
      },
      orderBy: {
        totalDonations: 'desc'
      },
      take: parseInt(limit)
    });
    
    res.json({
      success: true,
      data: charities
    });
  } catch (error) {
    console.error('Get charities by category error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Search charities
// @route   GET /api/charities/search
// @access  Public
router.get('/search', optionalAuth, async (req, res) => {
  try {
    const { q, category, limit = 10 } = req.query;
    
    if (!q) {
      return res.status(400).json({
        success: false,
        message: 'Search query is required'
      });
    }
    
    const where = {
      isActive: true,
      OR: [
        { name: { contains: q, mode: 'insensitive' } },
        { description: { contains: q, mode: 'insensitive' } }
      ]
    };
    
    if (category) {
      where.category = category.toUpperCase();
    }
    
    const charities = await prisma.charity.findMany({
      where,
      orderBy: {
        totalDonations: 'desc'
      },
      take: parseInt(limit)
    });
    
    res.json({
      success: true,
      data: charities
    });
  } catch (error) {
    console.error('Search charities error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Get charity categories
// @route   GET /api/charities/categories
// @access  Public
router.get('/categories', async (req, res) => {
  try {
    const categories = [
      { value: 'ENVIRONMENT', label: 'Environment' },
      { value: 'EDUCATION', label: 'Education' },
      { value: 'HEALTH', label: 'Health' },
      { value: 'ANIMALS', label: 'Animals' },
      { value: 'HUMAN_SERVICES', label: 'Human Services' },
      { value: 'INTERNATIONAL', label: 'International' },
      { value: 'ARTS_CULTURE', label: 'Arts & Culture' },
      { value: 'RELIGION', label: 'Religion' },
      { value: 'OTHER', label: 'Other' }
    ];
    
    res.json({
      success: true,
      data: categories
    });
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Get single charity
// @route   GET /api/charities/:id
// @access  Public
router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const charity = await prisma.charity.findUnique({
      where: { id: req.params.id }
    });
    
    if (!charity || !charity.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Charity not found'
      });
    }
    
    res.json({
      success: true,
      data: charity
    });
  } catch (error) {
    console.error('Get charity error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Get charity statistics
// @route   GET /api/charities/:id/stats
// @access  Public
router.get('/:id/stats', optionalAuth, async (req, res) => {
  try {
    const { year = new Date().getFullYear() } = req.query;
    
    const charity = await prisma.charity.findUnique({
      where: { id: req.params.id }
    });
    
    if (!charity) {
      return res.status(404).json({
        success: false,
        message: 'Charity not found'
      });
    }
    
    // Get donation summary for the year
    const yearStart = new Date(year, 0, 1);
    const yearEnd = new Date(parseInt(year) + 1, 0, 1);
    
    const donations = await prisma.donation.findMany({
      where: {
        charityId: req.params.id,
        status: 'COMPLETED',
        createdAt: {
          gte: yearStart,
          lt: yearEnd
        }
      }
    });
    
    const totalAmount = donations.reduce((sum, d) => sum + parseFloat(d.totalAmount), 0);
    const donationCount = donations.length;
    const uniqueDonors = new Set(donations.map(d => d.userId)).size;
    
    res.json({
      success: true,
      data: {
        charity: {
          name: charity.name,
          category: charity.category,
          totalDonations: parseFloat(charity.totalDonations),
          totalDonors: charity.totalDonors
        },
        yearlySummary: {
          totalAmount,
          donationCount,
          uniqueDonorCount: uniqueDonors
        }
      }
    });
  } catch (error) {
    console.error('Get charity stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Create new charity (Admin only)
// @route   POST /api/charities
// @access  Private (Super Admin)
router.post('/', protect, authorize('SUPER_ADMIN'), [
  body('name').trim().isLength({ min: 1 }),
  body('ein').trim().isLength({ min: 1 }),
  body('description').trim().isLength({ min: 1 }),
  body('category').isIn([
    'ENVIRONMENT', 'EDUCATION', 'HEALTH', 'ANIMALS', 
    'HUMAN_SERVICES', 'INTERNATIONAL', 'ARTS_CULTURE', 'RELIGION', 'OTHER'
  ]),
  body('address.street').trim().isLength({ min: 1 }),
  body('address.city').trim().isLength({ min: 1 }),
  body('address.state').trim().isLength({ min: 1 }),
  body('address.zipCode').trim().isLength({ min: 1 })
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

    const charity = await prisma.charity.create({
      data: {
        name: req.body.name,
        ein: req.body.ein,
        description: req.body.description,
        category: req.body.category,
        subcategory: req.body.subcategory || null,
        website: req.body.website || null,
        address: req.body.address,
        contactInfo: req.body.contactInfo || null,
        verification: req.body.verification || {},
        images: req.body.images || null,
        impact: req.body.impact || null,
        donationInfo: req.body.donationInfo || {},
        isFeatured: req.body.isFeatured || false
      }
    });

    res.status(201).json({
      success: true,
      data: charity
    });
  } catch (error) {
    console.error('Create charity error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Update charity (Admin only)
// @route   PUT /api/charities/:id
// @access  Private (Super Admin)
router.put('/:id', protect, authorize('SUPER_ADMIN'), [
  body('name').optional().trim().isLength({ min: 1 }),
  body('description').optional().trim().isLength({ min: 1 }),
  body('category').optional().isIn([
    'ENVIRONMENT', 'EDUCATION', 'HEALTH', 'ANIMALS', 
    'HUMAN_SERVICES', 'INTERNATIONAL', 'ARTS_CULTURE', 'RELIGION', 'OTHER'
  ])
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

    const charity = await prisma.charity.findUnique({
      where: { id: req.params.id }
    });
    
    if (!charity) {
      return res.status(404).json({
        success: false,
        message: 'Charity not found'
      });
    }

    // Build update data
    const updateData = {};
    const allowedFields = [
      'name', 'description', 'category', 'subcategory', 'website', 
      'address', 'contactInfo', 'images', 'impact', 'donationInfo', 'isFeatured'
    ];
    
    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        updateData[field] = req.body[field];
      }
    });

    const updatedCharity = await prisma.charity.update({
      where: { id: req.params.id },
      data: updateData
    });

    res.json({
      success: true,
      data: updatedCharity
    });
  } catch (error) {
    console.error('Update charity error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Verify charity (Admin only)
// @route   PUT /api/charities/:id/verify
// @access  Private (Super Admin)
router.put('/:id/verify', protect, authorize('SUPER_ADMIN'), [
  body('isVerified').isBoolean(),
  body('verifiedBy').optional().isIn(['charity_navigator', 'every_org', 'manual']),
  body('rating').optional().isFloat({ min: 0, max: 5 }),
  body('financialScore').optional().isFloat({ min: 0, max: 100 }),
  body('accountabilityScore').optional().isFloat({ min: 0, max: 100 })
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

    const charity = await prisma.charity.findUnique({
      where: { id: req.params.id }
    });
    
    if (!charity) {
      return res.status(404).json({
        success: false,
        message: 'Charity not found'
      });
    }

    const { isVerified, verifiedBy, rating, financialScore, accountabilityScore } = req.body;

    const verification = charity.verification || {};
    verification.isVerified = isVerified;
    if (verifiedBy) verification.verifiedBy = verifiedBy;
    if (rating !== undefined) verification.rating = rating;
    if (financialScore !== undefined) verification.financialScore = financialScore;
    if (accountabilityScore !== undefined) verification.accountabilityScore = accountabilityScore;
    if (isVerified) verification.verifiedAt = new Date().toISOString();

    const updatedCharity = await prisma.charity.update({
      where: { id: req.params.id },
      data: { verification }
    });

    res.json({
      success: true,
      data: updatedCharity.verification
    });
  } catch (error) {
    console.error('Verify charity error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

module.exports = router;

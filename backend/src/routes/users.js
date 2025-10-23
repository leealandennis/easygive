const express = require('express');
const { body, validationResult } = require('express-validator');
const { protect, authorize, checkUserAccess } = require('../middleware/auth');
const { prisma } = require('../config/database');
const bcrypt = require('bcryptjs');

const router = express.Router();

// @desc    Get all users (HR Admin only)
// @route   GET /api/users
// @access  Private (HR Admin)
router.get('/', protect, authorize('HR_ADMIN', 'SUPER_ADMIN'), async (req, res) => {
  try {
    const { page = 1, limit = 10, search, department, role } = req.query;
    
    let where = { companyId: req.user.companyId };
    
    // Add search filter
    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { employeeId: { contains: search, mode: 'insensitive' } }
      ];
    }
    
    // Add department filter
    if (department) {
      where.department = department;
    }
    
    // Add role filter
    if (role) {
      where.role = role.toUpperCase();
    }
    
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
        phone: true,
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
    console.error('Get users error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Get company leaderboard (optional auth for public view)
// @route   GET /api/users/leaderboard
// @access  Public (with optional auth)
router.get('/leaderboard', async (req, res) => {
  try {
    const { companyId, limit = 10, year } = req.query;
    
    if (!companyId) {
      return res.status(400).json({
        success: false,
        message: 'Company ID is required'
      });
    }
    
    // Get users from company who opted in to leaderboard
    const users = await prisma.user.findMany({
      where: {
        companyId: companyId,
        isActive: true
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        gamification: true,
        preferences: true
      }
    });
    
    // Filter users who opted in to leaderboard and sort by totalDonated
    const leaderboardUsers = users
      .filter(user => {
        const prefs = user.preferences || {};
        const privacy = prefs.privacy || {};
        return privacy.showOnLeaderboard === true;
      })
      .sort((a, b) => {
        const aTotal = (a.gamification || {}).totalDonated || 0;
        const bTotal = (b.gamification || {}).totalDonated || 0;
        return bTotal - aTotal;
      })
      .slice(0, parseInt(limit));
    
    // Anonymize data if user doesn't want to share
    const anonymizedLeaderboard = leaderboardUsers.map((user, index) => {
      const prefs = user.preferences || {};
      const privacy = prefs.privacy || {};
      const gamification = user.gamification || {};
      
      return {
        rank: index + 1,
        name: privacy.shareDonationHistory 
          ? `${user.firstName} ${user.lastName}` 
          : 'Anonymous',
        totalDonated: gamification.totalDonated || 0,
        level: gamification.level || 1,
        badges: (gamification.badges || []).length
      };
    });
    
    res.json({
      success: true,
      data: anonymizedLeaderboard
    });
  } catch (error) {
    console.error('Get leaderboard error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Get single user
// @route   GET /api/users/:id
// @access  Private
router.get('/:id', protect, checkUserAccess, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.params.id },
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
        address: true,
        preferences: true,
        gamification: true,
        isActive: true,
        isVerified: true,
        lastLogin: true,
        createdAt: true,
        company: {
          select: {
            name: true,
            domain: true,
            matchingProgram: true
          }
        }
      }
    });
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Create new user (HR Admin only)
// @route   POST /api/users
// @access  Private (HR Admin)
router.post('/', protect, authorize('HR_ADMIN', 'SUPER_ADMIN'), [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 }),
  body('firstName').trim().isLength({ min: 1 }),
  body('lastName').trim().isLength({ min: 1 }),
  body('employeeId').trim().isLength({ min: 1 }),
  body('role').isIn(['EMPLOYEE', 'HR_ADMIN'])
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

    const { email, password, firstName, lastName, employeeId, role, department, position } = req.body;

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({ 
      where: { email } 
    });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User already exists with this email'
      });
    }

    // Check if employee ID is already taken
    const existingEmployee = await prisma.user.findFirst({ 
      where: { 
        companyId: req.user.companyId, 
        employeeId: employeeId 
      }
    });
    if (existingEmployee) {
      return res.status(400).json({
        success: false,
        message: 'Employee ID already exists'
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        firstName,
        lastName,
        employeeId,
        role,
        department: department || null,
        position: position || null,
        companyId: req.user.companyId
      }
    });

    res.status(201).json({
      success: true,
      data: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        employeeId: user.employeeId,
        role: user.role,
        department: user.department,
        position: user.position
      }
    });
  } catch (error) {
    console.error('Create user error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Update user
// @route   PUT /api/users/:id
// @access  Private
router.put('/:id', protect, checkUserAccess, [
  body('firstName').optional().trim().isLength({ min: 1 }),
  body('lastName').optional().trim().isLength({ min: 1 }),
  body('department').optional().trim(),
  body('position').optional().trim(),
  body('phone').optional().trim(),
  body('role').optional().isIn(['EMPLOYEE', 'HR_ADMIN'])
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

    const user = await prisma.user.findUnique({
      where: { id: req.params.id }
    });
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const { firstName, lastName, department, position, phone, role } = req.body;

    const updateData = {};
    if (firstName) updateData.firstName = firstName;
    if (lastName) updateData.lastName = lastName;
    if (department) updateData.department = department;
    if (position) updateData.position = position;
    if (phone) updateData.phone = phone;
    
    // Only HR admins can change roles
    if (role && (req.user.role === 'HR_ADMIN' || req.user.role === 'SUPER_ADMIN')) {
      updateData.role = role;
    }

    const updatedUser = await prisma.user.update({
      where: { id: req.params.id },
      data: updateData
    });

    res.json({
      success: true,
      data: {
        id: updatedUser.id,
        email: updatedUser.email,
        firstName: updatedUser.firstName,
        lastName: updatedUser.lastName,
        employeeId: updatedUser.employeeId,
        role: updatedUser.role,
        department: updatedUser.department,
        position: updatedUser.position,
        phone: updatedUser.phone
      }
    });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Delete user (HR Admin only)
// @route   DELETE /api/users/:id
// @access  Private (HR Admin)
router.delete('/:id', protect, authorize('HR_ADMIN', 'SUPER_ADMIN'), async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.params.id }
    });
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Don't allow deleting super admins
    if (user.role === 'SUPER_ADMIN') {
      return res.status(403).json({
        success: false,
        message: 'Cannot delete super admin user'
      });
    }

    // Soft delete - set isActive to false
    await prisma.user.update({
      where: { id: req.params.id },
      data: { isActive: false }
    });

    res.json({
      success: true,
      message: 'User deactivated successfully'
    });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Get user's donation history
// @route   GET /api/users/:id/donations
// @access  Private
router.get('/:id/donations', protect, checkUserAccess, async (req, res) => {
  try {
    const { page = 1, limit = 10, year } = req.query;
    
    let where = { userId: req.params.id };
    
    if (year) {
      const startDate = new Date(year, 0, 1);
      const endDate = new Date(year, 11, 31, 23, 59, 59);
      where.createdAt = { gte: startDate, lte: endDate };
    }
    
    const donations = await prisma.donation.findMany({
      where,
      include: {
        charity: {
          select: {
            name: true,
            category: true,
            ein: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: parseInt(limit),
      skip: (parseInt(page) - 1) * parseInt(limit)
    });
    
    const total = await prisma.donation.count({ where });
    
    // Calculate summary
    const allDonations = await prisma.donation.findMany({ where });
    const summary = {
      totalDonated: allDonations.reduce((sum, d) => sum + parseFloat(d.amount), 0),
      totalMatching: allDonations.reduce((sum, d) => sum + parseFloat(d.matchingAmount), 0),
      totalAmount: allDonations.reduce((sum, d) => sum + parseFloat(d.totalAmount), 0),
      donationCount: allDonations.length
    };
    
    res.json({
      success: true,
      data: donations,
      summary,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (error) {
    console.error('Get user donations error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Update user preferences
// @route   PUT /api/users/:id/preferences
// @access  Private
router.put('/:id/preferences', protect, checkUserAccess, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.params.id }
    });
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const { notifications, charityCategories, privacy } = req.body;

    const currentPreferences = user.preferences || {};
    const updatedPreferences = { ...currentPreferences };

    if (notifications) {
      updatedPreferences.notifications = { 
        ...(currentPreferences.notifications || {}), 
        ...notifications 
      };
    }
    
    if (charityCategories) {
      updatedPreferences.charityCategories = charityCategories;
    }
    
    if (privacy) {
      updatedPreferences.privacy = { 
        ...(currentPreferences.privacy || {}), 
        ...privacy 
      };
    }

    const updatedUser = await prisma.user.update({
      where: { id: req.params.id },
      data: { preferences: updatedPreferences }
    });

    res.json({
      success: true,
      message: 'Preferences updated successfully',
      data: updatedUser.preferences
    });
  } catch (error) {
    console.error('Update preferences error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

module.exports = router;

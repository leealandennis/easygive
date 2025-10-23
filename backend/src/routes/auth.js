const express = require('express');
const { body, validationResult } = require('express-validator');
const { PrismaClient } = require('@prisma/client');
const { protect, authorize } = require('../middleware/auth');

const prisma = new PrismaClient();

const router = express.Router();

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
router.post('/register', [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 }),
  body('firstName').trim().isLength({ min: 1 }),
  body('lastName').trim().isLength({ min: 1 }),
  body('companyDomain').trim().isLength({ min: 1 }),
  body('employeeId').optional().trim(),
  body('role').optional().isIn(['employee', 'hr_admin'])
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { email, password, firstName, lastName, companyDomain, employeeId, role = 'employee' } = req.body;

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

    // Find company by domain
    const company = await prisma.company.findUnique({ 
      where: { emailDomain: companyDomain.toLowerCase() } 
    });
    if (!company) {
      return res.status(400).json({
        success: false,
        message: 'Company not found with this domain'
      });
    }

    // Check if employee ID is already taken in this company
    if (employeeId) {
      const existingEmployee = await prisma.user.findFirst({ 
        where: { 
          companyId: company.id, 
          employeeId: employeeId 
        }
      });
      if (existingEmployee) {
        return res.status(400).json({
          success: false,
          message: 'Employee ID already exists in this company'
        });
      }
    }

    // Hash password
    const bcrypt = require('bcryptjs');
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        firstName,
        lastName,
        companyId: company.id,
        employeeId,
        role: role.toUpperCase()
      }
    });

    // Generate JWT token
    const jwt = require('jsonwebtoken');
    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE }
    );

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        company: {
          id: company.id,
          name: company.name,
          domain: company.emailDomain
        }
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during registration'
    });
  }
});

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
router.post('/login', [
  // Accept either email or username (alias for email)
  body('email').optional().isEmail().withMessage('Valid email is required').bail().normalizeEmail(),
  body('username').optional().isEmail().withMessage('Valid email is required').bail().normalizeEmail(),
  body('password').exists().withMessage('Password is required')
], async (req, res) => {
  try {
    // Check for validation errors, but allow either email or username
    let errors = validationResult(req);
    let errorList = errors.array();
    const hasEmail = !!req.body.email;
    const hasUsername = !!req.body.username;
    if (!hasEmail && !hasUsername) {
      errorList = [...errorList, { param: 'email', msg: 'Email (or username) is required' }];
    }
    if (!req.body.password) {
      errorList = [...errorList, { param: 'password', msg: 'Password is required' }];
    }
    if (errorList.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errorList
      });
    }

    const email = (req.body.email || req.body.username).toLowerCase();
    const { password } = req.body;

    // Check for user
    const user = await prisma.user.findUnique({ 
      where: { email },
      include: { company: true }
    });
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Account is inactive'
      });
    }

    // Check if company is active
    if (!user.company.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Company account is inactive'
      });
    }

    // Check password
    const bcrypt = require('bcryptjs');
    const isMatch = await bcrypt.compare(password, user.password);
    
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Update last login
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLogin: new Date() }
    });

    // Generate JWT token
    const jwt = require('jsonwebtoken');
    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE }
    );

    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        company: {
          id: user.company.id,
          name: user.company.name,
          domain: user.company.emailDomain
        },
        preferences: user.preferences,
        gamification: user.gamification
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during login'
    });
  }
});

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
router.get('/me', protect, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: { company: true }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          employeeId: user.employeeId,
          department: user.department,
          position: user.position,
          company: user.company,
          preferences: user.preferences,
          gamification: user.gamification,
          isActive: user.isActive,
          lastLogin: user.lastLogin,
          createdAt: user.createdAt
        }
      }
    });
  } catch (error) {
    console.error('Get current user error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
router.put('/profile', protect, [
  body('firstName').optional().trim().isLength({ min: 1 }),
  body('lastName').optional().trim().isLength({ min: 1 }),
  body('phone').optional().trim(),
  body('department').optional().trim(),
  body('position').optional().trim()
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

    const { firstName, lastName, phone, department, position } = req.body;
    
    const updateData = {};
    if (firstName) updateData.firstName = firstName;
    if (lastName) updateData.lastName = lastName;
    if (phone) updateData.phone = phone;
    if (department) updateData.department = department;
    if (position) updateData.position = position;

    const user = await prisma.user.update({
      where: { id: req.user.id },
      data: updateData
    });

    res.json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone,
        department: user.department,
        position: user.position
      }
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Change password
// @route   PUT /api/auth/password
// @access  Private
router.put('/password', protect, [
  body('currentPassword').exists(),
  body('newPassword').isLength({ min: 6 })
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

    const { currentPassword, newPassword } = req.body;

    const user = await prisma.user.findUnique({
      where: { id: req.user.id }
    });

    // Check current password
    const bcrypt = require('bcryptjs');
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 12);
    
    await prisma.user.update({
      where: { id: req.user.id },
      data: { password: hashedPassword }
    });

    res.json({
      success: true,
      message: 'Password updated successfully'
    });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Logout user (client-side token removal)
// @route   POST /api/auth/logout
// @access  Private
router.post('/logout', protect, (req, res) => {
  res.json({
    success: true,
    message: 'Logged out successfully'
  });
});

module.exports = router;

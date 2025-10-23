const express = require('express');
const { body, validationResult } = require('express-validator');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Helpers
const { PDFDocument } = require('pdf-lib');

const generateScheduleAPdf = async (taxRecord) => {
  const doc = await PDFDocument.create();
  const page = doc.addPage([612, 792]);
  const { height } = page.getSize();
  page.drawText('Schedule A - Itemized Deductions', { x: 50, y: height - 50, size: 16 });
  page.drawText(`Tax Year: ${taxRecord.taxYear}`, { x: 50, y: height - 80, size: 12 });
  page.drawText(`Total Charitable Contributions: $${Number(taxRecord.summary.totalTaxDeductible || 0).toFixed(2)}`, { x: 50, y: height - 110, size: 12 });
  let yPosition = height - 140;
  (taxRecord.donations || []).forEach((d) => {
    if (yPosition < 80) {
      doc.addPage([612, 792]);
      yPosition = 742;
    }
    page.drawText(`${d.charityName} (${d.charityEin})`, { x: 50, y: yPosition, size: 10 });
    page.drawText(`$${Number(d.amount).toFixed(2)} - ${new Date(d.date).toLocaleDateString()}`, { x: 300, y: yPosition, size: 10 });
    yPosition -= 20;
  });
  return await doc.save();
};

const generateReceiptPdf = async (taxRecord) => {
  const doc = await PDFDocument.create();
  const page = doc.addPage([612, 792]);
  const { height } = page.getSize();
  page.drawText('Charitable Donation Receipt', { x: 50, y: height - 50, size: 16 });
  page.drawText(`Tax Year: ${taxRecord.taxYear}`, { x: 50, y: height - 80, size: 12 });
  page.drawText(`Total Donations: $${Number(taxRecord.summary.totalDonations || 0).toFixed(2)}`, { x: 50, y: height - 110, size: 12 });
  page.drawText(`Tax Deductible Amount: $${Number(taxRecord.summary.totalTaxDeductible || 0).toFixed(2)}`, { x: 50, y: height - 140, size: 12 });
  return await doc.save();
};

const generateSummaryPdf = async (taxRecord) => {
  const doc = await PDFDocument.create();
  const page = doc.addPage([612, 792]);
  const { height } = page.getSize();
  page.drawText('Donation Summary', { x: 50, y: height - 50, size: 16 });
  page.drawText(`Tax Year: ${taxRecord.taxYear}`, { x: 50, y: height - 80, size: 12 });
  page.drawText(`Total Donations: $${Number(taxRecord.summary.totalDonations || 0).toFixed(2)}`, { x: 50, y: height - 110, size: 12 });
  page.drawText(`Number of Donations: ${taxRecord.summary.donationCount || 0}`, { x: 50, y: height - 140, size: 12 });
  page.drawText(`Unique Charities: ${taxRecord.summary.uniqueCharities || 0}`, { x: 50, y: height - 170, size: 12 });
  return await doc.save();
};

// Generate single donation receipt
const generateDonationReceiptPdf = async (donation) => {
  const doc = await PDFDocument.create();
  const page = doc.addPage([612, 792]);
  const { height } = page.getSize();
  page.drawText('Charitable Donation Receipt', { x: 50, y: height - 50, size: 16 });
  page.drawText(`Date: ${new Date(donation.createdAt).toLocaleDateString()}`, { x: 50, y: height - 80, size: 12 });
  page.drawText(`Charity: ${donation.charity?.name || 'Unknown'}`, { x: 50, y: height - 110, size: 12 });
  if (donation.charity?.ein) {
    page.drawText(`EIN: ${donation.charity.ein}`, { x: 50, y: height - 130, size: 12 });
  }
  page.drawText(`Amount: $${Number(donation.amount).toFixed(2)}`, { x: 50, y: height - 160, size: 12 });
  const deductible = donation.taxInfo?.taxDeductible !== false;
  page.drawText(`Tax Deductible: ${deductible ? 'Yes' : 'No'}`, { x: 50, y: height - 190, size: 12 });
  page.drawText(`Donation ID: ${donation.id}`, { x: 50, y: height - 220, size: 10 });
  return await doc.save();
};

// Compute summary from donations array
const computeSummary = (donations) => {
  const totalDonations = donations.reduce((sum, d) => sum + Number(d.amount), 0);
  const totalTaxDeductible = donations.filter(d => d.isTaxDeductible).reduce((sum, d) => sum + Number(d.amount), 0);
  const donationCount = donations.length;
  const uniqueCharities = new Set(donations.map(d => d.charityEin)).size;
  return { totalDonations, totalTaxDeductible, donationCount, uniqueCharities };
};

// @desc    Get user's tax records
// @route   GET /api/tax/records
// @access  Private
router.get('/records', protect, async (req, res) => {
  try {
    const { year } = req.query;
    const where = { userId: req.user.id };
    if (year) where.taxYear = parseInt(year);
    const records = await global.prisma.taxRecord.findMany({ where, orderBy: { taxYear: 'desc' } });
    res.json({ success: true, data: records });
  } catch (error) {
    console.error('Get tax records error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @desc    Get single tax record
// @route   GET /api/tax/records/:id
// @access  Private
router.get('/records/:id', protect, async (req, res) => {
  try {
    const record = await global.prisma.taxRecord.findUnique({ where: { id: req.params.id } });
    if (!record || record.userId !== req.user.id) {
      return res.status(404).json({ success: false, message: 'Tax record not found' });
    }
    res.json({ success: true, data: record });
  } catch (error) {
    console.error('Get tax record error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @desc    Generate tax record for user
// @route   POST /api/tax/records/generate
// @access  Private
router.post('/records/generate', protect, [ body('taxYear').isInt({ min: 2020, max: 2035 }) ], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ success: false, message: 'Validation failed', errors: errors.array() });
    }

    const taxYear = parseInt(req.body.taxYear);

    const startDate = new Date(taxYear, 0, 1);
    const endDate = new Date(taxYear, 11, 31, 23, 59, 59);

    // Fetch completed donations in the year
    const donations = await global.prisma.donation.findMany({
      where: {
        userId: req.user.id,
        status: 'COMPLETED',
        createdAt: { gte: startDate, lte: endDate }
      },
      include: { charity: { select: { name: true, ein: true } } }
    });

    if (!donations.length) {
      return res.status(400).json({ success: false, message: 'No donations found for the specified tax year' });
    }

    const donationItems = donations.map(d => ({
      donationId: d.id,
      charityName: d.charity?.name || 'Unknown',
      charityEin: d.charity?.ein || '',
      amount: Number(d.amount),
      date: d.createdAt,
      isTaxDeductible: d.taxInfo?.taxDeductible !== false
    }));

    const summary = computeSummary(donationItems);

    // Upsert tax record
    const record = await global.prisma.taxRecord.upsert({
      where: { userId_taxYear: { userId: req.user.id, taxYear } },
      create: {
        userId: req.user.id,
        companyId: req.user.companyId,
        taxYear,
        donations: donationItems,
        summary,
        documents: {
          scheduleA: { generated: true, generatedAt: new Date() },
          receipt: { generated: true, generatedAt: new Date() },
          summary: { generated: true, generatedAt: new Date() }
        },
        status: 'GENERATED',
        generatedAt: new Date()
      },
      update: {
        donations: donationItems,
        summary,
        documents: {
          scheduleA: { generated: true, generatedAt: new Date() },
          receipt: { generated: true, generatedAt: new Date() },
          summary: { generated: true, generatedAt: new Date() }
        },
        status: 'GENERATED',
        generatedAt: new Date()
      }
    });

    res.json({ success: true, message: 'Tax record generated successfully', data: record });
  } catch (error) {
    console.error('Generate tax record error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @desc    Download tax document (metadata)
// @route   GET /api/tax/records/:id/download/:documentType
// @access  Private
router.get('/records/:id/download/:documentType', protect, async (req, res) => {
  try {
    const { id, documentType } = req.params;
    if (!['scheduleA', 'receipt', 'summary'].includes(documentType)) {
      return res.status(400).json({ success: false, message: 'Invalid document type' });
    }
    const record = await global.prisma.taxRecord.findUnique({ where: { id } });
    if (!record || record.userId !== req.user.id) {
      return res.status(404).json({ success: false, message: 'Tax record not found' });
    }
    const docMeta = record.documents?.[documentType] || { generated: false };
    if (!docMeta.generated) {
      return res.status(404).json({ success: false, message: 'Document not generated yet' });
    }
    res.json({ success: true, data: { documentType, generatedAt: docMeta.generatedAt, downloadUrl: `/api/tax/records/${id}/download/${documentType}/file` } });
  } catch (error) {
    console.error('Download tax document error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @desc    Get actual tax document PDF
// @route   GET /api/tax/records/:id/download/:documentType/file
// @access  Private
router.get('/records/:id/download/:documentType/file', protect, async (req, res) => {
  try {
    const { id, documentType } = req.params;
    const record = await global.prisma.taxRecord.findUnique({ where: { id } });
    if (!record || record.userId !== req.user.id) {
      return res.status(404).json({ success: false, message: 'Tax record not found' });
    }
    let pdfBytes;
    if (documentType === 'scheduleA') {
      pdfBytes = await generateScheduleAPdf(record);
    } else if (documentType === 'receipt') {
      pdfBytes = await generateReceiptPdf(record);
    } else if (documentType === 'summary') {
      pdfBytes = await generateSummaryPdf(record);
    } else {
      return res.status(400).json({ success: false, message: 'Invalid document type' });
    }
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${documentType}-${record.taxYear}.pdf"`);
    res.setHeader('Content-Length', pdfBytes.length);
    res.send(Buffer.from(pdfBytes));
  } catch (error) {
    console.error('Download tax document file error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @desc    Download receipt for a single donation
// @route   GET /api/tax/donations/:id/receipt
// @access  Private
router.get('/donations/:id/receipt', protect, async (req, res) => {
  try {
    const donationId = req.params.id;
    let donation = null;
    
    try {
      donation = await global.prisma.donation.findUnique({
        where: { id: donationId },
        include: { charity: { select: { name: true, ein: true } } }
      });
    } catch (dbError) {
      console.log('Database query failed, checking for mock donation');
    }
    
    // If donation not found in DB, check if it's a mock ID and generate mock receipt
    if (!donation) {
      // For development/testing with mock data
      if (['1', '2', '3', '4', '5'].includes(donationId)) {
        const doc = await PDFDocument.create();
        const page = doc.addPage([612, 792]);
        const { height } = page.getSize();
        
        page.drawText('Charitable Donation Receipt', { x: 50, y: height - 50, size: 16 });
        page.drawText('Date: ' + new Date().toLocaleDateString(), { x: 50, y: height - 80, size: 12 });
        page.drawText('Charity: American Red Cross', { x: 50, y: height - 110, size: 12 });
        page.drawText('EIN: 13-5562305', { x: 50, y: height - 130, size: 12 });
        page.drawText('Amount: $50.00', { x: 50, y: height - 160, size: 12 });
        page.drawText('Tax Deductible: Yes', { x: 50, y: height - 190, size: 12 });
        page.drawText('Donation ID: ' + donationId, { x: 50, y: height - 220, size: 10 });
        page.drawText('', { x: 50, y: height - 250, size: 10 });
        page.drawText('This is a sample receipt generated for development.', { x: 50, y: height - 280, size: 10 });
        page.drawText('Create actual donations to see real receipts.', { x: 50, y: height - 300, size: 10 });
        
        const pdfBytes = await doc.save();
        
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="donation-receipt-${donationId}.pdf"`);
        res.setHeader('Content-Length', pdfBytes.length);
        res.send(Buffer.from(pdfBytes));
        return;
      }
      
      return res.status(404).json({ success: false, message: 'Donation not found' });
    }
    
    // Check authorization
    if (donation.userId !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized to access this donation' });
    }
    
    if (donation.status !== 'COMPLETED') {
      return res.status(400).json({ success: false, message: 'Receipt available only for completed donations' });
    }
    
    const pdfBytes = await generateDonationReceiptPdf(donation);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="donation-receipt-${donation.id}.pdf"`);
    res.setHeader('Content-Length', pdfBytes.length);
    res.send(Buffer.from(pdfBytes));
  } catch (error) {
    console.error('Download donation receipt error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @desc    Generate all tax records for company (HR Admin only)
// @route   POST /api/tax/records/generate-company
// @access  Private (HR Admin)
router.post('/records/generate-company', protect, authorize('HR_ADMIN', 'SUPER_ADMIN'), [ body('taxYear').isInt({ min: 2020, max: 2035 }) ], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ success: false, message: 'Validation failed', errors: errors.array() });
    }
    const taxYear = parseInt(req.body.taxYear);
    const companyId = req.user.role === 'SUPER_ADMIN' ? req.body.companyId || req.user.companyId : req.user.companyId;
    if (!companyId) {
      return res.status(400).json({ success: false, message: 'Company ID is required' });
    }
    const users = await global.prisma.user.findMany({ where: { companyId, role: 'EMPLOYEE', isActive: true } });
    const results = [];
    for (const u of users) {
      const startDate = new Date(taxYear, 0, 1);
      const endDate = new Date(taxYear, 11, 31, 23, 59, 59);
      const donations = await global.prisma.donation.findMany({
        where: { userId: u.id, status: 'COMPLETED', createdAt: { gte: startDate, lte: endDate } },
        include: { charity: { select: { name: true, ein: true } } }
      });
      if (!donations.length) continue;
      const items = donations.map(d => ({ donationId: d.id, charityName: d.charity?.name || 'Unknown', charityEin: d.charity?.ein || '', amount: Number(d.amount), date: d.createdAt, isTaxDeductible: d.taxInfo?.taxDeductible !== false }));
      const summary = computeSummary(items);
      const rec = await global.prisma.taxRecord.upsert({
        where: { userId_taxYear: { userId: u.id, taxYear } },
        create: { userId: u.id, companyId, taxYear, donations: items, summary, documents: { scheduleA: { generated: true }, receipt: { generated: true }, summary: { generated: true } }, status: 'GENERATED', generatedAt: new Date() },
        update: { donations: items, summary, documents: { scheduleA: { generated: true }, receipt: { generated: true }, summary: { generated: true } }, status: 'GENERATED', generatedAt: new Date() }
      });
      results.push(rec);
    }
    res.json({ success: true, message: `Generated ${results.length} tax records for company`, data: results });
  } catch (error) {
    console.error('Generate company tax records error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @desc    Get tax summary for user
// @route   GET /api/tax/summary
// @access  Private
router.get('/summary', protect, async (req, res) => {
  try {
    const year = parseInt(req.query.year || new Date().getFullYear());
    const record = await global.prisma.taxRecord.findUnique({ where: { userId_taxYear: { userId: req.user.id, taxYear: year } } });
    if (!record) {
      return res.json({ success: true, data: { taxYear: year, hasRecord: false, summary: { totalDonations: 0, totalTaxDeductible: 0, donationCount: 0, uniqueCharities: 0 }, documents: { scheduleA: { generated: false }, receipt: { generated: false }, summary: { generated: false } } } });
    }
    res.json({ success: true, data: { taxYear: record.taxYear, hasRecord: true, summary: record.summary, documents: record.documents, status: record.status, generatedAt: record.generatedAt } });
  } catch (error) {
    console.error('Get tax summary error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @desc    Get tax years available for user
// @route   GET /api/tax/years
// @access  Private
router.get('/years', protect, async (req, res) => {
  try {
    const donations = await global.prisma.donation.findMany({ where: { userId: req.user.id, status: 'COMPLETED' }, select: { createdAt: true } });
    const years = Array.from(new Set(donations.map(d => new Date(d.createdAt).getFullYear()))).sort((a, b) => b - a);
    res.json({ success: true, data: years });
  } catch (error) {
    console.error('Get tax years error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @desc    Mark tax record as downloaded
// @route   PUT /api/tax/records/:id/downloaded
// @access  Private
router.put('/records/:id/downloaded', protect, async (req, res) => {
  try {
    const record = await global.prisma.taxRecord.findUnique({ where: { id: req.params.id } });
    if (!record || record.userId !== req.user.id) {
      return res.status(404).json({ success: false, message: 'Tax record not found' });
    }
    const updated = await global.prisma.taxRecord.update({ where: { id: record.id }, data: { status: 'DOWNLOADED', downloadedAt: new Date() } });
    res.json({ success: true, message: 'Tax record marked as downloaded', data: updated });
  } catch (error) {
    console.error('Mark tax record as downloaded error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;

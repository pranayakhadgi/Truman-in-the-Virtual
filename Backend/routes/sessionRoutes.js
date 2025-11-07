// Session Routes - API Endpoints
const express = require('express');
const router = express.Router();
const Session = require('../models/Session');
const { body, validationResult } = require('express-validator');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');

// Rate limiting
const createSessionLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10 // limit each IP to 10 requests per windowMs
});

const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100
});

// Validation middleware
const validateSessionId = (req, res, next) => {
  const { id } = req.params;
  if (!id || typeof id !== 'string') {
    return res.status(400).json({ error: 'Invalid session ID' });
  }
  next();
};

// GET /api/sessions/:id - Get session details
router.get('/:id', validateSessionId, generalLimiter, async (req, res) => {
  try {
    const session = await Session.findOne({ sessionId: req.params.id });
    
    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }
    
    res.json({
      success: true,
      session: {
        sessionId: session.sessionId,
        startTime: session.startTime,
        endTime: session.endTime,
        isComplete: session.isComplete,
        currentStep: session.currentStep,
        totalDuration: session.totalDuration,
        responses: session.responses,
        selectedFacilities: session.selectedFacilities,
        facilityViews: session.facilityViews,
        contactInfo: session.contactInfo,
        metadata: session.metadata
      }
    });
  } catch (error) {
    console.error('Error fetching session:', error);
    res.status(500).json({ error: 'Failed to fetch session' });
  }
});

// POST /api/sessions - Create new session
router.post('/', createSessionLimiter, mongoSanitize(), async (req, res) => {
  try {
    const { ipAddress, userAgent, metadata, userType } = req.body;
    
    const session = new Session({
      userType: userType || 'unknown', // Required field, default to 'unknown'
      ipAddress: ipAddress || req.ip,
      userAgent: userAgent || req.get('user-agent'),
      metadata: metadata || {}
    });
    
    await session.save();
    
    res.status(201).json({
      success: true,
      sessionId: session.sessionId,
      message: 'Session created successfully',
      startTime: session.startTime
    });
  } catch (error) {
    console.error('Error creating session:', error);
    if (error.code === 11000) {
      return res.status(409).json({ error: 'Session already exists' });
    }
    res.status(500).json({ error: 'Failed to create session' });
  }
});

// POST /api/sessions/:id/responses - Add question response
router.post('/:id/responses', 
  validateSessionId,
  generalLimiter,
  mongoSanitize(),
  [
    body('questionId').trim().notEmpty().withMessage('Question ID is required'),
    body('questionText').trim().notEmpty().withMessage('Question text is required'),
    body('answer').trim().notEmpty().withMessage('Answer is required')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
      
      const session = await Session.findOne({ sessionId: req.params.id });
      if (!session) {
        return res.status(404).json({ error: 'Session not found' });
      }
      
      const { questionId, questionText, answer } = req.body;
      await session.addResponse(questionId, questionText, answer);
      
      res.json({
        success: true,
        message: 'Response added successfully',
        totalResponses: session.responses.length
      });
    } catch (error) {
      console.error('Error adding response:', error);
      res.status(500).json({ error: 'Failed to add response' });
    }
  }
);

// POST /api/sessions/:id/facilities - Add facility selection
router.post('/:id/facilities',
  validateSessionId,
  generalLimiter,
  mongoSanitize(),
  [
    body('facilityId').trim().notEmpty().withMessage('Facility ID is required')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
      
      const session = await Session.findOne({ sessionId: req.params.id });
      if (!session) {
        return res.status(404).json({ error: 'Session not found' });
      }
      
      const { facilityId } = req.body;
      
      if (!session.selectedFacilities.includes(facilityId)) {
        session.selectedFacilities.push(facilityId);
        await session.save();
      }
      
      res.json({
        success: true,
        message: 'Facility added successfully',
        selectedFacilities: session.selectedFacilities
      });
    } catch (error) {
      console.error('Error adding facility:', error);
      res.status(500).json({ error: 'Failed to add facility' });
    }
  }
);

// POST /api/sessions/:id/views - Record facility view
router.post('/:id/views',
  validateSessionId,
  generalLimiter,
  mongoSanitize(),
  [
    body('facilityId').trim().notEmpty().withMessage('Facility ID is required'),
    body('facilityName').trim().notEmpty().withMessage('Facility name is required'),
    body('viewDuration').optional().isNumeric().withMessage('View duration must be a number')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
      
      const session = await Session.findOne({ sessionId: req.params.id });
      if (!session) {
        return res.status(404).json({ error: 'Session not found' });
      }
      
      const { facilityId, facilityName, viewDuration = 0 } = req.body;
      await session.addFacilityView(facilityId, facilityName, viewDuration);
      
      res.json({
        success: true,
        message: 'Facility view recorded successfully',
        totalViews: session.facilityViews.length
      });
    } catch (error) {
      console.error('Error recording facility view:', error);
      res.status(500).json({ error: 'Failed to record facility view' });
    }
  }
);

// PATCH /api/sessions/:id/contact - Update contact info
router.patch('/:id/contact',
  validateSessionId,
  generalLimiter,
  mongoSanitize(),
  [
    body('email').optional().isEmail().withMessage('Invalid email format'),
    body('name').optional().trim(),
    body('phone').optional().trim(),
    body('zipCode').optional().trim(),
    body('optInForUpdates').optional().isBoolean().withMessage('optInForUpdates must be a boolean'),
    body('graduationYear').optional().trim(),
    body('interests').optional().isArray().withMessage('Interests must be an array')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
      
      const session = await Session.findOne({ sessionId: req.params.id });
      if (!session) {
        return res.status(404).json({ error: 'Session not found' });
      }
      
      const { name, email, phone, zipCode, optInForUpdates, graduationYear, interests } = req.body;
      
      if (name !== undefined) session.contactInfo.name = name;
      if (email !== undefined) session.contactInfo.email = email;
      if (phone !== undefined) session.contactInfo.phone = phone;
      if (zipCode !== undefined) session.contactInfo.zipCode = zipCode;
      if (optInForUpdates !== undefined) session.contactInfo.optInForUpdates = optInForUpdates;
      if (graduationYear !== undefined) session.contactInfo.graduationYear = graduationYear;
      if (interests !== undefined) session.contactInfo.interests = interests;
      
      await session.save();
      
      res.json({
        success: true,
        message: 'Contact info updated successfully',
        contactInfo: session.contactInfo
      });
    } catch (error) {
      console.error('Error updating contact info:', error);
      res.status(500).json({ error: 'Failed to update contact info' });
    }
  }
);

// POST /api/sessions/:id/complete - Mark session complete
router.post('/:id/complete',
  validateSessionId,
  generalLimiter,
  async (req, res) => {
    try {
      const session = await Session.findOne({ sessionId: req.params.id });
      if (!session) {
        return res.status(404).json({ error: 'Session not found' });
      }
      
      await session.markComplete();
      
      res.json({
        success: true,
        message: 'Session marked as complete',
        totalDuration: session.totalDuration,
        endTime: session.endTime
      });
    } catch (error) {
      console.error('Error completing session:', error);
      res.status(500).json({ error: 'Failed to complete session' });
    }
  }
);

module.exports = router;


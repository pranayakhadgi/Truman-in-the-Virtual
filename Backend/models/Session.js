// Session Model - Stores user journey through virtual tour
const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const SessionSchema = new mongoose.Schema({
  sessionId: {
    type: String,
    required: true,
    unique: true,
    default: uuidv4
  },
  
  // User Classification
  userType: {
    type: String,
    enum: ['prospective_student', 'parent', 'current_student', 'alumni', 'visitor', 'unknown', 'other'],
    required: true,
    default: 'unknown'
  },
  
  // Interest/Major Category
  interest: {
    type: String,
    enum: ['computer_science', 'liberal_arts', 'sciences', 'athletics', 'business', 'education', 'other'],
    default: null
  },
  
  // Additional context for parents
  parentContext: {
    childGradeLevel: String,
    plannedEnrollmentYear: Number
  },
  
  // Selected facilities they want to see
  selectedFacilities: [{
    facilityId: String,
    facilityName: String,
    category: String,
    selectedAt: { type: Date, default: Date.now }
  }],
  
  // Facilities actually viewed in 3D tour
  viewedFacilities: [{
    facilityId: String,
    facilityName: String,
    viewedAt: Date,
    timeSpent: Number, // seconds
    interactions: Number // clicks/movements
  }],
  
  // Contact information (optional)
  contactInfo: {
    email: {
      type: String,
      lowercase: true,
      trim: true,
      match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    },
    phone: {
      type: String,
      trim: true
    },
    zipCode: {
      type: String,
      trim: true
    },
    name: {
      type: String,
      trim: true
    },
    optInForUpdates: {
      type: Boolean,
      default: false
    }
  },
  
  // Journey tracking
  responses: [{
    questionId: String,
    question: String,
    answer: String,
    answeredAt: { type: Date, default: Date.now }
  }],
  
  // Session metadata
  startedAt: {
    type: Date,
    default: Date.now,
    index: true
  },
  completedAt: {
    type: Date,
    default: null
  },
  totalTimeSpent: {
    type: Number,
    default: 0 // seconds
  },
  
  // Technical metadata
  ipAddress: {
    type: String,
    required: true
  },
  userAgent: String,
  referrer: String,
  deviceType: {
    type: String,
    enum: ['desktop', 'mobile', 'tablet', 'unknown'],
    default: 'unknown'
  },
  
  // Status
  status: {
    type: String,
    enum: ['active', 'completed', 'abandoned'],
    default: 'active'
  }
}, {
  timestamps: true, // adds createdAt and updatedAt
  collection: 'sessions'
});

// Indexes for performance
SessionSchema.index({ createdAt: -1 });
SessionSchema.index({ userType: 1, interest: 1 });
SessionSchema.index({ 'contactInfo.email': 1 }, { sparse: true });
SessionSchema.index({ status: 1 });

// Methods
SessionSchema.methods.addResponse = function(questionId, question, answer) {
  this.responses.push({
    questionId,
    question,
    answer,
    answeredAt: new Date()
  });
  return this.save();
};

SessionSchema.methods.addFacilitySelection = function(facilityId, facilityName, category) {
  this.selectedFacilities.push({
    facilityId,
    facilityName,
    category,
    selectedAt: new Date()
  });
  return this.save();
};

SessionSchema.methods.recordFacilityView = function(facilityId, facilityName, timeSpent, interactions) {
  this.viewedFacilities.push({
    facilityId,
    facilityName,
    viewedAt: new Date(),
    timeSpent,
    interactions
  });
  this.totalTimeSpent += timeSpent;
  return this.save();
};

SessionSchema.methods.complete = function() {
  this.completedAt = new Date();
  this.status = 'completed';
  return this.save();
};

// Static methods
SessionSchema.statics.getAnalytics = async function(startDate, endDate) {
  return this.aggregate([
    {
      $match: {
        createdAt: {
          $gte: startDate,
          $lte: endDate
        }
      }
    },
    {
      $group: {
        _id: {
          userType: '$userType',
          interest: '$interest'
        },
        count: { $sum: 1 },
        avgTimeSpent: { $avg: '$totalTimeSpent' },
        completionRate: {
          $avg: {
            $cond: [{ $eq: ['$status', 'completed'] }, 1, 0]
          }
        }
      }
    },
    {
      $sort: { count: -1 }
    }
  ]);
};

module.exports = mongoose.model('Session', SessionSchema);
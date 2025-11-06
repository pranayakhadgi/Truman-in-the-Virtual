// Database Test Script
require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../config/database');
const Session = require('../models/Session');

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

const log = {
  success: (msg) => console.log(`${colors.green}✅ ${msg}${colors.reset}`),
  error: (msg) => console.log(`${colors.red}❌ ${msg}${colors.reset}`),
  info: (msg) => console.log(`${colors.blue}ℹ️  ${msg}${colors.reset}`),
  test: (msg) => console.log(`\n${colors.cyan}${msg}${colors.reset}`)
};

let testSessionId = null;

async function testDatabaseConnection() {
  log.test('Test 1: Database Connection');
  try {
    await connectDB();
    const clusterMatch = process.env.MONGODB_URI.match(/@([^/]+)\.mongodb\.net/);
    const clusterName = clusterMatch ? clusterMatch[1] : 'unknown';
    
    // Extract database name from URI
    const dbMatch = process.env.MONGODB_URI.match(/\.mongodb\.net\/([^?]+)/);
    const dbName = dbMatch ? dbMatch[1] : 'unknown';
    
    const mongoose = require('mongoose');
    const connectionState = mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected';
    
    log.success(`MongoDB Connected: ${clusterName}`);
    log.info(`📊 Database Name: ${dbName}`);
    log.info(`🔗 Connection State: ${connectionState}`);
    log.success('Connection successful');
    return true;
  } catch (error) {
    log.error(`Connection failed: ${error.message}`);
    return false;
  }
}

async function testCreateSession() {
  log.test('Test 2: Create Session');
  try {
    const session = new Session({
      ipAddress: '127.0.0.1',
      userAgent: 'Test Agent',
      metadata: { test: true }
    });
    
    await session.save();
    testSessionId = session.sessionId;
    log.success(`Session created: ${testSessionId}`);
    return true;
  } catch (error) {
    log.error(`Failed to create session: ${error.message}`);
    return false;
  }
}

async function testAddResponse() {
  log.test('Test 3: Add Response');
  try {
    const session = await Session.findOne({ sessionId: testSessionId });
    if (!session) {
      log.error('Test session not found');
      return false;
    }
    
    await session.addResponse(
      'q1',
      'What is your interest?',
      'Computer Science'
    );
    log.success('Response added');
    log.info(`Total responses: ${session.responses.length}`);
    return true;
  } catch (error) {
    log.error(`Failed to add response: ${error.message}`);
    return false;
  }
}

async function testAddFacility() {
  log.test('Test 4: Add Facility Selection');
  try {
    const session = await Session.findOne({ sessionId: testSessionId });
    if (!session) {
      log.error('Test session not found');
      return false;
    }
    
    session.selectedFacilities.push('magruder-hall');
    await session.save();
    log.success('Facility selection added');
    log.info(`Selected facilities: ${session.selectedFacilities.join(', ')}`);
    return true;
  } catch (error) {
    log.error(`Failed to add facility: ${error.message}`);
    return false;
  }
}

async function testAddFacilityView() {
  log.test('Test 5: Record Facility View');
  try {
    const session = await Session.findOne({ sessionId: testSessionId });
    if (!session) {
      log.error('Test session not found');
      return false;
    }
    
    await session.addFacilityView('magruder-hall', 'Magruder Hall', 120);
    log.success('Facility view recorded');
    log.info(`Total views: ${session.facilityViews.length}`);
    return true;
  } catch (error) {
    log.error(`Failed to record view: ${error.message}`);
    return false;
  }
}

async function testUpdateContact() {
  log.test('Test 6: Update Contact Info');
  try {
    const session = await Session.findOne({ sessionId: testSessionId });
    if (!session) {
      log.error('Test session not found');
      return false;
    }
    
    session.contactInfo.name = 'Test User';
    session.contactInfo.email = 'test@example.com';
    session.contactInfo.graduationYear = '2025';
    session.contactInfo.interests = ['Computer Science', 'Mathematics'];
    
    await session.save();
    log.success('Contact info updated');
    log.info(`Email: ${session.contactInfo.email}`);
    return true;
  } catch (error) {
    log.error(`Failed to update contact: ${error.message}`);
    return false;
  }
}

async function testCompleteSession() {
  log.test('Test 7: Mark Session Complete');
  try {
    const session = await Session.findOne({ sessionId: testSessionId });
    if (!session) {
      log.error('Test session not found');
      return false;
    }
    
    await session.markComplete();
    log.success('Session completed');
    log.info(`Total duration: ${session.totalDuration} seconds`);
    return true;
  } catch (error) {
    log.error(`Failed to complete session: ${error.message}`);
    return false;
  }
}

async function testFetchSession() {
  log.test('Test 8: Retrieve Session');
  try {
    const session = await Session.findOne({ sessionId: testSessionId });
    if (!session) {
      log.error('Test session not found');
      return false;
    }
    
    log.success('Session retrieved');
    log.info(`   - Status: ${session.isComplete ? 'completed' : 'active'}`);
    log.info(`   - Total Time: ${session.totalDuration} seconds`);
    log.info(`   - Responses: ${session.responses.length}`);
    log.info(`   - Facilities: ${session.selectedFacilities.length}`);
    return true;
  } catch (error) {
    log.error(`Failed to retrieve session: ${error.message}`);
    return false;
  }
}

async function testGetAnalytics() {
  log.test('Test 9: Get Analytics');
  try {
    const totalSessions = await Session.countDocuments();
    const completedSessions = await Session.countDocuments({ isComplete: true });
    
    log.success(`Analytics retrieved: ${totalSessions} records`);
    log.info(`Total sessions: ${totalSessions}`);
    log.info(`Completed sessions: ${completedSessions}`);
    return true;
  } catch (error) {
    log.error(`Failed to get analytics: ${error.message}`);
    return false;
  }
}

async function testCleanup() {
  log.test('Test 10: Cleanup Test Data');
  try {
    if (testSessionId) {
      await Session.deleteOne({ sessionId: testSessionId });
      log.success('Test data cleaned up');
    }
    return true;
  } catch (error) {
    log.error(`Cleanup failed: ${error.message}`);
    return false;
  }
}

async function runTests() {
  console.log('\n🧪 Starting Database Tests...\n');
  
  const results = {
    passed: 0,
    failed: 0,
    tests: []
  };
  
  // Run tests
  const tests = [
    { name: 'Database Connection', fn: testDatabaseConnection },
    { name: 'Create Session', fn: testCreateSession },
    { name: 'Add Response', fn: testAddResponse },
    { name: 'Add Facility Selection', fn: testAddFacility },
    { name: 'Record Facility View', fn: testAddFacilityView },
    { name: 'Update Contact Info', fn: testUpdateContact },
    { name: 'Complete Session', fn: testCompleteSession },
    { name: 'Retrieve Session', fn: testFetchSession },
    { name: 'Get Analytics', fn: testGetAnalytics },
    { name: 'Cleanup Test Data', fn: testCleanup }
  ];
  
  for (const test of tests) {
    try {
      const result = await test.fn();
      if (result) {
        results.passed++;
        results.tests.push({ name: test.name, status: 'passed' });
      } else {
        results.failed++;
        results.tests.push({ name: test.name, status: 'failed' });
      }
    } catch (error) {
      results.failed++;
      results.tests.push({ name: test.name, status: 'error', error: error.message });
    }
  }
  
  // Print summary
  console.log('\n' + '='.repeat(50));
  console.log('📊 Test Results Summary');
  console.log('='.repeat(50));
  console.log(`✅ Passed: ${results.passed}`);
  console.log(`❌ Failed: ${results.failed}`);
  console.log(`📝 Total: ${results.passed + results.failed}`);
  
  if (results.failed === 0) {
    console.log(`\n${colors.green}🎉 All tests passed!${colors.reset}`);
    console.log(`${colors.green}✨ Database is ready for production use${colors.reset}\n`);
    
    // Close database connection
    const mongoose = require('mongoose');
    await mongoose.connection.close();
    console.log(`${colors.blue}👋 Database connection closed${colors.reset}\n`);
    process.exit(0);
  } else {
    console.log(`\n${colors.red}⚠️  Some tests failed. Please review the errors above.${colors.reset}\n`);
    results.tests.forEach(test => {
      if (test.status !== 'passed') {
        console.log(`${colors.red}  ❌ ${test.name}${colors.reset}`);
        if (test.error) {
          console.log(`     ${colors.yellow}Error: ${test.error}${colors.reset}`);
        }
      }
    });
    
    // Close database connection
    const mongoose = require('mongoose');
    await mongoose.connection.close();
    process.exit(1);
  }
}

// Handle errors
process.on('unhandledRejection', (error) => {
  log.error(`Unhandled rejection: ${error.message}`);
  process.exit(1);
});

// Run tests
runTests().catch(error => {
  log.error(`Test suite failed: ${error.message}`);
  process.exit(1);
});


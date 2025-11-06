# 🎯 Truman Virtual Tour: Welcome Page Data Collection System

**Project Update:** Phase 2 - Interactive Welcome Flow  
**Developer:** Pranaya Khadgi Shahi  
**Collaborator:** Ali Musterih Addikebir  
**Date:** November 2025

---

## 📋 **Executive Summary**

We're transforming the welcome page from a simple "click to enter" button into an **interactive data collection system** that:
- Asks visitors personalized questions
- Captures their information for Truman Admissions
- Stores all data in **MongoDB Atlas (cloud database)**
- Provides a customized 3D tour experience based on their answers

**Key Benefit:** Truman Admissions gets valuable visitor data (who they are, what they're interested in, contact info) automatically stored in the cloud.

---

## 🌳 **How "Linked Queries" Work**

### **Concept: Question Tree with Branching Logic**

Think of it like a "Choose Your Own Adventure" book. Each answer leads to a different next question.

```
Start: "Who are you?"
    │
    ├─ Answer: "Prospective Student"
    │   └─→ Next Question: "What are you interested in?"
    │       ├─ Answer: "Computer Science"
    │       │   └─→ Next: Show CS facilities (Violette Hall, Labs, etc.)
    │       │
    │       └─ Answer: "Athletics"
    │           └─→ Next: Show sports facilities (Stadium, Rec Center, etc.)
    │
    ├─ Answer: "Parent/Guardian"
    │   └─→ Next Question: "What grade is your child in?"
    │       └─→ Then: "What are they interested in?"
    │           └─→ Next: Show relevant facilities
    │
    └─ Answer: "Current Student" or "Alumni"
        └─→ SKIP interest questions → Go directly to facility selection
```

### **Real Example Flow**

**Scenario 1: Prospective CS Student**
1. Q1: "Who are you?" → **"Prospective Student"**
2. Q2: "What interests you?" → **"Computer Science"**
3. Q3: "What do you want to see?" → **Violette Hall, CS Labs, Library**
4. Q4: "Stay connected?" → **Email: john@email.com**
5. ✅ Data saved → Start 3D tour with CS buildings

**Scenario 2: Parent with Child**
1. Q1: "Who are you?" → **"Parent/Guardian"**
2. Q2: "What grade is your child in?" → **"High School Junior"**
3. Q3: "What are they interested in?" → **"Sciences"**
4. Q4: "What do you want to see?" → **Science Labs, Magruder Hall, Greenhouse**
5. Q4: "Your contact info?" → **Email + Phone provided**
6. ✅ Data saved → Start 3D tour with science facilities

**Scenario 3: Alumni Visiting**
1. Q1: "Who are you?" → **"Alumni"**
2. ⚡ **SKIP** interest questions (they already know Truman)
3. Q2: "What do you want to see?" → **Any facility they choose**
4. ✅ Data saved → Start 3D tour

---

## 🗄️ **MongoDB Atlas: Cloud Database Storage**

### **What Pranaya is Working On**

I'm connecting our backend to **MongoDB Atlas**, which is a free cloud database service. Here's what it does:

**Before (No Database):**
- Visitor fills out questions → Data disappears when they close the browser ❌
- No way to track who visited or what they're interested in ❌

**After (With MongoDB Atlas):**
- Visitor fills out questions → **Data saved to cloud permanently** ✅
- Truman Admissions can see all visitor data anytime ✅
- We can analyze trends (e.g., "80% of visitors interested in CS") ✅

### **What Gets Stored in the Database**

Every visitor creates a **"session"** with this information:

```javascript
Session Document (stored in MongoDB):
{
  sessionId: "unique-uuid-12345",
  userType: "prospective_student",
  interest: "computer_science",
  
  // All their answers
  responses: [
    {
      question: "Who are you?",
      answer: "Prospective Student",
      timestamp: "2025-11-04T14:30:00Z"
    },
    {
      question: "What interests you?",
      answer: "Computer Science",
      timestamp: "2025-11-04T14:30:15Z"
    }
  ],
  
  // What they chose to see
  selectedFacilities: [
    { name: "Violette Hall", category: "academic" },
    { name: "Computer Labs", category: "academic" }
  ],
  
  // Contact info (if they provided it)
  contactInfo: {
    email: "john@email.com",
    name: "John Doe",
    phone: "(555) 123-4567"
  },
  
  // Metadata
  createdAt: "2025-11-04T14:29:45Z",
  completedAt: "2025-11-04T14:32:10Z",
  deviceType: "mobile",
  ipAddress: "192.168.1.1"
}
```

---

## 🔧 **Technical Architecture**

### **System Components**

```
┌─────────────────────────────────────────────────────────┐
│                   FRONTEND (What Ali will work on)       │
│                                                          │
│  welcome-flow.html                                       │
│    ├─ WelcomeFlow.jsx (Main React component)           │
│    ├─ QuestionStep.jsx (Shows one question at a time)  │
│    ├─ ProgressBar.jsx (Shows "Step 2 of 4")            │
│    └─ ContactForm.jsx (Optional email/phone)            │
│                                                          │
│  User clicks answer → JavaScript sends data ↓           │
└─────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────┐
│              BACKEND (What Pranaya is working on)        │
│                                                          │
│  server.js (Express.js API)                             │
│    ├─ POST /api/sessions (Create new visitor session)  │
│    ├─ POST /api/sessions/:id/responses (Save answer)   │
│    ├─ POST /api/sessions/:id/facilities (Save choices) │
│    └─ PATCH /api/sessions/:id/contact (Save email)     │
│                                                          │
│  API receives data → Saves to database ↓                │
└─────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────┐
│           MONGODB ATLAS (Cloud Database)                 │
│                                                          │
│  Free Tier Cluster: truman-virtual-tour                 │
│    └─ Collection: sessions                              │
│        ├─ Document 1: Session from John (CS student)   │
│        ├─ Document 2: Session from Parent               │
│        └─ Document 3: Session from Alumni               │
│                                                          │
│  ✅ Data stored permanently in the cloud                │
└─────────────────────────────────────────────────────────┘
```

### **How Data Flows (Step-by-Step)**

**Step 1: User Starts Journey**
```javascript
// Frontend creates a new session
fetch('http://localhost:3000/api/sessions', {
  method: 'POST',
  body: JSON.stringify({ userType: 'unknown' })
});

// Backend creates session in MongoDB
// Returns: { sessionId: "abc-123-def" }
```

**Step 2: User Answers Question 1**
```javascript
// Frontend: User clicks "Prospective Student"
fetch('http://localhost:3000/api/sessions/abc-123-def/responses', {
  method: 'POST',
  body: JSON.stringify({
    questionId: 'user_type',
    question: 'Who are you?',
    answer: 'prospective_student'
  })
});

// Backend saves to MongoDB → triggers next question
```

**Step 3: User Answers Question 2**
```javascript
// Frontend: User clicks "Computer Science"
fetch('http://localhost:3000/api/sessions/abc-123-def/responses', {
  method: 'POST',
  body: JSON.stringify({
    questionId: 'interest',
    question: 'What interests you?',
    answer: 'computer_science'
  })
});

// Backend saves to MongoDB
```

**Step 4: User Selects Facilities**
```javascript
// Frontend: User selects Violette Hall
fetch('http://localhost:3000/api/sessions/abc-123-def/facilities', {
  method: 'POST',
  body: JSON.stringify({
    facilityId: 'violette_hall',
    facilityName: 'Violette Hall',
    category: 'academic'
  })
});

// Backend saves to MongoDB
```

**Step 5: User Provides Contact (Optional)**
```javascript
// Frontend: User enters email
fetch('http://localhost:3000/api/sessions/abc-123-def/contact', {
  method: 'PATCH',
  body: JSON.stringify({
    email: 'john@email.com',
    name: 'John Doe'
  })
});

// Backend saves to MongoDB
```

**Step 6: Complete & Transition**
```javascript
// Frontend: Flow complete
fetch('http://localhost:3000/api/sessions/abc-123-def/complete', {
  method: 'POST'
});

// Backend marks session as complete
// Frontend transitions to 3D tour with selected facilities
```

---

## 📊 **What Ali Needs to Build (Frontend Components)**

### **Component 1: WelcomeFlow.jsx**
**Purpose:** Main coordinator for the entire question flow

**Responsibilities:**
- Show current question
- Handle "Next" and "Back" buttons
- Track which step user is on (1 of 4, 2 of 4, etc.)
- Call backend API when user answers
- Transition to 3D tour when complete

**Pseudocode:**
```javascript
function WelcomeFlow() {
  const [currentStep, setCurrentStep] = useState(1);
  const [answers, setAnswers] = useState({});
  
  function handleAnswer(question, answer) {
    // Save answer locally
    setAnswers({ ...answers, [question]: answer });
    
    // Send to backend
    saveToDatabase(question, answer);
    
    // Go to next question
    const nextStep = determineNextStep(currentStep, answer);
    setCurrentStep(nextStep);
  }
  
  return (
    <div>
      {currentStep === 1 && <QuestionStep question="Who are you?" onAnswer={handleAnswer} />}
      {currentStep === 2 && <QuestionStep question="What interests you?" onAnswer={handleAnswer} />}
      {currentStep === 3 && <FacilitySelector onSelect={handleAnswer} />}
      {currentStep === 4 && <ContactForm onSubmit={handleAnswer} />}
    </div>
  );
}
```

### **Component 2: QuestionStep.jsx**
**Purpose:** Shows one question with clickable answer options

**Example:**
```
┌──────────────────────────────────────────────┐
│  Question: Who are you?                      │
│  This helps us personalize your tour         │
│                                              │
│  ┌─────────────────────────────────────┐   │
│  │  🎓 Prospective Student              │   │
│  │  I'm considering Truman for college  │   │
│  └─────────────────────────────────────┘   │
│                                              │
│  ┌─────────────────────────────────────┐   │
│  │  👨‍👩‍👧 Parent/Guardian                │   │
│  │  Learning about Truman for my child  │   │
│  └─────────────────────────────────────┘   │
│                                              │
│  ┌─────────────────────────────────────┐   │
│  │  📚 Current Student                  │   │
│  │  I attend Truman                     │   │
│  └─────────────────────────────────────┘   │
└──────────────────────────────────────────────┘
```

### **Component 3: ProgressBar.jsx**
**Purpose:** Shows visual progress through questions

**Example:**
```
Step 2 of 4

●━━━━●━━━━○━━━━○

About You  →  Interests  →  Tour  →  Contact
(Complete)    (Current)    (Next)  (Next)
```

### **Component 4: FacilitySelector.jsx**
**Purpose:** Let users choose which buildings to see

**Example:**
```
What would you like to see?
Select one or more locations

┌─────────────┐  ┌─────────────┐  ┌─────────────┐
│ Violette    │  │ Stokes      │  │ Library     │
│ Hall        │  │ Stadium     │  │             │
│             │  │             │  │             │
│ [✓] Select  │  │ [ ] Select  │  │ [ ] Select  │
└─────────────┘  └─────────────┘  └─────────────┘
```

### **Component 5: ContactForm.jsx**
**Purpose:** Optional email/phone collection

**Example:**
```
Stay connected with Truman (Optional)

Email: [________________]

Name:  [________________]

Phone: [________________] (optional)

[✓] Send me updates about Truman

[Skip]  [Continue to Tour]
```

---

## 🎯 **Ali's Action Items**

### **Immediate Tasks:**

1. **Understand the Question Tree** (15 min)
   - Read the "How Linked Queries Work" section
   - Sketch out the flow on paper
   - Ask Pranaya if anything is unclear

2. **Review Existing Code** (30 min)
   - Look at `Frontend/welcome.html` (current welcome page)
   - Look at `Frontend/app.js` (current 3D tour)
   - Understand how the transition currently works

3. **Set Up Development Environment** (30 min)
   - Install React dependencies (if not already installed)
   - Make sure you can run the frontend locally
   - Test that backend API is working (`npm run dev` in Backend/)

4. **Build First Component** (2-3 hours)
   - Start with `QuestionStep.jsx` (simplest component)
   - Make it show one question with clickable options
   - Test that it works before moving on

5. **Integrate with Backend** (1-2 hours)
   - Use Pranaya's API endpoints to save answers
   - Test that data appears in MongoDB Atlas
   - Verify sessionId is being tracked correctly

### **Questions to Ask Pranaya:**

- [ ] Is the backend API running on `localhost:3000`?
- [ ] What's the MongoDB Atlas connection status? (is it working?)
- [ ] Where should I put the React components? (which folder?)
- [ ] Should I replace `welcome.html` or create a new file?
- [ ] How do we pass selected facilities to the 3D tour?

---

## 📝 **Key Decisions Made**

### **1. Question Flow (Finalized)**
- **4 steps maximum** (not overwhelming for users)
- **Step 4 is optional** (don't force contact info)
- **Branching based on user type** (prospective student gets different questions than alumni)

### **2. Data Privacy**
- ✅ Contact info is **optional**
- ✅ IP addresses are **hashed** (not stored in plain text)
- ✅ Users can skip contact form
- ✅ Privacy policy link provided

### **3. Technical Stack**
- ✅ React for frontend (easier state management)
- ✅ MongoDB Atlas for database (free, cloud-hosted)
- ✅ Express.js backend (already built)
- ✅ Tailwind CSS for styling (already used in project)

---


## ✅ **Success Criteria**

We'll know this is working when:
- [ ] User can answer all questions without errors
- [ ] Each answer appears in MongoDB Atlas
- [ ] Selected facilities load in the 3D tour
- [ ] Mobile users can complete the flow easily
- [ ] Contact info is saved (when provided)
- [ ] Truman Admissions can export visitor data

---



## 🎯 **TL;DR (Too Long; Didn't Read)**

**For Ali to get started:**

1. **What we're building:** Interactive questions on welcome page → saves visitor data to cloud
2. **How it works:** Question tree (each answer leads to next question)
3. **Your job:** Build 5 React components that show questions and send answers to Pranaya's backend
4. **Pranaya's job:** Backend API that saves answers to MongoDB Atlas (cloud database)
5. **Start here:** Build `QuestionStep.jsx` first (shows one question with clickable options)
6. **Ask if stuck:** Better to ask than spend hours confused!

**Key files to review:**
- `Backend/routes/sessionRoutes.js` - See API endpoints you'll call
- `Frontend/welcome.html` - Current welcome page (you'll replace this)
- `Frontend/app.js` - See how React is already used in the project

Good luck! 🚀

---

**Version:** 1.0  
**Last Updated:** November 4, 2025  

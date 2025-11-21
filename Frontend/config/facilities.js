// Facility Data Configuration
const facilities = [
  {
    id: 'violette_hall',
    name: 'Violette Hall',
    category: 'academic',
    description: 'Computer Science & Mathematics',
    thumbnail: '/public/images/truman_clocktower.webp',
    sceneCount: 4,
    estimatedTime: '5 mins',
    tags: ['computer-science', 'classrooms', 'labs'],
    skyboxPath: 'truman_campus'
  },
  {
    id: 'magruder_hall',
    name: 'Magruder Hall',
    category: 'academic',
    description: 'Science & Research Labs',
    thumbnail: '/public/images/truman_magruder.webp',
    sceneCount: 3,
    estimatedTime: '4 mins',
    tags: ['science', 'labs', 'research'],
    skyboxPath: 'truman_campus'
  },
  {
    id: 'stokes_stadium',
    name: 'Stokes Stadium',
    category: 'athletics',
    description: 'Football & Athletics',
    thumbnail: '/public/field-skyboxes 2/Footballfield/posx.webp',
    sceneCount: 2,
    estimatedTime: '3 mins',
    tags: ['football', 'athletics', 'sports'],
    skyboxPath: 'football_field'
  },
  {
    id: 'library',
    name: 'Pickler Memorial Library',
    category: 'academic',
    description: 'Research & Study Spaces',
    thumbnail: '/public/images/truman_clocktower.webp',
    sceneCount: 3,
    estimatedTime: '4 mins',
    tags: ['library', 'study', 'research'],
    skyboxPath: 'truman_campus'
  },
  {
    id: 'rec_center',
    name: 'Student Recreation Center',
    category: 'athletics',
    description: 'Fitness & Recreation',
    thumbnail: '/public/images/truman_clocktower.webp',
    sceneCount: 2,
    estimatedTime: '3 mins',
    tags: ['fitness', 'recreation', 'gym'],
    skyboxPath: 'truman_campus'
  },
  {
    id: 'student_union',
    name: 'Student Union',
    category: 'campus-life',
    description: 'Dining & Student Services',
    thumbnail: '/public/images/truman_clocktower.webp',
    sceneCount: 2,
    estimatedTime: '3 mins',
    tags: ['dining', 'services', 'student-life'],
    skyboxPath: 'truman_campus'
  },
  {
    id: 'international_center',
    name: 'International Center',
    category: 'campus-life',
    description: 'International Student Services',
    thumbnail: '/public/images/truman_international_group.webp',
    sceneCount: 2,
    estimatedTime: '3 mins',
    tags: ['international', 'services', 'support'],
    skyboxPath: 'truman_campus'
  },
  {
    id: 'fountain',
    name: 'Centennial Fountain',
    category: 'campus-life',
    description: 'Historic Campus Landmark',
    thumbnail: '/public/images/truman_fountain.webp',
    sceneCount: 1,
    estimatedTime: '2 mins',
    tags: ['landmark', 'history', 'campus'],
    skyboxPath: 'truman_campus'
  }
];

// Get facilities by category
const getFacilitiesByCategory = (category) => {
  return facilities.filter(f => f.category === category);
};

// Get recommended facilities based on interest
const getRecommendedFacilities = (interest) => {
  const interestMap = {
    'computer_science': ['violette_hall', 'library', 'student_union'],
    'liberal_arts': ['library', 'student_union', 'fountain'],
    'sciences': ['magruder_hall', 'library', 'rec_center'],
    'athletics': ['stokes_stadium', 'rec_center', 'student_union'],
    'business': ['violette_hall', 'student_union', 'library'],
    'education': ['library', 'student_union', 'fountain'],
    'undecided': facilities.map(f => f.id)
  };
  
  const facilityIds = interestMap[interest] || [];
  return facilities.filter(f => facilityIds.includes(f.id));
};

// Make available globally
if (typeof window !== 'undefined') {
  window.facilitiesConfig = facilities;
  window.getFacilitiesByCategory = getFacilitiesByCategory;
  window.getRecommendedFacilities = getRecommendedFacilities;
}


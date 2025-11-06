// BuildingData.js - Building information with latitude, longitude, name, description, etc.

// Building data structure
const buildingsData = {
  academic: [
    {
      id: 1,
      name: "Pickler Memorial Library",
      lat: 40.1884,
      lng: -92.58174,
      skyboxIndex: 0, // Maps to "Thousand Hills in Truman"
      description: "Main campus library",
      hours: "24/7 during semester",
      imageUrl: "/public/images/buildings/pickler.jpg"
    },
    {
      id: 2,
      name: "Magruder Hall",
      lat: 40.1890,
      lng: -92.5880,
      skyboxIndex: 1, // Maps to "The Quad"
      description: "Science and research building",
      departments: ["Biology", "Chemistry", "Physics"]
    }
  ],
  
  athletic: [
    {
      id: 3,
      name: "Stokes Stadium",
      lat: 40.1925,
      lng: -92.5912,
      skyboxIndex: 0, // Maps to "Thousand Hills in Truman"
      description: "Football stadium",
      capacity: 5000,
      sports: ["Football"]
    },
    {
      id: 4,
      name: "Pershing Arena",
      lat: 40.1910,
      lng: -92.5905,
      skyboxIndex: 1, // Maps to "The Quad"
      description: "Basketball and volleyball arena",
      sports: ["Basketball", "Volleyball"]
    }
  ],
  
  residence: [
    {
      id: 5,
      name: "Missouri Hall",
      lat: 40.1870,
      lng: -92.5920,
      skyboxIndex: 0, // Maps to "Thousand Hills in Truman"
      description: "Freshman residence hall",
      capacity: 400,
      amenities: ["Laundry", "Study Lounges", "Kitchen"]
    }
  ],
  
  studentLife: [
    {
      id: 6,
      name: "Student Union Building",
      lat: 40.1882,
      lng: -92.5888,
      skyboxIndex: 1, // Maps to "The Quad"
      description: "Campus hub for student activities",
      services: ["Dining", "Bookstore", "Meeting Rooms"]
    }
  ]
};

// Helper function to get all buildings as flat array
function getAllBuildings() {
  return Object.values(buildingsData).flat();
}

// Helper function to get buildings by category
function getBuildingsByCategory(category) {
  return buildingsData[category] || [];
}

// Helper function to find building by ID
function getBuildingById(id) {
  return getAllBuildings().find(building => building.id === id);
}

// Make data and functions available globally (for script tag usage)
window.buildingsData = getAllBuildings();
window.getAllBuildings = getAllBuildings;
window.getBuildingsByCategory = getBuildingsByCategory;
window.getBuildingById = getBuildingById;

console.log('BuildingData.js loaded successfully');


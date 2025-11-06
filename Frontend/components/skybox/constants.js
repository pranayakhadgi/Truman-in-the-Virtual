// constants.js - Skybox configurations and constants

// Skybox configurations
const skyboxConfigs = [
  {
    name: "Thousand Hills in Truman",
    images: [
      "/public/field-skyboxes 2/FishPond/posx.jpg", "/public/field-skyboxes 2/FishPond/negx.jpg",
      "/public/field-skyboxes 2/FishPond/posy.jpg", "/public/field-skyboxes 2/FishPond/negy.jpg",
      "/public/field-skyboxes 2/FishPond/posz.jpg", "/public/field-skyboxes 2/FishPond/negz.jpg"
    ]
  },
  {
    name: "The Quad",
    images: [
      "/public/field-skyboxes 2/Sorsele3/posx.jpg", "/public/field-skyboxes 2/Sorsele3/negx.jpg",
      "/public/field-skyboxes 2/Sorsele3/posy.jpg", "/public/field-skyboxes 2/Sorsele3/negy.jpg",
      "/public/field-skyboxes 2/Sorsele3/posz.jpg", "/public/field-skyboxes 2/Sorsele3/negz.jpg"
    ]
  }
];

// Skybox radius constant
const SKYBOX_RADIUS = 500;
const ANNOTATION_OFFSET = 2; // Slightly inside sphere to avoid z-fighting

// Scene-specific scripts for text-to-speech
const sceneScripts = {
  "Thousand Hills in Truman": "Just a short drive west of Kirksville lies the stunning Thousand Hills State Park, a true natural treasure spanning over 3,000 acres with the centerpiece Forest Lake. Created in the early 1950s to supply water for the city, Forest Lake is surrounded by lush woods, savanna landscapes, and a network of hiking and mountain biking trails perfect for outdoor enthusiasts of all levels. The park offers a rich variety of recreational activities including fishing, boating, camping, and wildlife watching, making it a favorite escape for nature lovers and families alike.",
  "The Quad": "Welcome to Truman State University's iconic Quad, the vibrant heart of campus life. Once a shimmering lake, this space was transformed in 1924 after a fire at Baldwin Hall drained the water and filled the area with rubble, creating the peaceful grassy oasis you see today. Students flock here in sunny weather to play frisbee, take relaxing hammock naps, and enjoy spontaneous events ranging from barbecues and student radio promotions to lively snowball fights during Missouri winters. The Quad is more than just a green space—it's a communal hub where friendships form, creativity flourishes, and campus spirit thrives amidst the historic buildings that surround it."
};

// Make available globally for script tag usage
window.skyboxConfigs = skyboxConfigs;
window.sceneScripts = sceneScripts;
window.SKYBOX_RADIUS = SKYBOX_RADIUS;
window.ANNOTATION_OFFSET = ANNOTATION_OFFSET;

console.log('constants.js loaded successfully');


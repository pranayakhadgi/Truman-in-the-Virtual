# Project Scratchpad: Truman Virtual Tour

## 1. Vision
- **Objective**: Create an immersive 3D virtual tour for Truman State University.
- **Key Experience**: "Vibe-coded" but understood. User explores campus via 3D skyboxes, guided by a questionnaire.

## 2. The "Ground Zero" Philosophy
- **No Magic**: Understand every line of code functionality.
- **Documentation First**: Plan before implementing.
- **Incrementalism**: Small, understood commits every day.

## 3. Architecture Plan
- **Framework**: Next.js (App Router)
  - *Why*: Unified frontend/backend, easy Vercel deploy, file-based routing perfect for `Welcome -> Questionnaire -> Tour` flow.
- **Language**: TypeScript
  - *Why*: "Understanding the system" is easier when data structures are explicit.
- **Styling**: Tailwind CSS
  - *Why*: Standard, clean, composable.
- **3D Engine**: Three.js + React Three Fiber (R3F)
  - *Why*: Declarative 3D scenes fit the React mental model better than imperative vanilla Three.js.
- **Backend/DB**: Next.js Server Actions + MongoDB
  - *Why*: No need for a separate Express server container. Simpler "Serverless" architecture.

## 4. Immediate Next Steps
1.  [x] Clear old files.
2.  [ ] Pick the first small piece to build (e.g., "Hello World" with the chosen stack, or just the basic folder structure).
3.  [ ] Write the README for that small piece.

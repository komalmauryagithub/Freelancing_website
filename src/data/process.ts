import { ProcessStep } from "@/types";

export const processSteps: ProcessStep[] = [
  {
    number: "01",
    title: "Discovery & Planning",
    tagline: "Understanding project goals and defining clear milestones.",
    description: "Before writing any code, we align on exact requirements, user flows, database models, and delivery timelines. You receive a structured project roadmap.",
    deliverables: ["Product Roadmap", "Technical Architecture Spec", "Milestone Schedule"],
  },
  {
    number: "02",
    title: "UI/UX & Wireframing",
    tagline: "Modern layouts and responsive component structure.",
    description: "We design clean interfaces, mobile-first responsive wireframes, and layout patterns to ensure complete visual alignment before development starts.",
    deliverables: ["Figma / UI Wireframes", "Interactive Layout Preview", "Responsive Mobile Design"],
  },
  {
    number: "03",
    title: "Full-Stack Development",
    tagline: "Clean, robust engineering with React, Node & Express.",
    description: "Building responsive frontends with React, robust backends with Node.js & Express, and connecting secure databases (MongoDB or PostgreSQL) with regular preview links.",
    deliverables: ["Clean Git Commits", "Live Staging Previews", "Tested REST APIs & DB Schemas"],
  },
  {
    number: "04",
    title: "Testing & Optimization",
    tagline: "Rigorous quality checks across devices and browsers.",
    description: "Comprehensive testing for fast load times, smooth responsive behavior across mobile and desktop, secure API endpoints, and bug-free user experiences.",
    deliverables: ["Cross-Device Verification", "Speed Optimization", "API Security & Bug Fixes"],
  },
  {
    number: "05",
    title: "Cloud Launch & Handover",
    tagline: "Live deployment on Render with full documentation.",
    description: "Smooth rollout to production cloud hosting on Render with custom domain SSL, database configuration, and full source code handover with 30 days of post-launch assistance.",
    deliverables: ["Live Production Release", "Source Code Handover & Docs", "30-Day Post-Launch Support"],
  },
];

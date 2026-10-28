import { TechSkillCategory } from "@/types";

export const techStackData: TechSkillCategory[] = [
  {
    category: "Frontend Development",
    skills: [
      { name: "React 18", level: "Component Architecture & Hooks" },
      { name: "JavaScript (ES6+)", level: "Modern Async & DOM Logic" },
      { name: "HTML5 & CSS3", level: "Semantic Markup & Responsive Styling" },
      { name: "Tailwind CSS & Bootstrap", level: "Modern Utility-First UI" },
      { name: "Vite", level: "Fast Build & Bundling" },
    ],
  },
  {
    category: "Backend & APIs",
    skills: [
      { name: "Node.js", level: "Server-side Runtime Environment" },
      { name: "Express.js", level: "REST API Design & Middleware" },
      { name: "Python FastAPI", level: "High-Performance AI & Data Services" },
      { name: "Laravel REST API", level: "Backend Business Logic & Controllers" },
    ],
  },
  {
    category: "Database & Storage",
    skills: [
      { name: "MongoDB", level: "Document Storage & Mongoose ODM" },
      { name: "PostgreSQL", level: "Relational Data Modeling & Queries" },
      { name: "Cloudinary", level: "Cloud Media & Photo CDN" },
    ],
  },
  {
    category: "AI & Cloud Deployment",
    skills: [
      { name: "OpenAI API", level: "Generative AI & Streaming" },
      { name: "Render Cloud Hosting", level: "Web Service & DB Production Deploy" },
      { name: "RESTful Architecture", level: "Client-Server Asynchronous Data Flow" },
    ],
  },
];

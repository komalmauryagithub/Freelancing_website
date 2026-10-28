export interface Project {
  id: string;
  slug: string;
  title: string;
  tagline: string;
  description: string;
  category: "DYNAMIC_WEB_APPS" | "ECOMMERCE" | "ADMIN_CRM" | "BUSINESS_WEBSITES" | "API_INTEGRATION" | "REDESIGN_PERFORMANCE";
  clientName?: string | null;
  liveUrl?: string | null;
  githubUrl?: string | null;
  coverImage: string;
  images: string[];
  technologies: string[];
  challenge?: string | null;
  solution?: string | null;
  features: string[];
  sampleMetrics: string[];
  sortOrder: number;
  isFeatured: boolean;
  isPublished: boolean;
}

export interface ServiceItem {
  id: string;
  slug: string;
  title: string;
  shortDesc: string;
  fullDesc: string;
  category: string;
  iconName: string;
  priceStartingAt?: number | null;
  priceRange?: string;
  turnaroundTime?: string | null;
  deliverables: string[];
  processSteps: string[];
  isPopular?: boolean;
  isActive?: boolean;
}

export interface ProcessStep {
  number: string;
  title: string;
  tagline: string;
  description: string;
  deliverables: string[];
}

export interface TechSkillCategory {
  category: string;
  skills: {
    name: string;
    level: string;
    icon?: string;
  }[];
}

export interface TestimonialItem {
  id: string;
  quote: string;
  author: string;
  role: string;
  company: string;
  avatar: string;
  projectSlug?: string;
  projectTitle?: string;
  isSample: boolean;
}

export interface FaqItem {
  id: string;
  question: string;
  answer: string;
  category: "General" | "Process & Timeline" | "Pricing & Billing" | "Tech Stack & Handover";
}

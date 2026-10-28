import { FaqItem } from "@/types";

export const faqsData: FaqItem[] = [
  {
    id: "faq-1",
    question: "What is your typical project timeline?",
    answer: "Most standalone business websites and redesigns take 2 to 3 weeks. Comprehensive full-stack web applications, custom CRM platforms, and headless e-commerce stores typically range from 4 to 6 weeks depending on feature complexity and scope.",
    category: "Process & Timeline",
  },
  {
    id: "faq-2",
    question: "How do we handle payments and project milestones?",
    answer: "Projects are typically structured in milestones (e.g. 50% deposit upon kickoff and architecture spec, and 50% upon final production deployment and code handover). For larger multi-month engagements, we break work into 3 to 4 bi-weekly sprints with clear deliverables.",
    category: "Pricing & Billing",
  },
  {
    id: "faq-3",
    question: "Do I get full ownership of the source code and assets?",
    answer: "Yes, 100%. Upon settlement of final project invoices, all intellectual property, Figma design files, source repositories, documentation, and database schemas belong entirely to your company.",
    category: "Tech Stack & Handover",
  },
  {
    id: "faq-4",
    question: "Why Next.js App Router and Tailwind CSS over templates or WordPress?",
    answer: "Custom Next.js engineering gives your business unprecedented speed (sub-second load times), custom interaction fluidity, superior SEO ranking potential, and zero reliance on fragile third-party WordPress plugins that require constant patching or create security vulnerabilities.",
    category: "General",
  },
  {
    id: "faq-5",
    question: "Can you work with our existing backend or database?",
    answer: "Absolutely. We routinely integrate with existing PostgreSQL / MySQL databases, GraphQL / REST endpoints, headless CMSs (Sanity, Strapi, Contentful), and cloud services on Render, AWS, or Supabase.",
    category: "Tech Stack & Handover",
  },
  {
    id: "faq-6",
    question: "What happens after the project is launched?",
    answer: "Every project includes 30 days of complimentary post-launch support and bug fixes to ensure smooth operations. Afterwards, we offer flexible monthly maintenance and feature expansion retainers.",
    category: "General",
  },
];

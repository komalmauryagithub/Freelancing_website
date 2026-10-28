import { PrismaClient, ProjectCategory, UserRole, LeadStatus, ProjectRequestStatus, ProposalStatus, MilestoneStatus, InvoiceStatus, PaymentStatus } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting database seed with clearly identified demo data...");

  // 1. Seed Demo Users
  const adminUser = await prisma.user.upsert({
    where: { email: "alex@creativefreelancer.sample" },
    update: {},
    create: {
      email: "alex@creativefreelancer.sample",
      name: "Alex Vance (Lead Freelance Engineer)",
      role: UserRole.FREELANCER,
      bio: "Senior Full-Stack Engineer & UI/UX Specialist crafting bespoke digital experiences. (Sample Profile)",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80",
      company: "Studio Vanguard (Sample Studio)",
    },
  });

  const sampleClient = await prisma.user.upsert({
    where: { email: "sarah.chen@novatech.sample" },
    update: {},
    create: {
      email: "sarah.chen@novatech.sample",
      name: "Sarah Chen (Sample Client)",
      role: UserRole.CLIENT,
      bio: "VP of Product at Nova Technologies. (Sample Client Record)",
      company: "NovaTech Solutions (Sample Company)",
    },
  });

  console.log("✓ Seeded sample users:", adminUser.email, sampleClient.email);

  // 2. Seed 6 Core Services
  const servicesData = [
    {
      slug: "business-websites",
      title: "Business Websites",
      shortDesc: "High-impact, conversion-focused corporate and marketing websites with bespoke animation and lightning-fast performance.",
      fullDesc: "We build bespoke marketing and corporate websites that position your brand at the pinnacle of your industry. Leveraging Next.js App Router, Tailwind CSS, and Motion, each site delivers sub-second load times, flawless SEO rankings, and an unforgettable interactive visitor experience.",
      category: "Marketing & Presence",
      iconName: "Globe",
      priceStartingAt: 2500,
      turnaroundTime: "2-3 Weeks",
      deliverables: [
        "Custom responsive design & branding integration",
        "Sub-second load times & 95+ Core Web Vitals",
        "Modern CMS integration (Sanity / Strapi / MDX)",
        "On-page technical SEO & OpenGraph setup",
        "Accessible, keyboard-navigable interactive components",
      ],
      processSteps: [
        "1. Discovery & Content Architecture",
        "2. Wireframes & High-Fidelity UI",
        "3. Component Development & Motion",
        "4. SEO, Performance & Accessibility Audit",
        "5. Deployment & Handover Training",
      ],
      isPopular: true,
      isActive: true,
      sortOrder: 1,
    },
    {
      slug: "dynamic-web-applications",
      title: "Dynamic Web Applications",
      shortDesc: "Full-stack web applications featuring real-time reactivity, robust state management, and scalable cloud architecture.",
      fullDesc: "From custom SaaS portals to client-facing interactive tools, we engineer performant, type-safe web applications. Every layer is built with modular components, atomic state management, serverless compute, and clean data contracts.",
      category: "Full-Stack SaaS",
      iconName: "Layers",
      priceStartingAt: 4500,
      turnaroundTime: "4-6 Weeks",
      deliverables: [
        "Next.js App Router & TypeScript architecture",
        "Interactive dashboards & client portals",
        "Optimistic UI updates & reactive state",
        "Comprehensive input validation with Zod",
        "Scalable database schema & relations",
      ],
      processSteps: [
        "1. System Architecture & Data Modeling",
        "2. User Flows & Interface Wireframes",
        "3. Frontend & Backend Route Implementation",
        "4. End-to-End Testing & Optimization",
        "5. CI/CD Pipeline & Production Launch",
      ],
      isPopular: true,
      isActive: true,
      sortOrder: 2,
    },
    {
      slug: "crm-admin-dashboards",
      title: "CRM & Admin Dashboards",
      shortDesc: "Data-dense, intuitive control centers and management panels tailored precisely to your operational workflow.",
      fullDesc: "Tired of bloated off-the-shelf software? We build custom administrative dashboards, business CRM systems, and operational telemetry tools that give your team superpowers with real-time analytics, filtering, and role-based permissions.",
      category: "Internal Operations",
      iconName: "BarChart3",
      priceStartingAt: 3800,
      turnaroundTime: "3-5 Weeks",
      deliverables: [
        "High-density responsive data tables & charts",
        "Multi-parameter search, sort, and export (CSV/PDF)",
        "Role-based access control (RBAC)",
        "Custom workflow management & audit logs",
        "Keyboard shortcuts & high-efficiency ergonomics",
      ],
      processSteps: [
        "1. Workflow & KPI Requirements Mapping",
        "2. Information Architecture & UX Prototype",
        "3. Backend Schema & Query Optimization",
        "4. Interactive Charts & Data Visualization",
        "5. UAT & Team Onboarding",
      ],
      isPopular: false,
      isActive: true,
      sortOrder: 3,
    },
    {
      slug: "ecommerce-websites",
      title: "E-Commerce Websites",
      shortDesc: "High-converting headless storefronts with fluid product showcases, frictionless checkout, and instant page transitions.",
      fullDesc: "Elevate your digital commerce with tailored storefronts that blow standard templates out of the water. We integrate Shopify Storefront API, Stripe, or custom database catalogs with ultrafast Next.js SSR to minimize cart abandonment.",
      category: "Commerce",
      iconName: "ShoppingBag",
      priceStartingAt: 4200,
      turnaroundTime: "4-6 Weeks",
      deliverables: [
        "Headless storefront with instant page loads",
        "Dynamic cart drawer, wishlist & checkout flows",
        "Inventory catalog & multi-variant management",
        "Stripe / Payment gateway integration",
        "Automated transactional notification workflows",
      ],
      processSteps: [
        "1. Catalog Structure & Checkout Funnel Strategy",
        "2. Visual Design & Product Storytelling",
        "3. API Integration & Cart State Engine",
        "4. Security, Checkout & Payment Gateway Testing",
        "5. Launch & Conversion Tracking Setup",
      ],
      isPopular: false,
      isActive: true,
      sortOrder: 4,
    },
    {
      slug: "api-integration",
      title: "API Integration",
      shortDesc: "Seamless third-party API wiring, webhook orchestration, and resilient microservice connectors.",
      fullDesc: "Connect your disparate tools into a unified, automated digital ecosystem. We build robust API wrappers, secure webhook receivers, data transformations, and scheduled background workers that eliminate repetitive manual data entry.",
      category: "Backend & Automation",
      iconName: "Cpu",
      priceStartingAt: 1800,
      turnaroundTime: "1-2 Weeks",
      deliverables: [
        "Secure OAuth2 & API key authentication handling",
        "Resilient webhook listeners with idempotency",
        "Data synchronization pipelines with retry logic",
        "Rate-limit handling & background job processing",
        "Comprehensive API documentation & Postman collections",
      ],
      processSteps: [
        "1. API Endpoint & Schema Discovery",
        "2. Contract Definition & Middleware Scaffold",
        "3. Webhook Handling & Failure Recovery Logic",
        "4. Load & Resilience Testing",
        "5. Monitoring & Alerting Configuration",
      ],
      isPopular: false,
      isActive: true,
      sortOrder: 5,
    },
    {
      slug: "website-redesign-bug-fixing",
      title: "Website Redesign & Bug Fixing",
      shortDesc: "Modern visual overhauls, Core Web Vitals optimization, responsive fixes, and elimination of technical debt.",
      fullDesc: "Transform an outdated, sluggish, or buggy website into a modern, lightning-fast digital asset. We diagnose CSS layout glitches, resolve hydration errors, refactor messy legacy code, and elevate the overall aesthetic to modern studio standards.",
      category: "Optimization & Overhaul",
      iconName: "Wrench",
      priceStartingAt: 1500,
      turnaroundTime: "1-2 Weeks",
      deliverables: [
        "Comprehensive code & UX friction audit",
        "Resolution of critical bugs, memory leaks & broken flows",
        "Performance boost to 90+ Lighthouse score",
        "Mobile & cross-browser responsive layout repairs",
        "Design polish with modern typography & dark theme options",
      ],
      processSteps: [
        "1. Diagnostic Deep Dive & Issue Triage",
        "2. Performance & Accessibility Profiling",
        "3. Iterative Code Refactor & Bug Elimination",
        "4. Visual Elevation & Responsive Polish",
        "5. Verification & Before/After Metric Report",
      ],
      isPopular: false,
      isActive: true,
      sortOrder: 6,
    },
  ];

  for (const s of servicesData) {
    await prisma.service.upsert({
      where: { slug: s.slug },
      update: s,
      create: s,
    });
  }
  console.log("✓ Seeded 6 core services");

  // 3. Seed 5 Portfolio Projects with Rich Case Study Content
  const projectsData = [
    {
      slug: "sketchnest-art-learning",
      title: "SketchNest — Art Learning Web Platform",
      tagline: "An interactive online learning platform designed to help artists and beginners master sketching.",
      description: "An interactive online learning platform designed to help artists and beginners master sketching through structured stages, weekly drawing challenges, direct artwork uploads, and peer rating/feedback systems.",
      category: ProjectCategory.DYNAMIC_WEB_APPS,
      clientName: "Community Art Academy",
      liveUrl: "https://sketchnest.onrender.com",
      githubUrl: "https://github.com/komalmauryagithub/Sketchnest.git",
      coverImage: "/images/projects/sketchnest.svg",
      images: ["/images/projects/sketchnest.svg"],
      technologies: ["Node.js", "Express.js", "MongoDB", "JavaScript", "Bootstrap", "HTML5", "CSS3"],
      challenge: "Beginner artists often struggle with fragmented tutorials, lack of peer critique, and absence of a structured progressive curriculum to benchmark drawing improvements.",
      solution: "Built a full-stack community learning portal featuring progressive milestone stages, weekly community sketching prompts, multi-criteria artwork rating, and responsive media galleries.",
      features: [
        "Progressive sketching roadmap across beginner to advanced tiers",
        "Weekly drawing prompts with community leaderboard",
        "Direct student artwork upload with high-resolution image previews",
        "Peer feedback system with star ratings and constructive critique",
        "Mobile-first responsive layout powered by Bootstrap and custom CSS",
      ],
      sampleMetrics: [
        "Full-Stack Node.js & MongoDB architecture deployed on Render",
        "100% responsive cross-device layout with mobile upload support",
        "Real-time feedback & multi-criteria community rating engine",
      ],
      sortOrder: 1,
      isFeatured: true,
      isPublished: true,
    },
    {
      slug: "kfood-ecommerce-store",
      title: "KFOOD — Korean Food E-Commerce Store",
      tagline: "A responsive full-stack e-commerce web application specializing in themed Korean meals and snacks.",
      description: "A responsive full-stack e-commerce web application specializing in themed Korean meals and snacks, featuring dynamic catalog browsing, persistent shopping cart/wishlist management, and complete order processing workflows.",
      category: ProjectCategory.ECOMMERCE,
      clientName: "KFOOD Direct Retail",
      liveUrl: "https://kfood-1-mfqv.onrender.com",
      githubUrl: "https://github.com/komalmauryagithub/KFood",
      coverImage: "/images/projects/kfood-store.svg",
      images: ["/images/projects/kfood-store.svg"],
      technologies: ["React", "Node.js", "Express.js", "MongoDB", "JavaScript", "CSS3"],
      challenge: "Niche culinary food retailers need fast, appetite-inducing digital storefronts with seamless cart synchronization, dietary category filtering, and rapid checkout experiences.",
      solution: "Developed a React single-page storefront backed by an Express REST API and MongoDB, incorporating real-time cart state, wishlist persistence, spicy level badges, and streamlined order summaries.",
      features: [
        "Dynamic Korean food menu with spice level and dietary tags",
        "Persistent shopping cart with live price aggregation and tax totals",
        "Wishlist management allowing users to save favorite meal kits",
        "Full checkout and order lifecycle management pipeline",
        "Interactive product search and category filtering",
      ],
      sampleMetrics: [
        "Sub-second React component updates and instantaneous cart drawer",
        "Production MongoDB database schema supporting multi-item orders",
        "Live deployment on Render cloud infrastructure",
      ],
      sortOrder: 2,
      isFeatured: true,
      isPublished: true,
    },
    {
      slug: "ai-expense-business-analytics",
      title: "AI Expense & Business Analytics SaaS",
      tagline: "A production-ready financial analytics SaaS platform featuring real-time dashboards and AI assistant.",
      description: "A production-ready financial analytics SaaS platform featuring real-time financial dashboards, multi-period budget tracking, goal monitoring, automated PDF/CSV reports, and an intelligent AI Financial Assistant.",
      category: ProjectCategory.ADMIN_CRM,
      clientName: "FinTech SaaS Solution",
      liveUrl: "https://ai-expenses-and-business-analytics-1.onrender.com",
      githubUrl: "https://github.com/komalmauryagithub/Ai-Expenses-and-Business-analytics",
      coverImage: "/images/projects/ai-analytics.svg",
      images: ["/images/projects/ai-analytics.svg"],
      technologies: ["React 18", "Python FastAPI", "Laravel REST API", "PostgreSQL", "Tailwind CSS"],
      challenge: "Small businesses and freelancers find accounting software clunky, lack actionable spending forecasts, and spend hours compiling end-of-month financial reports.",
      solution: "Engineered a microservice-powered analytics portal combining a React 18 dashboard, high-speed Python FastAPI backend for AI assistant queries, Laravel for reliable transactions, and PostgreSQL.",
      features: [
        "Real-time operational cash flow and expense visual telemetry",
        "Intelligent AI Financial Assistant offering anomaly detection and savings tips",
        "Multi-period budget allocations with threshold alerts",
        "One-click automated export to presentation-ready PDF and CSV reports",
        "PostgreSQL relational data store ensuring audit-grade transaction integrity",
      ],
      sampleMetrics: [
        "Dual-engine architecture: Python FastAPI for AI + Laravel for core business logic",
        "Microsecond query speeds across historical expense ledgers",
        "Automated real-time financial reporting and variance analytics",
      ],
      sortOrder: 3,
      isFeatured: true,
      isPublished: true,
    },
    {
      slug: "ai-chatbot-portal",
      title: "AI Chatbot Portal",
      tagline: "An interactive AI chat dashboard integrating generative APIs to deliver real-time streaming responses.",
      description: "An interactive AI chat dashboard integrating generative APIs to deliver real-time streaming responses, optimized token management, and contextual prompt assistance.",
      category: ProjectCategory.API_INTEGRATION,
      clientName: "AI Workflow Hub",
      liveUrl: "https://ai-chatbot-m9sm.onrender.com",
      githubUrl: "https://github.com/komalmauryagithub/Ai-Chatbot",
      coverImage: "/images/projects/ai-chatbot.svg",
      images: ["/images/projects/ai-chatbot.svg"],
      technologies: ["Node.js", "Express.js", "JavaScript", "OpenAI API", "HTML5", "CSS3"],
      challenge: "Integrating Large Language Models into business interfaces requires resilient error recovery, rate limit backoff, streaming token rendering, and cost-effective prompt management.",
      solution: "Constructed a lightweight, resilient Node/Express portal with Server-Sent Events (SSE) streaming, model selection, prompt preset library, and session memory handling.",
      features: [
        "Zero-lag streaming text responses with typing indicator",
        "Token usage telemetry and prompt engineering optimization",
        "Curated prompt library for code generation, writing, and debugging",
        "Markdown rendering with syntax highlighting and copy-to-clipboard",
        "Secure server-side API key protection with rate limiting",
      ],
      sampleMetrics: [
        "Real-time token streaming with low time-to-first-byte (TTFB)",
        "Protected server-side proxy preventing client API key exposure",
        "Full responsive chat window across mobile and desktop",
      ],
      sortOrder: 4,
      isFeatured: true,
      isPublished: true,
    },
    {
      slug: "memora-event-memory-calendar",
      title: "MEMORA — Event & Memory Calendar",
      tagline: "An aesthetic, scrapbook-style event calendar and memory-keeping platform with polaroid styling.",
      description: "An aesthetic, scrapbook-style event calendar and memory-keeping platform where users can schedule events on an interactive monthly grid, attach photos with polaroid styling, write captions, and track milestones on an upcoming countdown timeline.",
      category: ProjectCategory.DYNAMIC_WEB_APPS,
      clientName: "Lifestyle & Memory App",
      liveUrl: "https://modera-2dh0.onrender.com",
      githubUrl: "https://github.com/komalmauryagithub/Modera",
      coverImage: "/images/projects/memora-calendar.svg",
      images: ["/images/projects/memora-calendar.svg"],
      technologies: ["React 18", "Vite", "Node.js", "Express.js", "MongoDB", "Cloudinary"],
      challenge: "Standard calendars are utilitarian and cold; people want a warm, nostalgic way to celebrate upcoming milestones, save polaroid snapshots, and visually preserve life memories.",
      solution: "Designed an aesthetic scrapbook interface in React 18, featuring a dynamic monthly grid, Cloudinary cloud image uploads, polaroid tilt styling, and real-time event countdown timers.",
      features: [
        "Interactive monthly event grid with custom colored category badges",
        "Scrapbook photo uploads with Cloudinary CDN integration and polaroid tilt effects",
        "Real-time countdown timer to upcoming birthdays, anniversaries, and milestones",
        "Journaling caption editor with date tags and memory archives",
        "Fast, lightweight client bundle powered by Vite and React 18",
      ],
      sampleMetrics: [
        "Cloudinary cloud storage integration for fast photo CDN delivery",
        "Instant Vite-powered client state updates on schedule changes",
        "Production deployment on Render cloud infrastructure",
      ],
      sortOrder: 5,
      isFeatured: true,
      isPublished: true,
    },
  ];

  for (const p of projectsData) {
    await prisma.portfolioProject.upsert({
      where: { slug: p.slug },
      update: p,
      create: p,
    });
  }
  console.log("✓ Seeded 5 portfolio projects");

  // 4. Seed Sample Lead, Project Request, Proposal, and Invoices
  const sampleLead = await prisma.lead.create({
    data: {
      referenceNumber: "LEAD-2025-DEMO01",
      name: "Marcus Vance (Sample Inquirer)",
      email: "marcus@sampleventures.io",
      company: "Vance Ventures (Sample)",
      budgetRange: "$5,000 - $10,000",
      timeline: "Within 1 Month",
      message: "We need a complete redesign and interactive web application for our venture deal pipeline. (Sample Inquiry)",
      status: LeadStatus.QUALIFIED,
      internalNotes: "High intent client inquiry. Recommended starting with Discovery session.",
    },
  });

  const sampleRequest = await prisma.projectRequest.create({
    data: {
      leadId: sampleLead.id,
      userId: sampleClient.id,
      title: "Interactive Deal Pipeline Dashboard (Sample Request)",
      description: "A high-performance portal to track venture deals, syndicates, and portfolio returns. (Sample Demo Request)",
      budget: "$8,000",
      status: ProjectRequestStatus.PROPOSAL_SENT,
    },
  });

  const sampleProposal = await prisma.proposal.create({
    data: {
      projectRequestId: sampleRequest.id,
      title: "Proposal: Deal Pipeline Architecture & Implementation (Sample)",
      summary: "End-to-end delivery of the bespoke venture pipeline dashboard with Next.js, Tailwind and PostgreSQL.",
      totalAmount: 8500,
      currency: "USD",
      status: ProposalStatus.SENT,
      terms: "50% upfront deposit upon milestone approval, 50% upon final production launch.",
      milestones: {
        create: [
          {
            title: "Milestone 1: Architecture, Data Schema & Wireframes",
            description: "System design, entity relationships, and clickable Figma prototypes.",
            amount: 4250,
            order: 1,
            status: MilestoneStatus.APPROVED,
          },
          {
            title: "Milestone 2: Component Development, API & Launch",
            description: "Frontend implementation, database integration, testing, and production deployment.",
            amount: 4250,
            order: 2,
            status: MilestoneStatus.PENDING,
          },
        ],
      },
    },
  });

  const sampleInvoice = await prisma.invoice.create({
    data: {
      invoiceNumber: "INV-2025-001-SAMPLE",
      projectRequestId: sampleRequest.id,
      proposalId: sampleProposal.id,
      amount: 4250,
      tax: 0,
      total: 4250,
      currency: "USD",
      status: InvoiceStatus.PAID,
      paidAt: new Date(),
      payments: {
        create: {
          amount: 4250,
          currency: "USD",
          status: PaymentStatus.COMPLETED,
          paymentMethod: "Stripe Card (Sample)",
          transactionRef: "tx_sample_test_987654",
          paidAt: new Date(),
        },
      },
    },
  });

  // 5. Seed Sample Bookings
  await prisma.booking.create({
    data: {
      userId: sampleClient.id,
      name: "Marcus Vance (Sample Inquirer)",
      email: "marcus@sampleventures.io",
      topic: "Discovery Call: Deal Pipeline Dashboard (Sample)",
      notes: "Looking to review architecture options and estimated timeline.",
      scheduledAt: new Date(Date.now() + 86400000 * 2), // 2 days from now
      durationMinutes: 30,
      meetingUrl: "https://meet.google.com/sample-room-alex",
      status: "CONFIRMED",
    },
  });

  // 6. Seed Sample Notifications
  await prisma.notification.create({
    data: {
      userId: adminUser.id,
      title: "New Qualified Lead (Sample)",
      message: "Marcus Vance submitted a $5k-$10k project inquiry for a deal pipeline dashboard.",
      type: "SUCCESS",
      link: "/admin/leads",
    },
  });

  console.log("✓ Seeded sample leads, proposals, invoices, and bookings");
  console.log("🎉 Database seeding completed successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed with error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

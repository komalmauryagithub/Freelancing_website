export interface ProjectTypeOption {
  id: string;
  title: string;
  tagline: string;
  icon: string;
  typicalTimeline: string;
  availableFeatures: {
    id: string;
    label: string;
    description: string;
  }[];
}

export const PROJECT_TYPES: ProjectTypeOption[] = [
  {
    id: "business_website",
    title: "Business Website",
    tagline: "High-impact brand and corporate site with custom interactive motion.",
    icon: "Globe",
    typicalTimeline: "2-3 Weeks",
    availableFeatures: [
      { id: "motion_craft", label: "Fluid Motion & Animations", description: "Hardware-accelerated micro-interactions and smooth page transitions" },
      { id: "cms_integration", label: "Headless CMS Integration", description: "Sanity, Strapi, or MDX blog management" },
      { id: "technical_seo", label: "Technical SEO & Schema", description: "Structured metadata, OpenGraph cards, and Core Web Vitals optimization" },
      { id: "interactive_forms", label: "Dynamic Lead Capture Forms", description: "Multi-step inquiry forms with server validation" },
      { id: "localization", label: "Multi-Language Localization", description: "i18n internationalization and locale routing" },
      { id: "newsletter", label: "Newsletter & CRM Sync", description: "Direct synchronization with HubSpot, Mailchimp, or ConvertKit" },
    ],
  },
  {
    id: "dynamic_application",
    title: "Dynamic Web Application",
    tagline: "Custom reactive web platform with database, authentication, and state.",
    icon: "Layers",
    typicalTimeline: "4-6 Weeks",
    availableFeatures: [
      { id: "auth_rbac", label: "Authentication & Role Permissions", description: "Secure session management, password reset, and access levels" },
      { id: "realtime_updates", label: "Reactive Real-Time Updates", description: "Live websockets or optimistic UI state synchronizations" },
      { id: "data_modeling", label: "Relational Database & Migrations", description: "PostgreSQL schema, indexes, and type-safe Prisma ORM" },
      { id: "rest_graphql_api", label: "REST / Serverless Route Handlers", description: "End-to-end type safety with Zod request validation" },
      { id: "file_storage", label: "Protected Cloud File Storage", description: "Secure S3/R2 direct uploads with presigned URLs" },
      { id: "background_jobs", label: "Background Job Queues", description: "Asynchronous task execution, scheduled cron jobs, and email dispatch" },
    ],
  },
  {
    id: "crm_admin_panel",
    title: "CRM & Admin Panel",
    tagline: "Data-dense management panel tailored specifically to your business operations.",
    icon: "BarChart3",
    typicalTimeline: "3-5 Weeks",
    availableFeatures: [
      { id: "filterable_tables", label: "Multi-Column Filterable Tables", description: "Instant search, multi-facet sorting, and column toggling" },
      { id: "rbac_audit", label: "Role-Based Access & Audit Logs", description: "Granular permissions and non-repudiation audit trails" },
      { id: "export_tools", label: "CSV / Excel / PDF Export", description: "One-click data export and automated reporting" },
      { id: "kanban_pipeline", label: "Visual Kanban Pipeline", description: "Drag-and-drop opportunity and status transitions" },
      { id: "telemetry_charts", label: "Interactive Operational Charts", description: "Recharts visualizations for revenue, cohorts, and volume" },
      { id: "keyboard_shortcuts", label: "High-Efficiency Keyboard Ergo", description: "Command palette (Cmd+K) and fast data entry shortcuts" },
    ],
  },
  {
    id: "ecommerce",
    title: "E-Commerce Storefront",
    tagline: "Ultra-fast headless commerce store with instant cart and frictionless checkout.",
    icon: "ShoppingBag",
    typicalTimeline: "4-6 Weeks",
    availableFeatures: [
      { id: "instant_cart", label: "Dynamic Slide-Over Cart Drawer", description: "Persistent client cart with optimistic quantity adjustments" },
      { id: "catalog_variants", label: "Multi-Variant Inventory Catalog", description: "Colorway pickers, size selectors, and live stock tracking" },
      { id: "payment_gateways", label: "Stripe / Shopify Storefront API", description: "PCI-compliant checkout, Apple Pay, and Google Pay integration" },
      { id: "upsell_engine", label: "Upsell & Recommendations Engine", description: "Dynamic related product carousels based on cart contents" },
      { id: "promo_codes", label: "Discount Codes & Gift Cards", description: "Cart-level validation for percentage and fixed promotions" },
      { id: "order_tracking", label: "Transactional Email & Tracking", description: "Automated receipts, tracking links, and order history portal" },
    ],
  },
  {
    id: "dashboard",
    title: "Telemetry & KPI Dashboard",
    tagline: "Visual command center aggregating real-time metrics and system health.",
    icon: "Cpu",
    typicalTimeline: "2-4 Weeks",
    availableFeatures: [
      { id: "kpi_visuals", label: "Bespoke Metric Cards & Gauges", description: "Visual indicators with percentage trends vs previous periods" },
      { id: "date_filters", label: "Dynamic Date Range Filtering", description: "Today, 7D, 30D, Quarter, and Custom date range comparisons" },
      { id: "alert_thresholds", label: "Metric Threshold Alerting", description: "Visual warning states when KPI values breach boundaries" },
      { id: "multi_tenant", label: "Multi-Tenant Workspace Switcher", description: "Seamless switching between organizational accounts" },
      { id: "theme_modes", label: "Dark Charcoal / High-Contrast Theme", description: "Ergonomic interface designed for extended operational monitoring" },
    ],
  },
  {
    id: "custom",
    title: "Custom Full-Stack Project",
    tagline: "Unique architecture, legacy code refactoring, or specialized API orchestration.",
    icon: "Wrench",
    typicalTimeline: "Custom",
    availableFeatures: [
      { id: "api_orchestration", label: "Third-Party API & Webhook Hub", description: "Idempotent event processing, HMAC signatures, and retry queues" },
      { id: "legacy_migration", label: "Legacy Codebase Migration", description: "Incremental migration to modern Next.js App Router" },
      { id: "performance_audit", label: "Core Web Vitals Rescue & Polish", description: "Elimination of layout shifts and reduction of bundle weight" },
      { id: "ai_wiring", label: "AI & LLM Model Integration", description: "Streaming completions, embedding search, and agentic workflows" },
    ],
  },
];

export const BUDGET_RANGES = [
  "$2,500 — $5,000",
  "$5,000 — $10,000",
  "$10,000 — $20,000",
  "$20,000+",
];

export const TIMELINES = [
  "Urgent (< 2 Weeks)",
  "2 — 4 Weeks",
  "1 — 2 Months",
  "Flexible / Planning Stage",
];

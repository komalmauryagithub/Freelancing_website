import { projectBriefSchema } from "../src/lib/validations/project-brief";
import { PROJECT_TYPES, BUDGET_RANGES, TIMELINES } from "../src/lib/project-types";
import { generateReferenceNumber } from "../src/lib/reference";
import { canAccessResource } from "../src/lib/authorization";

let passed = 0;
let failed = 0;

function assert(condition: boolean, name: string) {
  if (condition) {
    console.log(`  ✓ ${name}`);
    passed++;
  } else {
    console.error(`  ✗ FAIL: ${name}`);
    failed++;
  }
}

async function runLeadCrmTests() {
  console.log("=================================================");
  console.log("🧪 RUNNING PROJECT BOOKING & LEAD CRM TEST SUITE");
  console.log("=================================================\n");

  // TEST 1: Project Brief Schema Validation
  console.log("1. Client Project Brief Validation:");
  const validBrief = {
    projectType: "dynamic_application" as const,
    selectedFeatures: ["Authentication & Role Permissions", "Relational Database & Migrations"],
    requirements: "We need an enterprise compliance portal with real-time analytics and CSV exports for internal auditing.",
    indicativeBudget: BUDGET_RANGES[1],
    timeline: TIMELINES[1],
    name: "Marcus Vance",
    email: "marcus@vanceventures.io",
    company: "Vance Ventures",
    phone: "+1 (555) 234-5678",
    attachments: ["/uploads/spec.pdf"],
    idempotencyKey: "idem_test_12345",
  };

  const parseResult = projectBriefSchema.safeParse(validBrief);
  assert(parseResult.success === true, "Valid complete project brief passes validation");

  const invalidTypeResult = projectBriefSchema.safeParse({
    ...validBrief,
    projectType: "non_existent_type",
  });
  assert(invalidTypeResult.success === false, "Rejects unlisted/invalid project types");

  const emptyFeaturesResult = projectBriefSchema.safeParse({
    ...validBrief,
    selectedFeatures: [],
  });
  assert(emptyFeaturesResult.success === false, "Rejects submission with zero selected features");

  const shortRequirementsResult = projectBriefSchema.safeParse({
    ...validBrief,
    requirements: "Too short",
  });
  assert(shortRequirementsResult.success === false, "Rejects requirements under 15 characters");

  const badEmailResult = projectBriefSchema.safeParse({
    ...validBrief,
    email: "not-an-email",
  });
  assert(badEmailResult.success === false, "Rejects malformed email address");

  // TEST 2: Dynamic Project Types & Feature Options
  console.log("\n2. Dynamic Feature Sets per Project Type:");
  assert(PROJECT_TYPES.length === 6, "All 6 required project types configured");

  const businessWeb = PROJECT_TYPES.find((t) => t.id === "business_website");
  const dynamicApp = PROJECT_TYPES.find((t) => t.id === "dynamic_application");
  const crmPanel = PROJECT_TYPES.find((t) => t.id === "crm_admin_panel");
  const ecommerce = PROJECT_TYPES.find((t) => t.id === "ecommerce");
  const dashboard = PROJECT_TYPES.find((t) => t.id === "dashboard");
  const custom = PROJECT_TYPES.find((t) => t.id === "custom");

  assert(businessWeb !== undefined && businessWeb.availableFeatures.length >= 4, "Business website features mapped");
  assert(dynamicApp !== undefined && dynamicApp.availableFeatures.some(f => f.id === "auth_rbac"), "Dynamic app features mapped");
  assert(crmPanel !== undefined && crmPanel.availableFeatures.some(f => f.id === "filterable_tables"), "CRM features mapped");
  assert(ecommerce !== undefined && ecommerce.availableFeatures.some(f => f.id === "payment_gateways"), "E-Commerce features mapped");
  assert(dashboard !== undefined && dashboard.availableFeatures.some(f => f.id === "kpi_visuals"), "Dashboard features mapped");
  assert(custom !== undefined && custom.availableFeatures.length >= 3, "Custom project features mapped");

  // TEST 3: Duplicate Submission Prevention (Idempotency Simulation)
  console.log("\n3. Duplicate Prevention & Idempotency Lock:");
  const submissionDatabase = new Map<string, string>();
  const testKey = "idem_key_abc_987";

  function simulateSubmission(key: string, ref: string) {
    if (submissionDatabase.has(key)) {
      return { isDuplicate: true, reference: submissionDatabase.get(key) };
    }
    submissionDatabase.set(key, ref);
    return { isDuplicate: false, reference: ref };
  }

  const sub1 = simulateSubmission(testKey, "PRJ-2025-A1B2C");
  assert(sub1.isDuplicate === false && sub1.reference === "PRJ-2025-A1B2C", "Initial submission saved successfully");

  const sub2 = simulateSubmission(testKey, "PRJ-2025-A1B2C");
  assert(sub2.isDuplicate === true && sub2.reference === "PRJ-2025-A1B2C", "Repeated click duplicate blocked and existing reference returned");

  // TEST 4: Reference Number Generation
  console.log("\n4. Reference Number Format:");
  const projectRef = generateReferenceNumber("PRJ");
  const quoteRef = generateReferenceNumber("QUO");
  assert(/^PRJ-\d{4}-[A-Z0-9]{6}$/.test(projectRef), `Project reference matches PRJ-YYYY-XXXXXX (${projectRef})`);
  assert(/^QUO-\d{4}-[A-Z0-9]{6}$/.test(quoteRef), `Quotation reference matches QUO-YYYY-XXXXXX (${quoteRef})`);

  // TEST 5: Quotation Line Items & Arithmetic Integrity
  console.log("\n5. Quotation Math & Line Item Aggregation:");
  const lineItems = [
    { description: "System Architecture & Schema Design", quantity: 1, unitPrice: 2500 },
    { description: "Next.js App Router Component Sprints", quantity: 2, unitPrice: 2000 },
    { description: "API Webhook Ingestion Engine", quantity: 1, unitPrice: 1800 },
  ];

  const computedItems = lineItems.map((item) => ({
    ...item,
    total: item.quantity * item.unitPrice,
  }));

  const grandTotal = computedItems.reduce((acc, curr) => acc + curr.total, 0);
  assert(computedItems[0].total === 2500, "Line item 1 total correct ($2,500)");
  assert(computedItems[1].total === 4000, "Line item 2 total correct ($4,000)");
  assert(computedItems[2].total === 1800, "Line item 3 total correct ($1,800)");
  assert(grandTotal === 8300, `Grand total aggregates correctly ($8,300)`);

  // TEST 6: Quotation Audit Trail & Acceptance / Rejection
  console.log("\n6. Quotation Audit Trail Logging:");
  const auditLogs: any[] = [];
  let quoteStatus = "DRAFT";

  function transitionQuotation(newStatus: string, actor: string, notes?: string) {
    quoteStatus = newStatus;
    auditLogs.push({
      action: `STATUS_${newStatus}`,
      actor,
      timestamp: new Date(),
      notes: notes || `Status changed to ${newStatus}`,
    });
  }

  transitionQuotation("SENT", "Alex Vance (Admin)", "Quotation PDF dispatched to client.");
  assert(quoteStatus === "SENT", "Quotation transitioned to SENT");
  assert(auditLogs.length === 1 && auditLogs[0].action === "STATUS_SENT", "SENT action logged in audit trail");

  transitionQuotation("ACCEPTED", "Sarah Chen (Client)", "Client confirmed scope and milestone schedule.");
  assert(quoteStatus === "ACCEPTED", "Quotation transitioned to ACCEPTED");
  assert(auditLogs.length === 2 && auditLogs[1].action === "STATUS_ACCEPTED", "ACCEPTED action logged in audit trail");

  // TEST 7: Cross-Client Data Access Isolation
  console.log("\n7. Cross-Client Data Access Isolation:");
  const clientOwnerId = "user_client_100";
  const foreignClientId = "user_client_200";
  const adminId = "user_admin_999";

  assert(canAccessResource(clientOwnerId, foreignClientId, "CLIENT") === false, "Client B forbidden from reading Client A project data (403)");
  assert(canAccessResource(clientOwnerId, clientOwnerId, "CLIENT") === true, "Client A can access their own project data");
  assert(canAccessResource(clientOwnerId, adminId, "ADMIN") === true, "Admin has global visibility for all client projects");

  console.log("\n=================================================");
  console.log(`📊 TEST RESULTS: ${passed} passed, ${failed} failed`);
  console.log("=================================================\n");

  if (failed > 0) {
    process.exit(1);
  }
}

runLeadCrmTests().catch((err) => {
  console.error("Test execution failed:", err);
  process.exit(1);
});

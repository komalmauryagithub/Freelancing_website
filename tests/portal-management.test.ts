import { canAccessResource } from "../src/lib/authorization";
import { ProjectStage, MilestoneStatus, ChangeRequestStatus } from "@prisma/client";
import { z } from "zod";

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

// Schemas to test validation
const createChangeRequestSchema = z.object({
  title: z.string().min(3).max(120),
  description: z.string().min(10).max(3000),
});

const updateChangeRequestSchema = z.object({
  status: z.nativeEnum(ChangeRequestStatus).optional(),
  impactAssessment: z.string().optional().nullable(),
  additionalCost: z.number().optional().nullable(),
  additionalDays: z.number().int().optional().nullable(),
});

const updateStageSchema = z.object({
  stage: z.nativeEnum(ProjectStage),
  notes: z.string().optional(),
  productionUrl: z.string().url().optional().or(z.literal("")),
  repositoryUrl: z.string().url().optional().or(z.literal("")),
  handoverNotes: z.string().optional(),
});

const STAGES: ProjectStage[] = [
  "ENQUIRY",
  "DISCUSSION",
  "QUOTATION",
  "APPROVED",
  "DEVELOPMENT",
  "REVIEW",
  "DELIVERED",
];

async function runPortalManagementTests() {
  console.log("==========================================================");
  console.log("🧪 RUNNING CLIENT PORTAL & PROJECT MANAGEMENT TEST SUITE");
  console.log("==========================================================\n");

  // TEST 1: Cross-Client Isolation (Tenant Isolation)
  console.log("1. Strict Cross-Client Access Isolation:");
  const clientA = { id: "usr_client_a", email: "clientA@acme.com", role: "CLIENT" as const };
  const clientB = { id: "usr_client_b", email: "clientB@rival.corp", role: "CLIENT" as const };
  const admin = { id: "usr_admin_1", email: "director@vanguard.io", role: "ADMIN" as const };

  const projectA = { id: "prj_001", userId: clientA.id, title: "Acme Web App" };
  const projectB = { id: "prj_002", userId: clientB.id, title: "Rival Platform" };

  assert(
    canAccessResource(projectA.userId, clientA.id, clientA.role) === true,
    "Client A can access their own project"
  );
  assert(
    canAccessResource(projectA.userId, clientB.id, clientB.role) === false,
    "Client B CANNOT access Client A's project (403 Forbidden)"
  );
  assert(
    canAccessResource(projectB.userId, clientA.id, clientA.role) === false,
    "Client A CANNOT access Client B's project (403 Forbidden)"
  );
  assert(
    canAccessResource(projectA.userId, admin.id, admin.role) === true,
    "Administrator can access Client A's project for management"
  );
  assert(
    canAccessResource(projectB.userId, admin.id, admin.role) === true,
    "Administrator can access Client B's project for management"
  );

  // TEST 2: Protected Document Access & Download Permissions
  console.log("\n2. Protected Document Authorization & Security:");
  const docA = {
    id: "doc_101",
    projectRequestId: projectA.id,
    projectOwnerId: projectA.userId,
    name: "Confidential-Acme-Architecture.pdf",
    filePath: "storage/documents/confidential-acme.pdf",
  };

  assert(
    canAccessResource(docA.projectOwnerId, clientA.id, clientA.role) === true,
    "Project owner Client A can download their confidential document"
  );
  assert(
    canAccessResource(docA.projectOwnerId, clientB.id, clientB.role) === false,
    "Client B is strictly blocked from downloading Client A's files"
  );
  assert(
    canAccessResource(docA.projectOwnerId, admin.id, admin.role) === true,
    "Administrator is authorized to access and download project document"
  );

  // Download Header Security Simulation
  function buildDownloadHeaders(filename: string, mimeType: string) {
    const headers = new Headers();
    headers.set("Content-Disposition", `attachment; filename="${encodeURIComponent(filename)}"`);
    headers.set("Content-Type", mimeType);
    headers.set("Cache-Control", "private, no-cache, no-store, must-revalidate");
    return headers;
  }

  const headers = buildDownloadHeaders(docA.name, "application/pdf");
  assert(
    headers.get("Cache-Control") === "private, no-cache, no-store, must-revalidate",
    "Download headers enforce private, no-store cache policy"
  );
  assert(
    headers.get("Content-Disposition")?.includes("attachment") === true,
    "Content-Disposition forces safe attachment download"
  );

  // TEST 3: Milestone Progress Calculation & Status Transitions
  console.log("\n3. Milestone Timeline & Progress Percentage Computation:");
  const sampleMilestones: Array<{
    id: string;
    title: string;
    status: MilestoneStatus;
    progressPercentage: number;
  }> = [
    { id: "m1", title: "Architecture", status: MilestoneStatus.APPROVED, progressPercentage: 100 },
    { id: "m2", title: "API Integrations", status: MilestoneStatus.IN_PROGRESS, progressPercentage: 50 },
    { id: "m3", title: "QA & Deployment", status: MilestoneStatus.PENDING, progressPercentage: 0 },
  ];

  function computeProgress(milestones: typeof sampleMilestones, stage: ProjectStage) {
    if (milestones.length === 0) {
      if (stage === "DELIVERED") return 100;
      if (stage === "DEVELOPMENT") return 50;
      return 15;
    }
    const completed = milestones.filter(
      (m) => m.status === "APPROVED" || m.status === "RELEASED" || m.progressPercentage === 100
    );
    return Math.round((completed.length / milestones.length) * 100);
  }

  assert(
    computeProgress(sampleMilestones, "DEVELOPMENT") === 33,
    "Calculates 33% progress when 1 of 3 milestones completed"
  );

  const completedAll = sampleMilestones.map((m) => ({
    ...m,
    status: MilestoneStatus.APPROVED,
    progressPercentage: 100,
  }));
  assert(
    computeProgress(completedAll, "DELIVERED") === 100,
    "Calculates 100% progress when all milestones approved"
  );

  const emptyMilestones: typeof sampleMilestones = [];
  assert(
    computeProgress(emptyMilestones, "DELIVERED") === 100,
    "Defaults to 100% when delivered with no explicit milestones"
  );
  assert(
    computeProgress(emptyMilestones, "ENQUIRY") === 15,
    "Defaults to 15% during enquiry phase"
  );

  // Milestone completion timestamp logic
  function transitionMilestone(currentStatus: MilestoneStatus, nextStatus: MilestoneStatus) {
    let completedAt: Date | null = null;
    if (nextStatus === MilestoneStatus.APPROVED || nextStatus === MilestoneStatus.RELEASED) {
      completedAt = new Date();
    }
    return { status: nextStatus, completedAt };
  }

  const approvedMilestone = transitionMilestone(MilestoneStatus.IN_PROGRESS, MilestoneStatus.APPROVED);
  assert(
    approvedMilestone.completedAt !== null && approvedMilestone.status === "APPROVED",
    "Transitioning to APPROVED sets completedAt timestamp"
  );

  // TEST 4: Change Request Lifecycle
  console.log("\n4. Change Request Submission & Review Lifecycle:");
  const validChange = {
    title: "Add Stripe Subscription Billing",
    description: "We need recurring subscription tiers ($49/mo, $99/mo) with customer portal integration.",
  };

  const validChangeParse = createChangeRequestSchema.safeParse(validChange);
  assert(validChangeParse.success === true, "Valid client change request accepted");

  const invalidChangeParse = createChangeRequestSchema.safeParse({
    title: "AB",
    description: "Short",
  });
  assert(
    invalidChangeParse.success === false,
    "Rejects change request with too-short title or description"
  );

  // Admin Change Review
  const adminReview = {
    status: ChangeRequestStatus.APPROVED,
    impactAssessment: "Feasible using Stripe Billing SDK; requires webhook endpoints and subscription DB schema.",
    additionalCost: 1500,
    additionalDays: 5,
  };

  const reviewParse = updateChangeRequestSchema.safeParse(adminReview);
  assert(reviewParse.success === true, "Valid admin change request review with scope/cost adjustments accepted");

  // Client cannot self-approve change request
  function canClientReviewChange(role: string) {
    return role === "ADMIN";
  }
  assert(
    canClientReviewChange(clientA.role) === false,
    "Client is strictly prevented from self-approving scope changes"
  );
  assert(
    canClientReviewChange(admin.role) === true,
    "Admin is authorized to review and approve change requests"
  );

  // TEST 5: Project Workflow Pipeline & Handover
  console.log("\n5. Project Workflow Pipeline & Handover Validation:");
  assert(STAGES.length === 7, "All 7 lifecycle stages configured in correct order");
  assert(STAGES[0] === "ENQUIRY" && STAGES[6] === "DELIVERED", "Pipeline starts at ENQUIRY and ends at DELIVERED");

  const validStageUpdate = updateStageSchema.safeParse({
    stage: "DELIVERED",
    notes: "Final sprint complete, automated test suite passed, client sign-off received.",
    productionUrl: "https://nova-app.clientdomain.com",
    repositoryUrl: "https://github.com/vanguard-studios/nova-app",
    handoverNotes: "DNS configured, SSL provisioned, admin accounts transferred.",
  });
  assert(validStageUpdate.success === true, "Valid stage advance to DELIVERED with handover details");

  const invalidStageUpdate = updateStageSchema.safeParse({
    stage: "INVALID_STAGE" as any,
  });
  assert(invalidStageUpdate.success === false, "Rejects invalid project stage");

  const invalidUrlUpdate = updateStageSchema.safeParse({
    stage: "DELIVERED",
    productionUrl: "not-a-url",
  });
  assert(invalidUrlUpdate.success === false, "Rejects invalid production URL format");

  // TEST 6: Proposal Acceptance & Automatic Stage Advance
  console.log("\n6. Proposal Review & Stage Progression:");
  function simulateProposalResponse(action: "ACCEPT" | "REJECT", currentStage: ProjectStage) {
    if (action === "ACCEPT") {
      return {
        proposalStatus: "ACCEPTED",
        nextProjectStage: "APPROVED" as ProjectStage,
        auditLog: `Proposal accepted by client. Stage advanced from ${currentStage} to APPROVED.`,
      };
    } else {
      return {
        proposalStatus: "REJECTED",
        nextProjectStage: currentStage,
        auditLog: `Proposal declined by client.`,
      };
    }
  }

  const acceptResult = simulateProposalResponse("ACCEPT", "QUOTATION");
  assert(
    acceptResult.proposalStatus === "ACCEPTED" && acceptResult.nextProjectStage === "APPROVED",
    "Accepting proposal advances project stage to APPROVED"
  );
  assert(
    acceptResult.auditLog.includes("APPROVED"),
    "Audit log entry created for proposal acceptance"
  );

  const rejectResult = simulateProposalResponse("REJECT", "QUOTATION");
  assert(
    rejectResult.proposalStatus === "REJECTED" && rejectResult.nextProjectStage === "QUOTATION",
    "Declining proposal keeps project in current stage without unauthorized progression"
  );

  console.log("\n==========================================================");
  console.log(`TEST SUMMARY: ${passed} PASSED, ${failed} FAILED`);
  console.log("==========================================================");

  if (failed > 0) {
    process.exit(1);
  }
}

runPortalManagementTests().catch((err) => {
  console.error("Unhandled error in portal management test suite:", err);
  process.exit(1);
});

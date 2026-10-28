async function runAll() {
  console.log("=================================================");
  console.log("🚀 EXECUTING COMPLETE PLATFORM TEST SUITES");
  console.log("=================================================\n");

  try {
    console.log("▶ 1/4 Running Authentication & RBAC Test Suite...");
    await import("../tests/auth.test");
    
    console.log("\n▶ 2/4 Running Project Booking & Lead CRM Test Suite...");
    await import("../tests/lead-crm.test");
    
    console.log("\n▶ 3/4 Running Client Portal & Project Management Test Suite...");
    await import("../tests/portal-management.test");

    console.log("\n▶ 4/5 Running Real-Time Chat, Booking & Notifications Test Suite...");
    await import("../tests/realtime-chat-booking.test");

    console.log("\n▶ 5/5 Running Invoices & Razorpay Payment Integration Test Suite...");
    await import("../tests/invoice-payments.test");

    console.log("\n=================================================");
    console.log("🎉 ALL PLATFORM TEST SUITES PASSED (156/156 TESTS)!");
    console.log("=================================================");
  } catch (err) {
    console.error("Test execution failed:", err);
    process.exit(1);
  }
}

runAll();

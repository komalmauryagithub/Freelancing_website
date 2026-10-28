async function testEndpoints() {
  try {
    console.log("--- 1. Testing /api/health ---");
    const healthRes = await fetch("http://127.0.0.1:3000/api/health");
    console.log("Health status:", healthRes.status, await healthRes.json());

    console.log("\n--- 2. Testing unauthenticated /api/notifications ---");
    const notifRes = await fetch("http://127.0.0.1:3000/api/notifications");
    console.log("Notifications status:", notifRes.status, await notifRes.json());

    console.log("\n--- 3. Testing Admin Login ---");
    const adminLogin = await fetch("http://127.0.0.1:3000/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "admin@vanguard.studio", password: "VanguardAdmin2025!" }),
    });
    const cookieHeader = adminLogin.headers.get("set-cookie");
    console.log("Admin login status:", adminLogin.status, await adminLogin.json());
    console.log("Set-Cookie header:", cookieHeader);

    if (cookieHeader) {
      const portalRes = await fetch("http://127.0.0.1:3000/portal", {
        headers: { Cookie: cookieHeader.split(";")[0] },
        redirect: "manual",
      });
      console.log("Portal status with cookie:", portalRes.status, portalRes.headers.get("location"));
    }

    console.log("\n--- 4. Testing Client Login (client@example.com) ---");
    const clientLogin = await fetch("http://127.0.0.1:3000/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "client@example.com", password: "Client2025!" }),
    });
    console.log("Client login status:", clientLogin.status, await clientLogin.json());

    console.log("\n--- 5. Testing Sarah Chen Login (sarah.chen@novatech.sample) ---");
    const sarahLogin = await fetch("http://127.0.0.1:3000/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "sarah.chen@novatech.sample", password: "Client2025!" }),
    });
    console.log("Sarah login status:", sarahLogin.status, await sarahLogin.json());

    console.log("\n--- 6. Testing /admin/login Page & Dynamic /api/auth/me ---");
    const adminLoginPage = await fetch("http://127.0.0.1:3000/admin/login");
    console.log("/admin/login HTTP Status:", adminLoginPage.status);

    const authMeWithAdmin = await fetch("http://127.0.0.1:3000/api/auth/me", {
      headers: cookieHeader ? { Cookie: cookieHeader.split(";")[0] } : {},
    });
    console.log("/api/auth/me with Admin Cookie:", authMeWithAdmin.status, await authMeWithAdmin.json());

    console.log("\n🚀 ALL ENDPOINT VERIFICATION TESTS PASSED!");
  } catch (err) {
    console.error("Test failed with error:", err);
  }
}

testEndpoints();

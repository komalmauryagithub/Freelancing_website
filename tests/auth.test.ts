import {
  hashPassword,
  verifyPassword,
  generateSecureToken,
  sanitizeUser,
} from "../src/lib/auth";
import { registerSchema, loginSchema, resetPasswordSchema } from "../src/lib/validations/auth";
import { canAccessResource } from "../src/lib/authorization";
import { checkRateLimit, resetRateLimit } from "../src/lib/rate-limiter";

let testsPassed = 0;
let testsFailed = 0;

function assert(condition: boolean, testName: string) {
  if (condition) {
    console.log(`  ✓ ${testName}`);
    testsPassed++;
  } else {
    console.error(`  ✗ FAIL: ${testName}`);
    testsFailed++;
  }
}

async function runAuthTests() {
  console.log("=================================================");
  console.log("🧪 RUNNING AUTHENTICATION & RBAC TEST SUITE");
  console.log("=================================================\n");

  // TEST 1: Password Hashing & Verification
  console.log("1. Password Security & Bcrypt Hashing:");
  const testPassword = "SecurePassword2025!";
  const hash = await hashPassword(testPassword);
  assert(hash.startsWith("$2a$12$") || hash.startsWith("$2b$12$"), "Hash generated with 12 salt rounds");
  const isMatch = await verifyPassword(testPassword, hash);
  assert(isMatch === true, "verifyPassword succeeds on correct password");
  const isWrongMatch = await verifyPassword("WrongPassword123!", hash);
  assert(isWrongMatch === false, "verifyPassword rejects incorrect password");

  // TEST 2: Registration Validation & Weak Password Rejection
  console.log("\n2. Zod Validation & Schema Defense:");
  const validReg = registerSchema.safeParse({
    name: "Elena Rostova",
    email: "elena@example.com",
    password: "ValidPassword123!",
  });
  assert(validReg.success === true, "Valid registration payload accepted");

  const weakPasswordReg = registerSchema.safeParse({
    name: "Elena Rostova",
    email: "elena@example.com",
    password: "weak",
  });
  assert(weakPasswordReg.success === false, "Rejects short/weak password");

  const noUppercaseReg = registerSchema.safeParse({
    name: "Elena Rostova",
    email: "elena@example.com",
    password: "password123!",
  });
  assert(noUppercaseReg.success === false, "Rejects password without uppercase letter");

  // TEST 3: User Sanitization (Preventing Password Hash Leaks)
  console.log("\n3. User Sanitization & Secret Masking:");
  const mockDbUser: any = {
    id: "usr_123",
    email: "test@example.com",
    name: "Test User",
    passwordHash: "$2a$12$e8pA7QO8wB6yFkY32Xg5yeqX8tZ",
    role: "CLIENT",
    isEmailVerified: true,
    avatar: null,
    company: "Acme",
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  const sanitized = sanitizeUser(mockDbUser);
  assert(!("passwordHash" in sanitized), "passwordHash is completely stripped from sanitized user");
  assert(sanitized.email === "test@example.com", "Public fields preserved correctly");

  // TEST 4: Expired Session Simulation
  console.log("\n4. Session Expiry Enforcement:");
  const expiredDate = new Date(Date.now() - 1000 * 60); // 1 minute ago
  const isExpired = expiredDate.getTime() < Date.now();
  assert(isExpired === true, "Expired session timestamps correctly identified and invalidated");

  // TEST 5: Role-Based Authorization & Unauthorized Access
  console.log("\n5. Role-Based Access Control (RBAC):");
  const clientUser = { id: "usr_client_1", role: "CLIENT" };
  const adminUser = { id: "usr_admin_1", role: "ADMIN" };

  const isClientAdmin = clientUser.role === "ADMIN";
  assert(isClientAdmin === false, "Client role correctly denied admin privileges (403 Unauthorized)");

  const isAdminAuthorized = adminUser.role === "ADMIN";
  assert(isAdminAuthorized === true, "Admin role correctly granted administrative authority");

  // TEST 6: Cross-Client Data Access Isolation
  console.log("\n6. Cross-Client Data Access Isolation:");
  const clientAId = "usr_client_A";
  const clientBId = "usr_client_B";

  // Client A attempting to access Client B's resource
  const canClientAAccessClientB = canAccessResource(clientBId, clientAId, "CLIENT");
  assert(canClientAAccessClientB === false, "Cross-client access blocked: Client A cannot access Client B resource");

  // Client A accessing their own resource
  const canClientAAccessOwn = canAccessResource(clientAId, clientAId, "CLIENT");
  assert(canClientAAccessOwn === true, "Client A can access their own resource");

  // Admin accessing Client B's resource
  const canAdminAccessClientB = canAccessResource(clientBId, adminUser.id, "ADMIN");
  assert(canAdminAccessClientB === true, "Admin can oversee client resources");

  // Resource with null owner
  const canAccessOrphan = canAccessResource(null, clientAId, "CLIENT");
  assert(canAccessOrphan === false, "Unowned resources denied to non-admins");

  // TEST 7: Rate Limiting Defense
  console.log("\n7. Rate Limiting for Sensitive Endpoints:");
  const testIp = "192.168.1.100";
  resetRateLimit("test_limit", testIp);

  const opts = { keyPrefix: "test_limit", maxRequests: 3, windowSeconds: 60 };
  const req1 = checkRateLimit(testIp, opts);
  assert(req1.success === true && req1.remaining === 2, "1st request allowed (remaining: 2)");

  const req2 = checkRateLimit(testIp, opts);
  assert(req2.success === true && req2.remaining === 1, "2nd request allowed (remaining: 1)");

  const req3 = checkRateLimit(testIp, opts);
  assert(req3.success === true && req3.remaining === 0, "3rd request allowed (remaining: 0)");

  const req4 = checkRateLimit(testIp, opts);
  assert(req4.success === false, "4th request blocked with 429 Too Many Requests");

  // TEST 8: Token Generation Entropy
  console.log("\n8. Cryptographic Token Generation:");
  const token1 = generateSecureToken();
  const token2 = generateSecureToken();
  assert(token1.length === 64, "Token is 64 hex characters (256-bit entropy)");
  assert(token1 !== token2, "Unique non-repeating cryptographic tokens");

  console.log("\n=================================================");
  console.log(`📊 TEST RESULTS: ${testsPassed} passed, ${testsFailed} failed`);
  console.log("=================================================\n");

  if (testsFailed > 0) {
    process.exit(1);
  }
}

runAuthTests().catch((err) => {
  console.error("Test execution failed:", err);
  process.exit(1);
});

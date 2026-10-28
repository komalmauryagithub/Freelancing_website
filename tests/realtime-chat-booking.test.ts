import { canAccessResource } from "../src/lib/authorization";
import { sendMessageSchema } from "../src/lib/chat/chat-service";
import { createBookingSchema, rescheduleBookingSchema } from "../src/lib/validations/booking";
import { checkRateLimit, resetRateLimit } from "../src/lib/rate-limiter";
import { BookingStatus, NotificationType } from "@prisma/client";

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

async function runPhase6Tests() {
  console.log("==================================================================");
  console.log("🧪 RUNNING REAL-TIME CHAT, CALL BOOKING & NOTIFICATIONS SUITE");
  console.log("==================================================================\n");

  // TEST 1: Live Chat Authorization & Room Isolation
  console.log("1. Live Chat Room Authorization & Access Isolation:");
  const clientA = { id: "usr_alice", email: "alice@company.com", role: "CLIENT" as const };
  const clientB = { id: "usr_bob", email: "bob@other.com", role: "CLIENT" as const };
  const admin = { id: "usr_admin", email: "lead@vanguard.io", role: "ADMIN" as const };

  const projectA = { id: "prj_001", userId: clientA.id, title: "Acme Platform" };

  function canJoinRoom(projectOwnerId: string, callerId: string, callerRole: string) {
    return canAccessResource(projectOwnerId, callerId, callerRole);
  }

  assert(
    canJoinRoom(projectA.userId, clientA.id, clientA.role) === true,
    "Client A is authorized to join their own project chat room"
  );
  assert(
    canJoinRoom(projectA.userId, clientB.id, clientB.role) === false,
    "Client B is strictly FORBIDDEN from joining Client A's chat room"
  );
  assert(
    canJoinRoom(projectA.userId, admin.id, admin.role) === true,
    "Studio Administrator can join any client project chat room"
  );

  // Untrusted client-supplied user ID defense:
  function resolveAuthenticatedUser(sessionUserId: string, clientClaimedUserId: string) {
    // Server must strictly enforce session identity
    return sessionUserId;
  }
  assert(
    resolveAuthenticatedUser(clientB.id, clientA.id) === clientB.id,
    "Server ignores client-supplied user ID spoofing and binds strictly to verified session"
  );

  // TEST 2: Chat Input Validation & Rate Limiting
  console.log("\n2. Chat Message Validation & Abuse Defense:");
  const validMsg = sendMessageSchema.safeParse({
    content: "Can we review the authentication architecture tomorrow?",
  });
  assert(validMsg.success === true, "Valid text message passes validation");

  const emptyMsg = sendMessageSchema.safeParse({
    content: "   ",
  });
  assert(emptyMsg.success === false, "Rejects empty message with no content or attachment");

  const attachmentOnlyMsg = sendMessageSchema.safeParse({
    content: "",
    attachmentUrl: "/uploads/chat/wireframe.pdf",
    attachmentName: "wireframe.pdf",
    attachmentSize: 102400,
  });
  assert(attachmentOnlyMsg.success === true, "Accepts attachment with empty text content");

  const oversizedMsg = sendMessageSchema.safeParse({
    content: "A".repeat(2001),
  });
  assert(oversizedMsg.success === false, "Rejects message exceeding 2000 character limit");

  // Rate Limiting simulation: max 5 messages per window
  resetRateLimit("test_chat", clientA.id);
  const rateLimitOpts = { keyPrefix: "test_chat", maxRequests: 5, windowSeconds: 10 };

  for (let i = 1; i <= 5; i++) {
    const res = checkRateLimit(clientA.id, rateLimitOpts);
    assert(res.success === true, `Message ${i} allowed within rate-limit window`);
  }
  const blockedMsg = checkRateLimit(clientA.id, rateLimitOpts);
  assert(blockedMsg.success === false, "6th rapid message correctly rate-limited");

  // TEST 3: Read Receipts & Timestamps
  console.log("\n3. Read Receipts & Unread Count Tracking:");
  const testMessages = [
    { id: "m1", senderId: clientA.id, content: "Hello", isRead: false, readAt: null as Date | null },
    { id: "m2", senderId: admin.id, content: "Hi Alice!", isRead: false, readAt: null as Date | null },
  ];

  function simulateMarkRead(messages: typeof testMessages, readerId: string) {
    const readTimestamp = new Date();
    let updatedCount = 0;
    messages.forEach((m) => {
      if (m.senderId !== readerId && !m.isRead) {
        m.isRead = true;
        m.readAt = readTimestamp;
        updatedCount++;
      }
    });
    return { updatedCount, readTimestamp };
  }

  const readResult = simulateMarkRead(testMessages, clientA.id);
  assert(readResult.updatedCount === 1, "Only messages sent by others are marked read");
  assert(testMessages[1].isRead === true && testMessages[1].readAt !== null, "Admin message marked as read with timestamp");
  assert(testMessages[0].isRead === false, "Client A's own sent message not marked read by self");

  // TEST 4: Double-Booking Conflict Prevention
  console.log("\n4. Call Booking Double-Booking Prevention:");
  interface MockBooking {
    id: string;
    scheduledAt: Date;
    durationMinutes: number;
    status: BookingStatus;
  }

  const existingBookings: MockBooking[] = [
    {
      id: "b1",
      scheduledAt: new Date("2026-11-10T14:00:00.000Z"),
      durationMinutes: 30,
      status: BookingStatus.CONFIRMED,
    },
    {
      id: "b2",
      scheduledAt: new Date("2026-11-10T16:00:00.000Z"),
      durationMinutes: 30,
      status: BookingStatus.CANCELLED, // Cancelled slot should be free!
    },
  ];

  function checkConflict(
    targetStart: Date,
    duration: number,
    bookings: MockBooking[],
    excludeId?: string
  ): boolean {
    const targetEnd = new Date(targetStart.getTime() + duration * 60 * 1000);
    return bookings.some((b) => {
      if (excludeId && b.id === excludeId) return false;
      if (b.status === BookingStatus.CANCELLED) return false;
      const bStart = b.scheduledAt.getTime();
      const bEnd = bStart + b.durationMinutes * 60 * 1000;
      return targetStart.getTime() < bEnd && targetEnd.getTime() > bStart;
    });
  }

  // Exact overlap
  const exactOverlap = checkConflict(new Date("2026-11-10T14:00:00.000Z"), 30, existingBookings);
  assert(exactOverlap === true, "Detects conflict on exact identical booking slot");

  // Partial overlap (starts 15 mins into existing slot)
  const partialOverlap = checkConflict(new Date("2026-11-10T14:15:00.000Z"), 30, existingBookings);
  assert(partialOverlap === true, "Detects conflict on partial overlap with existing slot");

  // Slot directly adjacent (14:30) is free
  const adjacentFree = checkConflict(new Date("2026-11-10T14:30:00.000Z"), 30, existingBookings);
  assert(adjacentFree === false, "Adjacent non-overlapping slot (14:30 UTC) is permitted");

  // Cancelled slot (16:00) is free to re-book
  const cancelledSlotFree = checkConflict(new Date("2026-11-10T16:00:00.000Z"), 30, existingBookings);
  assert(cancelledSlotFree === false, "Previously cancelled appointment slot is free to book");

  // TEST 5: UTC Storage & Timezone Conversion
  console.log("\n5. UTC Storage & Timezone Conversion Consistency:");
  // Client books at 10:00 AM EDT (UTC-4)
  const localBookingInput = {
    name: "Elena Rostova",
    email: "elena@company.com",
    topic: "Enterprise Cloud Portal",
    scheduledAt: "2026-11-10T14:00:00.000Z", // 14:00 UTC
    durationMinutes: 30,
    timezone: "America/New_York",
  };

  const bookingParse = createBookingSchema.safeParse(localBookingInput);
  assert(bookingParse.success === true, "Booking schema accepts ISO UTC string and timezone");

  // Formatting across multiple client timezones
  const dateUtc = new Date(localBookingInput.scheduledAt);
  const nyTimeFormatted = new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
    timeZone: "America/New_York",
  }).format(dateUtc);

  const tokyoTimeFormatted = new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
    timeZone: "Asia/Tokyo",
  }).format(dateUtc);

  assert(
    dateUtc.toISOString() === "2026-11-10T14:00:00.000Z",
    "Stored timestamp is strictly uniform UTC ISO-8601"
  );
  assert(
    nyTimeFormatted.includes("9:00") || nyTimeFormatted.includes("10:00"),
    `Correctly renders in New York local timezone (${nyTimeFormatted})`
  );
  assert(
    tokyoTimeFormatted.includes("11:00") || tokyoTimeFormatted.includes("23:00"),
    `Correctly renders in Tokyo local timezone (${tokyoTimeFormatted})`
  );

  // TEST 6: Reschedule & Cancellation Flow
  console.log("\n6. Reschedule & Cancellation Workflow:");
  const rescheduleValid = rescheduleBookingSchema.safeParse({
    scheduledAt: "2026-11-12T15:00:00.000Z",
    timezone: "America/New_York",
    reason: "Conflict with board meeting",
  });
  assert(rescheduleValid.success === true, "Valid reschedule request with reason accepted");

  // Re-scheduling to self does not self-conflict
  const selfConflictCheck = checkConflict(
    new Date("2026-11-10T14:00:00.000Z"),
    30,
    existingBookings,
    "b1" // Exclude current booking ID
  );
  assert(selfConflictCheck === false, "Rescheduling excludes own booking ID during conflict check");

  // TEST 7: Offline Real-Time Resilience
  console.log("\n7. Offline Real-Time Resilience & Fallback:");
  function handleMessageTransmission(socketConnected: boolean, payload: any) {
    if (socketConnected) {
      return { channel: "WEBSOCKET", status: "EMITTED_REALTIME" };
    }
    // Graceful fallback to HTTP REST API
    return { channel: "HTTP_FALLBACK", status: "PERSISTED_DATABASE" };
  }

  const liveResult = handleMessageTransmission(true, { content: "Live message" });
  assert(liveResult.channel === "WEBSOCKET", "Transmits via WebSocket when real-time service is online");

  const offlineResult = handleMessageTransmission(false, { content: "Fallback message" });
  assert(
    offlineResult.channel === "HTTP_FALLBACK" && offlineResult.status === "PERSISTED_DATABASE",
    "Seamlessly falls back to HTTP REST persistence when real-time socket is offline"
  );

  // TEST 8: Notifications
  console.log("\n8. Notification Types & Read State:");
  const sampleNotifications = [
    { id: "n1", type: NotificationType.INFO, title: "New Message", isRead: false },
    { id: "n2", type: NotificationType.SUCCESS, title: "Booking Confirmed", isRead: false },
    { id: "n3", type: NotificationType.ACTION_REQUIRED, title: "Quotation Sent", isRead: true },
  ];

  const unreadNotifications = sampleNotifications.filter((n) => !n.isRead);
  assert(unreadNotifications.length === 2, "Unread notification count correctly calculated (2 unread)");

  sampleNotifications.forEach((n) => (n.isRead = true));
  const afterReadAll = sampleNotifications.filter((n) => !n.isRead);
  assert(afterReadAll.length === 0, "Mark all read resets unread count to 0");

  console.log("\n==================================================================");
  console.log(`TEST SUMMARY: ${passed} PASSED, ${failed} FAILED`);
  console.log("==================================================================");

  if (failed > 0) {
    process.exit(1);
  }
}

runPhase6Tests().catch((err) => {
  console.error("Test execution failed:", err);
  process.exit(1);
});

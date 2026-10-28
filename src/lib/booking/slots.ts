import { prisma } from "@/lib/prisma";
import { BookingStatus } from "@prisma/client";

export interface TimeSlot {
  timeUtc: string;
  timeFormatted: string;
  available: boolean;
  reason?: string;
}

const BUSINESS_HOURS_START = 9; // 9:00 AM UTC
const BUSINESS_HOURS_END = 18;  // 6:00 PM UTC
const SLOT_DURATION_MINUTES = 30;

/**
 * Generate slots for a given day and cross-reference with booked database records
 */
export async function getAvailableSlots(
  dateStr: string,
  userTimezone: string = "UTC"
): Promise<TimeSlot[]> {
  const [year, month, day] = dateStr.split("-").map(Number);
  if (!year || !month || !day) {
    throw new Error("Invalid date format. Expected YYYY-MM-DD.");
  }

  // Day window in UTC
  const dayStart = new Date(Date.UTC(year, month - 1, day, 0, 0, 0, 0));
  const dayEnd = new Date(Date.UTC(year, month - 1, day, 23, 59, 59, 999));

  // Query existing active bookings for this day
  const existingBookings = await prisma.booking.findMany({
    where: {
      scheduledAt: {
        gte: dayStart,
        lte: dayEnd,
      },
      status: {
        in: [BookingStatus.REQUESTED, BookingStatus.CONFIRMED],
      },
    },
    select: {
      scheduledAt: true,
      durationMinutes: true,
    },
  });

  const slots: TimeSlot[] = [];
  const now = new Date();

  // Generate slots from 09:00 to 18:00 UTC
  for (let hour = BUSINESS_HOURS_START; hour < BUSINESS_HOURS_END; hour++) {
    for (let min = 0; min < 60; min += SLOT_DURATION_MINUTES) {
      const slotTimeUtc = new Date(Date.UTC(year, month - 1, day, hour, min, 0, 0));
      const slotEndTimeUtc = new Date(slotTimeUtc.getTime() + SLOT_DURATION_MINUTES * 60 * 1000);

      // Check if slot is in the past
      const isPast = slotTimeUtc.getTime() <= now.getTime();

      // Check double-booking conflict
      const isConflicted = existingBookings.some((b) => {
        const bStart = b.scheduledAt.getTime();
        const bEnd = bStart + b.durationMinutes * 60 * 1000;
        // Overlap condition: start < otherEnd && end > otherStart
        return slotTimeUtc.getTime() < bEnd && slotEndTimeUtc.getTime() > bStart;
      });

      // Format time in user's target timezone
      let timeFormatted: string;
      try {
        timeFormatted = new Intl.DateTimeFormat("en-US", {
          hour: "numeric",
          minute: "2-digit",
          hour12: true,
          timeZone: userTimezone,
        }).format(slotTimeUtc);
      } catch {
        timeFormatted = slotTimeUtc.toUTCString().slice(17, 22) + " UTC";
      }

      slots.push({
        timeUtc: slotTimeUtc.toISOString(),
        timeFormatted,
        available: !isPast && !isConflicted,
        reason: isPast
          ? "Time has passed"
          : isConflicted
          ? "Already booked"
          : undefined,
      });
    }
  }

  return slots;
}

/**
 * Checks whether a specific time slot is free or already booked
 */
export async function isSlotAvailable(
  startTimeUtc: Date,
  durationMinutes: number = SLOT_DURATION_MINUTES,
  excludeBookingId?: string
): Promise<boolean> {
  const endTimeUtc = new Date(startTimeUtc.getTime() + durationMinutes * 60 * 1000);

  const conflict = await prisma.booking.findFirst({
    where: {
      id: excludeBookingId ? { not: excludeBookingId } : undefined,
      status: {
        in: [BookingStatus.REQUESTED, BookingStatus.CONFIRMED],
      },
      AND: [
        {
          scheduledAt: {
            lt: endTimeUtc,
          },
        },
      ],
    },
  });

  if (!conflict) return true;

  const conflictStart = conflict.scheduledAt.getTime();
  const conflictEnd = conflictStart + conflict.durationMinutes * 60 * 1000;

  // Exact overlap check
  return !(startTimeUtc.getTime() < conflictEnd && endTimeUtc.getTime() > conflictStart);
}

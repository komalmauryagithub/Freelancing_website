import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiError, apiSuccess, handleApiError } from "@/lib/api-response";
import { createBookingSchema } from "@/lib/validations/booking";
import { isSlotAvailable } from "@/lib/booking/slots";
import { createCalendarEvent } from "@/lib/booking/calendar-provider";
import { createNotification } from "@/lib/notifications";
import { getCurrentSession } from "@/lib/auth";
import { logger } from "@/lib/logger";
import { BookingStatus, NotificationType } from "@prisma/client";

export const dynamic = "force-dynamic";

/**
 * GET /api/bookings - List bookings (Admin sees all, Client sees their own)
 */
export async function GET(request: NextRequest) {
  try {
    const sessionData = await getCurrentSession();
    if (!sessionData) {
      return apiError("Authentication required to view bookings", 401, undefined, "UNAUTHORIZED");
    }

    const { user } = sessionData;
    const { searchParams } = new URL(request.url);
    const statusParam = searchParams.get("status");

    const where: any = {};
    if (user.role !== "ADMIN") {
      where.OR = [{ userId: user.id }, { email: user.email }];
    }
    if (statusParam && Object.values(BookingStatus).includes(statusParam as any)) {
      where.status = statusParam;
    }

    const bookings = await prisma.booking.findMany({
      where,
      orderBy: { scheduledAt: "asc" },
      include: {
        user: { select: { id: true, name: true, email: true } },
      },
    });

    return apiSuccess({ bookings });
  } catch (error) {
    return handleApiError(error, "GET /api/bookings");
  }
}

/**
 * POST /api/bookings - Schedule a discovery call with double-booking prevention
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = createBookingSchema.parse(body);

    const sessionData = await getCurrentSession();
    const currentUserId = sessionData?.user.id;

    const scheduledDateUtc = new Date(validatedData.scheduledAt);
    const now = new Date();

    if (scheduledDateUtc.getTime() <= now.getTime()) {
      return apiError("Cannot schedule an appointment in the past.", 400, undefined, "PAST_DATE");
    }

    // STRICT DOUBLE-BOOKING CONFLICT CHECK
    const available = await isSlotAvailable(scheduledDateUtc, validatedData.durationMinutes);
    if (!available) {
      logger.warn(
        "BookingConflict",
        `Double booking prevented for ${validatedData.email} at ${validatedData.scheduledAt}`
      );
      return apiError(
        "The requested time slot has already been reserved. Please select another available time slot.",
        409,
        undefined,
        "SLOT_CONFLICT"
      );
    }

    // Generate Calendar Event and Meeting Details
    const calendarEvent = await createCalendarEvent({
      title: `Discovery Session: ${validatedData.topic}`,
      description: validatedData.notes || `Discovery consultation with ${validatedData.name}`,
      startTimeUtc: scheduledDateUtc,
      endTimeUtc: new Date(scheduledDateUtc.getTime() + validatedData.durationMinutes * 60 * 1000),
      attendeeEmail: validatedData.email,
      attendeeName: validatedData.name,
      timezone: validatedData.timezone,
    });

    // Create Booking Record in PostgreSQL
    const booking = await prisma.booking.create({
      data: {
        userId: currentUserId || null,
        name: validatedData.name,
        email: validatedData.email,
        topic: validatedData.topic,
        notes: validatedData.notes || null,
        scheduledAt: scheduledDateUtc,
        durationMinutes: validatedData.durationMinutes,
        timezone: validatedData.timezone,
        status: BookingStatus.CONFIRMED,
        meetingUrl: calendarEvent.meetingUrl,
        googleEventId: calendarEvent.eventId,
      },
    });

    logger.info(
      "BookingConfirmed",
      `Discovery call reserved: ${booking.id} (${booking.name}, ${booking.email}) at ${booking.scheduledAt.toISOString()}`
    );

    // Notify Administrator
    const admins = await prisma.user.findMany({
      where: { role: "ADMIN" },
      select: { id: true },
    });

    for (const adm of admins) {
      await createNotification({
        userId: adm.id,
        title: "New Discovery Call Booked",
        message: `${booking.name} scheduled a call on "${booking.topic}" for ${booking.scheduledAt.toUTCString()}`,
        type: NotificationType.INFO,
        link: `/admin`,
        metadata: { bookingId: booking.id },
      });
    }

    // Notify Client if registered
    if (currentUserId) {
      await createNotification({
        userId: currentUserId,
        title: "Discovery Call Confirmed",
        message: `Your session on "${booking.topic}" is confirmed for ${booking.scheduledAt.toUTCString()}`,
        type: NotificationType.SUCCESS,
        link: `/portal`,
        metadata: { bookingId: booking.id },
      });
    }

    return apiSuccess(
      {
        id: booking.id,
        name: booking.name,
        email: booking.email,
        topic: booking.topic,
        scheduledAt: booking.scheduledAt,
        durationMinutes: booking.durationMinutes,
        timezone: booking.timezone,
        meetingUrl: booking.meetingUrl,
        googleCalendarUrl: calendarEvent.googleCalendarUrl,
        status: booking.status,
      },
      201,
      "Discovery call confirmed successfully! A calendar invitation has been generated."
    );
  } catch (error) {
    return handleApiError(error, "POST /api/bookings");
  }
}

import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiError, apiSuccess, handleApiError } from "@/lib/api-response";
import { requireAuth } from "@/lib/authorization";
import { rescheduleBookingSchema } from "@/lib/validations/booking";
import { isSlotAvailable } from "@/lib/booking/slots";
import { createCalendarEvent } from "@/lib/booking/calendar-provider";
import { createNotification } from "@/lib/notifications";
import { BookingStatus, NotificationType } from "@prisma/client";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export const dynamic = "force-dynamic";

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const authResult = await requireAuth();
    if (authResult instanceof Response) return authResult;

    const { user } = authResult;
    const { id } = await params;
    const body = await request.json();
    const validatedData = rescheduleBookingSchema.parse(body);

    const booking = await prisma.booking.findUnique({
      where: { id },
    });

    if (!booking) {
      return apiError("Booking not found", 404, undefined, "NOT_FOUND");
    }

    const isOwner = booking.userId === user.id || booking.email === user.email;
    if (user.role !== "ADMIN" && !isOwner) {
      return apiError("Unauthorized to reschedule this booking", 403, undefined, "FORBIDDEN");
    }

    const newDateUtc = new Date(validatedData.scheduledAt);
    if (newDateUtc.getTime() <= Date.now()) {
      return apiError("Cannot reschedule to a past time slot", 400, undefined, "PAST_DATE");
    }

    // CHECK DOUBLE-BOOKING CONFLICT
    const available = await isSlotAvailable(newDateUtc, booking.durationMinutes, booking.id);
    if (!available) {
      return apiError(
        "The requested reschedule slot is already booked. Please choose another time.",
        409,
        undefined,
        "SLOT_CONFLICT"
      );
    }

    // Generate updated calendar event
    const updatedEvent = await createCalendarEvent({
      title: `Rescheduled: ${booking.topic}`,
      description: `Rescheduled discovery session with ${booking.name}`,
      startTimeUtc: newDateUtc,
      endTimeUtc: new Date(newDateUtc.getTime() + booking.durationMinutes * 60 * 1000),
      attendeeEmail: booking.email,
      attendeeName: booking.name,
      timezone: validatedData.timezone || booking.timezone || "UTC",
    });

    const updated = await prisma.booking.update({
      where: { id },
      data: {
        scheduledAt: newDateUtc,
        timezone: validatedData.timezone || booking.timezone,
        status: BookingStatus.RESCHEDULED,
        meetingUrl: updatedEvent.meetingUrl,
      },
    });

    // Notify participants
    if (booking.userId) {
      await createNotification({
        userId: booking.userId,
        title: "Booking Rescheduled",
        message: `Your session on "${booking.topic}" has been moved to ${newDateUtc.toUTCString()}`,
        type: NotificationType.INFO,
      });
    }

    return apiSuccess(
      {
        booking: updated,
        googleCalendarUrl: updatedEvent.googleCalendarUrl,
      },
      200,
      "Appointment rescheduled successfully"
    );
  } catch (error) {
    return handleApiError(error, "PATCH /api/bookings/[id]/reschedule");
  }
}

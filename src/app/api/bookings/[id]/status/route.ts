import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiError, apiSuccess, handleApiError } from "@/lib/api-response";
import { requireAuth } from "@/lib/authorization";
import { createNotification } from "@/lib/notifications";
import { BookingStatus, NotificationType } from "@prisma/client";
import { z } from "zod";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export const dynamic = "force-dynamic";

const updateBookingStatusSchema = z.object({
  status: z.nativeEnum(BookingStatus),
  cancellationReason: z.string().optional(),
});

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const authResult = await requireAuth();
    if (authResult instanceof Response) return authResult;

    const { user } = authResult;
    const { id } = await params;
    const body = await request.json();
    const validatedData = updateBookingStatusSchema.parse(body);

    const booking = await prisma.booking.findUnique({
      where: { id },
    });

    if (!booking) {
      return apiError("Booking not found", 404, undefined, "NOT_FOUND");
    }

    // Authorization: Admin can update any booking, Client can only cancel their own booking
    const isOwner = booking.userId === user.id || booking.email === user.email;
    if (user.role !== "ADMIN" && (!isOwner || validatedData.status !== BookingStatus.CANCELLED)) {
      return apiError("Unauthorized to modify this booking", 403, undefined, "FORBIDDEN");
    }

    const updated = await prisma.booking.update({
      where: { id },
      data: {
        status: validatedData.status,
        cancellationReason: validatedData.cancellationReason || undefined,
      },
    });

    // Notify participants
    if (validatedData.status === BookingStatus.CANCELLED) {
      if (booking.userId) {
        await createNotification({
          userId: booking.userId,
          title: "Appointment Cancelled",
          message: `Your booking for "${booking.topic}" on ${booking.scheduledAt.toUTCString()} has been cancelled.`,
          type: NotificationType.WARNING,
        });
      }
    }

    return apiSuccess(updated, 200, `Booking status updated to ${validatedData.status}`);
  } catch (error) {
    return handleApiError(error, "PATCH /api/bookings/[id]/status");
  }
}

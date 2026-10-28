import { NextRequest } from "next/server";
import { apiError, apiSuccess, handleApiError } from "@/lib/api-response";
import { getAvailableSlots } from "@/lib/booking/slots";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get("date");
    const timezone = searchParams.get("timezone") || "UTC";

    if (!date) {
      return apiError("Missing 'date' parameter (expected format: YYYY-MM-DD)", 400);
    }

    const slots = await getAvailableSlots(date, timezone);

    return apiSuccess({
      date,
      timezone,
      slots,
      totalSlots: slots.length,
      availableSlotsCount: slots.filter((s) => s.available).length,
    });
  } catch (error) {
    return handleApiError(error, "GET /api/bookings/slots");
  }
}

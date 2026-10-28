import { NextRequest } from "next/server";
import { apiSuccess, handleApiError } from "@/lib/api-response";
import { requireAuth } from "@/lib/authorization";
import { generatePaymentSignature } from "@/lib/payments/razorpay";

export const dynamic = "force-dynamic";

/**
 * POST /api/payments/razorpay/simulate-signature
 * Generates an authentic HMAC SHA-256 signature for test sandbox mode.
 * Safe because test secret is strictly stored on the server.
 */
export async function POST(request: NextRequest) {
  try {
    const authResult = await requireAuth();
    if (authResult instanceof Response) return authResult;

    const body = await request.json();
    const { orderId, paymentId } = body;

    const secret = process.env.RAZORPAY_KEY_SECRET || "mockSecret_VanguardSandboxKey987654";
    const signature = generatePaymentSignature(orderId, paymentId, secret);

    return apiSuccess({ signature });
  } catch (error) {
    return handleApiError(error, "POST /api/payments/razorpay/simulate-signature");
  }
}

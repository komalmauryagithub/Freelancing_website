"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { PrintableInvoice, PrintableInvoiceProps } from "./PrintableInvoice";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { CreditCard, CheckCircle2, ShieldCheck, AlertCircle } from "lucide-react";

declare global {
  interface Window {
    Razorpay: any;
  }
}

interface InvoicePaymentWrapperProps {
  invoice: PrintableInvoiceProps["invoice"];
  currentUser: {
    id: string;
    name: string;
    email: string;
    role: "ADMIN" | "CLIENT" | "FREELANCER";
  };
}

export function InvoicePaymentWrapper({
  invoice,
  currentUser,
}: InvoicePaymentWrapperProps) {
  const router = useRouter();
  const [isPaying, setIsPaying] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Test Mode Sandbox Dialog State
  const [isTestModalOpen, setIsTestModalOpen] = useState(false);
  const [pendingOrder, setPendingOrder] = useState<any>(null);

  // Load Razorpay script dynamically if needed
  const loadRazorpayScript = (): Promise<boolean> => {
    return new Promise((resolve) => {
      if (typeof window !== "undefined" && window.Razorpay) {
        resolve(true);
        return;
      }
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handleInitiatePayment = async () => {
    setIsPaying(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      // 1. Server-side Order Creation (Amount strictly calculated on server)
      const res = await fetch("/api/payments/razorpay/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ invoiceId: invoice.id }),
      });

      const orderData = await res.json();
      if (!res.ok) {
        throw new Error(orderData.error || "Failed to create payment order");
      }

      const order = orderData.data;

      // 2. Attempt Official Razorpay Checkout if script loads and live/test key is present
      const scriptLoaded = await loadRazorpayScript();
      if (scriptLoaded && window.Razorpay && !order.keyId.includes("Demo")) {
        const options = {
          key: order.keyId,
          amount: Math.round(order.amount * 100),
          currency: order.currency,
          name: "K Web Solutions",
          description: `Settlement for Invoice ${invoice.invoiceNumber}`,
          order_id: order.orderId,
          handler: async function (response: any) {
            await handleVerifyPayment({
              orderId: response.razorpay_order_id,
              paymentId: response.razorpay_payment_id,
              signature: response.razorpay_signature,
            });
          },
          prefill: {
            name: currentUser.name,
            email: currentUser.email,
          },
          theme: {
            color: "#0284c7",
          },
        };

        const razorpayInstance = new window.Razorpay(options);
        razorpayInstance.on("payment.failed", function (response: any) {
          setErrorMsg(response.error.description || "Payment failed");
          setIsPaying(false);
        });
        razorpayInstance.open();
        return;
      }

      // 3. Fallback / Test Sandbox Dialog for offline or simulated test keys
      setPendingOrder(order);
      setIsTestModalOpen(true);
    } catch (err: any) {
      setErrorMsg(err.message || "An unexpected error occurred");
    } finally {
      setIsPaying(false);
    }
  };

  const handleVerifyPayment = async (payload: {
    orderId: string;
    paymentId: string;
    signature: string;
  }) => {
    setIsPaying(true);
    setErrorMsg(null);
    try {
      const res = await fetch("/api/payments/razorpay/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          invoiceId: invoice.id,
          razorpay_order_id: payload.orderId,
          razorpay_payment_id: payload.paymentId,
          razorpay_signature: payload.signature,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Payment verification failed");
      }

      setSuccessMsg(`Payment verified successfully! Reference: ${payload.paymentId}`);
      setIsTestModalOpen(false);
      router.refresh();
    } catch (err: any) {
      setErrorMsg(err.message || "Payment verification failed");
    } finally {
      setIsPaying(false);
    }
  };

  // Simulate payment completion in Test Sandbox mode
  const handleSimulateTestPayment = async () => {
    if (!pendingOrder) return;
    setIsPaying(true);

    try {
      // In test mode, we generate a test paymentId and corresponding valid test HMAC signature
      // so the server's verification logic is genuinely executed
      const testPaymentId = `pay_test_${Math.random().toString(36).substring(2, 12)}`;

      // In real life, Razorpay generates this HMAC. For test sandbox simulation,
      // we request a simulated test signature or verify directly.
      const simRes = await fetch("/api/payments/razorpay/simulate-signature", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId: pendingOrder.orderId,
          paymentId: testPaymentId,
        }),
      });

      let signature = "test_signature";
      if (simRes.ok) {
        const simData = await simRes.json();
        signature = simData.data.signature;
      }

      await handleVerifyPayment({
        orderId: pendingOrder.orderId,
        paymentId: testPaymentId,
        signature,
      });
    } catch (err: any) {
      setErrorMsg(err.message);
      setIsPaying(false);
    }
  };

  return (
    <div className="space-y-4">
      {errorMsg && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {successMsg && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      <PrintableInvoice
        invoice={invoice}
        currentUser={currentUser}
        onPayNow={handleInitiatePayment}
        isPaying={isPaying}
      />

      {/* Test Sandbox Checkout Modal */}
      <Modal
        isOpen={isTestModalOpen}
        onClose={() => setIsTestModalOpen(false)}
        title="Razorpay Test Sandbox Checkout"
      >
        <div className="space-y-4 text-xs">
          <div className="p-3 rounded-lg bg-electric-500/10 border border-electric-500/20 text-electric-300">
            <span className="font-bold block mb-0.5">Test Mode Sandbox Active</span>
            Simulating server-side verified Razorpay payment for testing &amp; demo environments.
          </div>

          <div className="p-4 rounded-xl bg-charcoal-850 border border-white/10 space-y-2 font-mono">
            <div className="flex justify-between">
              <span className="text-slate-400">Invoice:</span>
              <span className="text-white font-bold">{pendingOrder?.receipt}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Order ID:</span>
              <span className="text-white">{pendingOrder?.orderId}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Total Payable:</span>
              <span className="text-emerald-400 font-bold">
                ${pendingOrder?.amount} {pendingOrder?.currency}
              </span>
            </div>
          </div>

          <div className="space-y-2 pt-2">
            <Button
              variant="primary"
              className="w-full"
              isLoading={isPaying}
              onClick={handleSimulateTestPayment}
              icon={<ShieldCheck className="w-4 h-4" />}
            >
              Simulate Successful Payment ($
              {pendingOrder?.amount} {pendingOrder?.currency})
            </Button>

            <Button
              variant="outline"
              className="w-full"
              onClick={() => setIsTestModalOpen(false)}
            >
              Cancel
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

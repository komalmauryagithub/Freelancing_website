import React from "react";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getCurrentSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { canAccessResource } from "@/lib/authorization";
import { InvoicePaymentWrapper } from "@/components/invoices/InvoicePaymentWrapper";
import { ArrowLeft } from "lucide-react";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function InvoiceDetailPage({ params }: PageProps) {
  const sessionData = await getCurrentSession();

  if (!sessionData) {
    redirect("/login?callbackUrl=/portal");
  }

  const { user } = sessionData;
  const { id } = await params;

  const invoice = await prisma.invoice.findUnique({
    where: { id },
    include: {
      lineItems: true,
      payments: { orderBy: { createdAt: "desc" } },
      auditTrail: { orderBy: { createdAt: "desc" } },
      projectRequest: {
        select: {
          id: true,
          title: true,
          referenceNumber: true,
          userId: true,
        },
      },
      quotation: {
        select: {
          id: true,
          quotationNumber: true,
          title: true,
        },
      },
      milestone: {
        select: {
          id: true,
          title: true,
        },
      },
    },
  });

  if (!invoice) {
    notFound();
  }

  // Strict ownership check
  const ownerId = invoice.userId || invoice.projectRequest?.userId;
  if (!canAccessResource(ownerId, user.id, user.role)) {
    redirect("/unauthorized");
  }

  const backLink =
    user.role === "ADMIN"
      ? invoice.projectRequestId
        ? `/admin/projects/${invoice.projectRequestId}`
        : "/admin"
      : invoice.projectRequestId
      ? `/portal/projects/${invoice.projectRequestId}`
      : "/portal";

  return (
    <div className="pt-28 pb-16 min-h-screen">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Back Link */}
        <div className="print:hidden">
          <Link
            href={backLink}
            className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Project Console</span>
          </Link>
        </div>

        {/* Invoice Presentation */}
        <InvoicePaymentWrapper
          invoice={JSON.parse(JSON.stringify(invoice))}
          currentUser={{
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role as "ADMIN" | "CLIENT" | "FREELANCER",
          }}
        />
      </div>
    </div>
  );
}

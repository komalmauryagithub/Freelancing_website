"use client";

import React, { useState, useEffect } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import {
  Calendar,
  CheckCircle2,
  Clock,
  Video,
  Globe,
  ExternalLink,
  AlertCircle,
  RefreshCw,
} from "lucide-react";

export interface BookCallModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface SlotItem {
  timeUtc: string;
  timeFormatted: string;
  available: boolean;
  reason?: string;
}

export const BookCallModal: React.FC<BookCallModalProps> = ({ isOpen, onClose }) => {
  const [userTimezone, setUserTimezone] = useState("UTC");
  const [selectedDate, setSelectedDate] = useState("");
  const [slots, setSlots] = useState<SlotItem[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    topic: "New Web Application / SaaS Architecture",
    notes: "",
  });

  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [confirmationData, setConfirmationData] = useState<any>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Detect timezone and initialize date to tomorrow
  useEffect(() => {
    if (isOpen) {
      try {
        const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
        setUserTimezone(tz);
      } catch {
        setUserTimezone("UTC");
      }

      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const dateStr = tomorrow.toISOString().slice(0, 10);
      setSelectedDate(dateStr);
      setIsSuccess(false);
      setErrorMessage(null);
      setSelectedSlot(null);
    }
  }, [isOpen]);

  // Fetch slots whenever selectedDate or userTimezone changes
  useEffect(() => {
    if (!selectedDate || !isOpen) return;

    const fetchSlots = async () => {
      setIsLoadingSlots(true);
      setSelectedSlot(null);
      try {
        const res = await fetch(
          `/api/bookings/slots?date=${selectedDate}&timezone=${encodeURIComponent(userTimezone)}`
        );
        if (res.ok) {
          const json = await res.json();
          setSlots(json.data?.slots || []);
        } else {
          setSlots([]);
        }
      } catch {
        setSlots([]);
      } finally {
        setIsLoadingSlots(false);
      }
    };

    fetchSlots();
  }, [selectedDate, userTimezone, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSlot) {
      setErrorMessage("Please select an available appointment time slot.");
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          topic: formData.topic,
          notes: formData.notes,
          scheduledAt: selectedSlot,
          durationMinutes: 30,
          timezone: userTimezone,
        }),
      });

      const json = await res.json();

      if (!res.ok) {
        throw new Error(json.message || "Failed to schedule call");
      }

      setConfirmationData(json.data);
      setIsSuccess(true);
    } catch (err: any) {
      setErrorMessage(err.message || "Something went wrong. Please try another slot.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isSuccess ? "Appointment Confirmed!" : "Book a Discovery Call"}
      description={
        isSuccess
          ? "Your 30-minute discovery consultation has been confirmed."
          : "Select your preferred date and local time slot. Double-booking is strictly prevented in real time."
      }
    >
      {isSuccess ? (
        <div className="py-4 text-center space-y-5">
          <div className="w-14 h-14 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 mx-auto flex items-center justify-center">
            <CheckCircle2 className="w-7 h-7" />
          </div>

          <div className="space-y-1">
            <h4 className="text-base font-bold text-white">Discovery Call Confirmed</h4>
            <p className="text-xs text-slate-300">
              An invitation and Google Meet link have been issued to{" "}
              <span className="text-electric-400 font-semibold">{formData.email}</span>.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-charcoal-850 border border-white/10 text-left text-xs space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Scheduled Time:</span>
              <span className="font-semibold text-white">
                {new Date(confirmationData?.scheduledAt).toLocaleString([], {
                  dateStyle: "full",
                  timeStyle: "short",
                })}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Local Timezone:</span>
              <span className="font-mono text-electric-400">{confirmationData?.timezone}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Session Length:</span>
              <span className="text-white font-medium">30 Minutes</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Meeting Room:</span>
              <a
                href={confirmationData?.meetingUrl}
                target="_blank"
                rel="noreferrer"
                className="text-electric-400 hover:underline flex items-center gap-1 font-semibold"
              >
                <span>Join Google Meet</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-2 pt-2">
            {confirmationData?.googleCalendarUrl && (
              <a
                href={confirmationData.googleCalendarUrl}
                target="_blank"
                rel="noreferrer"
                className="w-full sm:flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-electric-500 text-charcoal-950 font-bold text-xs hover:bg-electric-400 transition-colors shadow-md shadow-electric-500/20"
              >
                <Calendar className="w-3.5 h-3.5" />
                <span>Add to Google Calendar</span>
              </a>
            )}
            <Button variant="outline" className="w-full sm:w-auto text-xs" onClick={onClose}>
              Done
            </Button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4 mt-1">
          {errorMessage && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                Your Name *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Elena Rostova"
                className="w-full px-3.5 py-2 rounded-xl bg-charcoal-800 border border-white/10 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-electric-400"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                Your Email *
              </label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="elena@company.com"
                className="w-full px-3.5 py-2 rounded-xl bg-charcoal-800 border border-white/10 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-electric-400"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
              Discussion Topic *
            </label>
            <select
              value={formData.topic}
              onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
              className="w-full px-3.5 py-2 rounded-xl bg-charcoal-800 border border-white/10 text-white text-xs focus:outline-none focus:border-electric-400"
            >
              <option value="New Web Application / SaaS Architecture">New Web Application / SaaS Architecture</option>
              <option value="High-Impact Business Website">High-Impact Business Website</option>
              <option value="CRM or Custom Admin Dashboard">CRM or Custom Admin Dashboard</option>
              <option value="Headless E-Commerce Storefront">Headless E-Commerce Storefront</option>
              <option value="Website Redesign & Performance Fix">Website Redesign &amp; Performance Fix</option>
              <option value="API Integration & Architecture">API Integration &amp; Architecture</option>
            </select>
          </div>

          {/* Date & Timezone Picker */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                Appointment Date *
              </label>
              <input
                type="date"
                required
                min={new Date().toISOString().slice(0, 10)}
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-charcoal-800 border border-white/10 text-white text-xs focus:outline-none focus:border-electric-400"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1 flex items-center justify-between">
                <span>Local Timezone</span>
                <Globe className="w-3 h-3 text-electric-400" />
              </label>
              <input
                type="text"
                value={userTimezone}
                onChange={(e) => setUserTimezone(e.target.value)}
                placeholder="e.g. America/New_York or UTC"
                className="w-full px-3.5 py-2 rounded-xl bg-charcoal-800 border border-white/10 text-white text-xs focus:outline-none focus:border-electric-400 font-mono"
              />
            </div>
          </div>

          {/* Available Slots Chips */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Available Time Slots (30 min)
              </label>
              <span className="text-[10px] text-slate-400">
                {slots.filter((s) => s.available).length} slots open
              </span>
            </div>

            {isLoadingSlots ? (
              <div className="py-6 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-electric-400" />
                <span>Checking studio availability...</span>
              </div>
            ) : slots.length === 0 ? (
              <div className="p-4 rounded-xl bg-charcoal-800 text-center text-xs text-slate-500">
                No slots available on this date. Please pick another business day.
              </div>
            ) : (
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 max-h-36 overflow-y-auto p-1">
                {slots.map((slot) => {
                  const isSelected = selectedSlot === slot.timeUtc;
                  return (
                    <button
                      key={slot.timeUtc}
                      type="button"
                      disabled={!slot.available}
                      onClick={() => setSelectedSlot(slot.timeUtc)}
                      className={`px-2.5 py-2 rounded-lg text-xs font-semibold border transition-all text-center ${
                        isSelected
                          ? "bg-electric-500 text-charcoal-950 border-electric-400 font-bold shadow-md"
                          : slot.available
                          ? "bg-charcoal-800 text-slate-200 border-white/10 hover:border-electric-400 hover:text-white"
                          : "bg-charcoal-900/40 text-slate-600 border-white/5 cursor-not-allowed line-through"
                      }`}
                      title={slot.reason || slot.timeFormatted}
                    >
                      {slot.timeFormatted}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
              Brief Project Notes (Optional)
            </label>
            <textarea
              rows={2}
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Tell us what you're planning to engineer..."
              className="w-full px-3.5 py-2 rounded-xl bg-charcoal-800 border border-white/10 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-electric-400 resize-none"
            />
          </div>

          <div className="pt-2 flex items-center justify-end gap-2 border-t border-white/5">
            <Button type="button" variant="ghost" size="sm" onClick={onClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              isLoading={isLoading}
              disabled={!selectedSlot}
            >
              Confirm Reservation
            </Button>
          </div>
        </form>
      )}
    </Modal>
  );
};

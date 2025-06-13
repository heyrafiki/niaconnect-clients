"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle, DialogDescription, DialogClose, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from "lucide-react";

function capitalize(str: string) {
  return str ? str.charAt(0).toUpperCase() + str.slice(1).toLowerCase() : "";
}

export default function ExpertDetailsPage() {
  const { id } = useParams();
  const [expert, setExpert] = useState<any>(null);
  const [availability, setAvailability] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<{ day: number; start: string; end: string } | null>(null);
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    Promise.all([
      fetch(`/api/experts/${id}`).then(res => res.json()),
      fetch(`/api/experts/${id}/availability`).then(res => res.json()),
    ])
      .then(([expertData, availData]) => {
        setExpert(expertData.expert);
        setAvailability(availData.availability || []);
        setLoading(false);
      })
      .catch(() => {
        setError("Failed to load expert details.");
        setLoading(false);
      });
  }, [id]);

  if (loading) return <div className="text-center text-gray-500 py-12">Loading...</div>;
  if (error || !expert) return <div className="text-center text-red-500 py-12">{error || "Expert not found."}</div>;

  // Helper to get nested onboarding fields with fallback
  function getExpertField(key: string) {
    return expert.onboarding?.[key] ?? expert[key] ?? "";
  }

  return (
    <div className="max-w-3xl mx-auto p-4 md:p-8">
      <div className="bg-white rounded-2xl shadow-lg p-6 md:p-10 flex flex-col md:flex-row gap-8">
        <div className="flex flex-col items-center md:items-start md:w-1/3">
          <Avatar className="h-24 w-24 mb-4">
            {getExpertField("profile_img_url") ? (
              <AvatarImage src={getExpertField("profile_img_url")} alt={getExpertField("first_name")} />
            ) : (
              <AvatarFallback className="text-4xl font-bold bg-heyrafiki-green/10 text-heyrafiki-green">
                {capitalize(getExpertField("first_name")?.[0] || "?")}
              </AvatarFallback>
            )}
          </Avatar>
          <div className="text-center md:text-left">
            <div className="font-bold text-2xl text-gray-900 mb-1">{capitalize(getExpertField("first_name"))} {capitalize(getExpertField("last_name"))}</div>
            <div className="text-sm text-gray-500 mb-2">{getExpertField("location")}</div>
            <div className="text-xs text-gray-400">{getExpertField("license_type")} ({getExpertField("license_number")})</div>
            <div className="text-xs text-gray-400">{getExpertField("years_of_experience")} years experience</div>
          </div>
        </div>
        <div className="flex-1 flex flex-col gap-4">
          <section>
            <h2 className="font-semibold text-heyrafiki-green mb-1">About</h2>
            <p className="text-gray-700 text-sm">{getExpertField("bio")}</p>
          </section>
          <section>
            <h2 className="font-semibold text-heyrafiki-green mb-1">Specialties</h2>
            <div className="flex flex-wrap gap-2">
              {(getExpertField("specialties") || []).map((s: string) => (
                <span key={s} className="text-xs px-2 py-0.5 bg-heyrafiki-green/10 text-heyrafiki-green rounded-full font-medium">
                  {capitalize(s)}
                </span>
              ))}
            </div>
          </section>
          <section>
            <h2 className="font-semibold text-heyrafiki-green mb-1">Session Types</h2>
            <div className="flex flex-wrap gap-2">
              {(getExpertField("session_types") || []).map((type: string) => (
                <span key={type} className="text-xs px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full font-medium">
                  {type}
                </span>
              ))}
            </div>
          </section>
          <section>
            <h2 className="font-semibold text-heyrafiki-green mb-1">Client Demographics</h2>
            <div className="flex flex-wrap gap-2">
              {(getExpertField("client_demographics") || []).map((d: string) => (
                <span key={d} className="text-xs px-2 py-0.5 bg-gray-100 text-gray-700 rounded-full font-medium">
                  {d}
                </span>
              ))}
            </div>
          </section>
          <section>
            <h2 className="font-semibold text-heyrafiki-green mb-1">Treatment Modalities</h2>
            <div className="flex flex-wrap gap-2">
              {(getExpertField("treatment_modalities") || []).map((m: string) => (
                <span key={m} className="text-xs px-2 py-0.5 bg-purple-100 text-purple-700 rounded-full font-medium">
                  {m}
                </span>
              ))}
            </div>
          </section>
          <section>
            <h2 className="font-semibold text-heyrafiki-green mb-1">Session Rate</h2>
            <div className="text-sm text-gray-700">{getExpertField("session_rate") ? `KES ${getExpertField("session_rate")} per session` : "-"}</div>
          </section>
          <section>
            <h2 className="font-semibold text-heyrafiki-green mb-1">Availability</h2>
            <div className="flex flex-col gap-1">
              {availability.length === 0 ? (
                <span className="text-xs text-gray-400">No availability info.</span>
              ) : (
                availability.map((slot, idx) => (
                  <span key={idx} className="text-xs text-gray-700">
                    {slot.day_of_week !== undefined ? ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"][slot.day_of_week] : ""}
                    {slot.time_slots && slot.time_slots.length > 0 &&
                      ": " + slot.time_slots.map((t: any) => `${t.start_time} - ${t.end_time}`).join(", ")}
                  </span>
                ))
              )}
            </div>
          </section>
          <div className="mt-6">
            <Dialog open={modalOpen} onOpenChange={setModalOpen}>
              <DialogTrigger asChild>
                <Button className="w-full max-w-xs">Book Session</Button>
              </DialogTrigger>
              <DialogContent className="max-w-lg">
                <DialogTitle>Book a Session with {capitalize(getExpertField("first_name"))}</DialogTitle>
                <DialogDescription className="mb-4 text-xs text-gray-500">Select an available slot and provide a reason for your session request.</DialogDescription>
                <div className="mb-4">
                  <div className="font-semibold text-heyrafiki-green mb-1">Availability</div>
                  {availability.length === 0 ? (
                    <div className="text-xs text-gray-400">No availability info.</div>
                  ) : (
                    <div className="flex flex-col gap-2">
                      {availability.map((slot, idx) => (
                        <div key={idx} className="flex flex-col gap-1">
                          <div className="text-xs text-gray-700 font-medium">
                            {slot.day_of_week !== undefined ? ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"][slot.day_of_week] : ""}
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {slot.time_slots.map((t: any, tIdx: number) => {
                              const isSelected = selectedSlot && selectedSlot.day === slot.day_of_week && selectedSlot.start === t.start_time && selectedSlot.end === t.end_time;
                              return (
                                <button
                                  key={tIdx}
                                  type="button"
                                  className={`px-3 py-1 rounded-full border text-xs font-medium transition-all ${isSelected ? "bg-heyrafiki-green text-white border-heyrafiki-green" : "bg-white text-heyrafiki-green border-heyrafiki-green hover:bg-heyrafiki-green/10"}`}
                                  onClick={() => setSelectedSlot({ day: slot.day_of_week, start: t.start_time, end: t.end_time })}
                                >
                                  {t.start_time} - {t.end_time}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <div className="mb-4">
                  <label className="block text-xs font-medium text-gray-700 mb-1">Reason for session</label>
                  <Textarea
                    value={reason}
                    onChange={e => setReason(e.target.value)}
                    placeholder="Describe why you want to book this session..."
                    className="min-h-[80px]"
                  />
                </div>
                {submitError && <div className="text-xs text-red-500 mb-2">{submitError}</div>}
                {submitSuccess && <div className="text-xs text-green-600 mb-2">Session request submitted successfully!</div>}
                <div className="flex gap-2 justify-end">
                  <DialogClose asChild>
                    <Button variant="outline" size="sm">Cancel</Button>
                  </DialogClose>
                  <Button
                    size="sm"
                    className="bg-heyrafiki-green text-white"
                    disabled={submitting || !selectedSlot || !reason.trim()}
                    onClick={async () => {
                      setSubmitting(true);
                      setSubmitError(null);
                      setSubmitSuccess(false);
                      try {
                        const res = await fetch("/api/session-requests", {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({
                            expert_id: expert._id,
                            requested_time: getNextDateForDay(selectedSlot!.day, selectedSlot!.start),
                            session_type: (getExpertField("session_types") || [])[0] || "",
                            reason,
                          }),
                        });
                        if (!res.ok) throw new Error((await res.json()).error || "Failed to submit request");
                        setSubmitSuccess(true);
                        setTimeout(() => setModalOpen(false), 1200);
                      } catch (e: any) {
                        setSubmitError(e.message || "Failed to submit request");
                      } finally {
                        setSubmitting(false);
                      }
                    }}
                  >
                    {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Submit Request"}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>
    </div>
  );
}

// Helper to get the next date for a given day of week and time (returns ISO string)
function getNextDateForDay(dayOfWeek: number, time: string) {
  const now = new Date();
  const result = new Date(now);
  result.setDate(now.getDate() + ((7 + dayOfWeek - now.getDay()) % 7));
  const [hours, minutes] = time.split(":").map(Number);
  result.setHours(hours, minutes, 0, 0);
  return result.toISOString();
} 
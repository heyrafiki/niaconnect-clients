"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle, DialogDescription, DialogClose, DialogHeader, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from "lucide-react";
import { useSession } from "next-auth/react";
import { Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from '@/components/ui/calendar';

function capitalize(str: string) {
  return str ? str.charAt(0).toUpperCase() + str.slice(1).toLowerCase() : "";
}

export default function ExpertDetailsPage() {
  const { id } = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const [expert, setExpert] = useState<any>(null);
  const [availability, setAvailability] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<{ day: number; start: string; end: string } | null>(null);
  const [selectedSessionType, setSelectedSessionType] = useState<string>("");
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [clientSessions, setClientSessions] = useState<any[]>([]);
  const [sessionsLoading, setSessionsLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [availableTimesForDate, setAvailableTimesForDate] = useState<string[]>([]);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [rescheduleModalOpen, setRescheduleModalOpen] = useState(false);
  const [currentRequest, setCurrentRequest] = useState<any>(null);
  const [newRequestedDate, setNewRequestedDate] = useState<Date | null>(null);
  const [newAvailableTimes, setNewAvailableTimes] = useState<string[]>([]);
  const [newRequestedSlot, setNewRequestedSlot] = useState<{ start: string; end: string } | null>(null);
  const [newReason, setNewReason] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

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

  // Fetch client sessions with this expert
  useEffect(() => {
    if (!session?.user?.id || !id) return;
    setSessionsLoading(true);
    fetch(`/api/sessions?client_id=${session.user.id}`)
      .then(res => res.json())
      .then(data => {
        // Filter for this expert
        const filtered = (data.events || []).filter((ev: any) => {
          const expertId = ev.expert_id?._id || ev.expert_id;
          return String(expertId) === String(id);
        });
        setClientSessions(filtered);
        setSessionsLoading(false);
      })
      .catch(() => setSessionsLoading(false));
  }, [session?.user?.id, id]);

  if (loading) return <div className="flex justify-center items-center py-24"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  if (error || !expert) return <div className="text-center text-destructive py-12">{error || "Expert not found."}</div>;

  function getExpertField(key: string) {
    return expert.onboarding?.[key] ?? expert[key] ?? "";
  }

  // Helper: deduplicate sessions/requests (accepted = scheduled)
  function dedupeSessions(sessions) {
    const seen = new Set();
    return sessions.filter((s) => {
      // Use expert, session_type, and time as key
      const isSession = !!s.start_time;
      const time = isSession ? s.start_time : s.requested_time;
      let status = s.status;
      // Treat accepted as scheduled
      if (status === 'accepted') status = 'scheduled';
      const key = `${s.expert_id?._id || s.expert_id}|${s.session_type}|${new Date(time).toISOString()}|${status}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }

  // Dedupe sessions for display
  const dedupedSessions = dedupeSessions(clientSessions);

  // Helper to fetch and set available times for a date
  async function fetchAvailableTimesForDate(date: Date) {
    if (!id) return [];
    const res = await fetch(`/api/experts/${id}/availability`);
    const data = await res.json();
    const dayOfWeek = date.getDay();
    const slots = (data.availability || []).filter((slot: any) => slot.day_of_week === dayOfWeek);
    const times: string[] = [];
    slots.forEach((slot: any) => {
      slot.time_slots.forEach((t: any) => {
        times.push(`${t.start_time} - ${t.end_time}`);
      });
    });
    setNewAvailableTimes(times);
    return times;
  }

  return (
    <div className="min-h-screen text-foreground">
      {/* Breadcrumb */}
      <Breadcrumb className="mb-6">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/client/experts">Experts</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{capitalize(getExpertField("first_name"))} {capitalize(getExpertField("last_name"))}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* HEADER SECTION */}
      <section className="grid grid-cols-1 md:grid-cols-4 md:gap-8 w-full mb-10 bg-background p-4 md:py-8 md:px-6 rounded-xl">
        <div className="flex flex-col items-center col-span-1 gap-4 border-[1.6px] rounded-xl p-4 border-border w-full mb-4 md:mb-[0]">
          <Avatar className="h-28 w-28 mb-2">
            {getExpertField("profile_img_url") ? (
              <AvatarImage src={getExpertField("profile_img_url")} alt={getExpertField("first_name")} />
            ) : (
              <AvatarFallback className="text-4xl font-bold bg-primary/10 text-primary">
                {capitalize(getExpertField("first_name")?.[0] || "?")}
              </AvatarFallback>
            )}
          </Avatar>
          <div className="">
            <div className="font-bold text-2xl md:text-3xl text-foreground mb-1 text-center">{capitalize(getExpertField("first_name"))} {capitalize(getExpertField("last_name"))}</div>
            <div className="text-sm text-muted-foreground mb-2 text-center">{getExpertField("location")}</div>
            <div className="text-xs sm:text-sm mt-4 text-foreground/70"><b>License: </b>{getExpertField("license_type")} ({getExpertField("license_number")})</div>
            <div className="text-xs sm:text-sm text-foreground/70"><b>Experience: </b>{getExpertField("years_of_experience")} years</div>
          </div>
          <Button className="mt-2 w-full" variant="secondary">Send Message</Button>
        </div>

        <div className="col-span-3 flex flex-col gap-6 w-full">
          {/* ABOUT & EXPERTISE */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <section>
              <h2 className="font-semibold text-primary mb-1">About</h2>
              <p className="text-muted-foreground text-sm">{getExpertField("bio")}</p>
            </section>
            <section>
              <h2 className="font-semibold text-primary mb-1">Session Rate</h2>
              <div className="text-sm text-foreground">{getExpertField("session_rate") ? `KES ${getExpertField("session_rate")} per session` : "-"}</div>
            </section>

            <section>
              <h2 className="font-semibold text-primary mb-1">Specialties</h2>
              <div className="flex flex-wrap gap-2">
                {(getExpertField("specialties") || []).map((s: string) => (
                  <span key={s} className="text-xs px-2 py-0.5 bg-muted text-foreground/70 rounded-full font-medium">
                    {capitalize(s)}
                  </span>
                ))}
              </div>
            </section>
            <section>
              <h2 className="font-semibold text-primary mb-1">Session Types</h2>
              <div className="flex flex-wrap gap-2">
                {(getExpertField("session_types") || []).map((type: string) => (
                  <span key={type} className="text-xs px-2 py-0.5 bg-muted text-foreground/70 rounded-full font-medium">
                    {type}
                  </span>
                ))}
              </div>
            </section>
            <section>
              <h2 className="font-semibold text-primary mb-1">Client Demographics</h2>
              <div className="flex flex-wrap gap-2">
                {(getExpertField("client_demographics") || []).map((d: string) => (
                  <span key={d} className="text-xs px-2 py-0.5 bg-muted text-foreground/70 rounded-full font-medium">
                    {d}
                  </span>
                ))}
              </div>
            </section>
            <section>
              <h2 className="font-semibold text-primary mb-1">Treatment Modalities</h2>
              <div className="flex flex-wrap gap-2">
                {(getExpertField("treatment_modalities") || []).map((m: string) => (
                  <span key={m} className="text-xs px-2 py-0.5 bg-muted text-foreground/70 rounded-full font-medium">
                    {m}
                  </span>
                ))}
              </div>
            </section>
          </div>
          {/* AVAILABILITY */}
          <section className="mt-4">
            <h2 className="font-semibold text-primary mb-1">Availability</h2>
            <div className="flex flex-col gap-1">
              {availability.length === 0 ? (
                <span className="text-xs text-muted-foreground">No availability info.</span>
              ) : (
                availability.map((slot, idx) => (
                  <span key={idx} className="text-xs text-foreground">
                    {slot.day_of_week !== undefined ? ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"][slot.day_of_week] : ""}
                    {slot.time_slots && slot.time_slots.length > 0 &&
                      ": " + slot.time_slots.map((t: any) => `${t.start_time} - ${t.end_time}`).join(", ")}
                  </span>
                ))
              )}
            </div>
          </section>
        </div>
      </section>

      {/* SESSIONS SECTION */}
      <section className="mt-8 mb-12">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-2 gap-2">
          <h2 className="font-semibold text-primary text-lg">Your Sessions with this Expert</h2>
          <Button onClick={() => setModalOpen(true)} className="w-full md:w-auto">Book Session</Button>
        </div>
        <div className="rounded-xl border border-border bg-card p-4 shadow-sm overflow-x-auto">
          {sessionsLoading ? (
            <div className="text-xs text-muted-foreground">Loading...</div>
          ) : dedupedSessions.length === 0 ? (
            <div className="text-xs text-muted-foreground">You have no sessions or requests with this expert yet.</div>
          ) : (
            <ul className="space-y-3">
              {dedupedSessions.map((s, i) => {
                const isSession = !!s.start_time;
                const status = s.status === 'accepted' ? 'scheduled' : s.status;
                const isPending = status === 'pending';
                const isScheduled = status === 'scheduled';
                const isCompleted = status === 'completed';
                const isDeclined = status === 'declined';
                const isCancelled = status === 'cancelled';
                const isRescheduled = status === 'rescheduled';
                const isFuture = new Date(isSession ? s.start_time : s.requested_time) > new Date();
                return (
                  <li key={s._id || i} className="flex flex-col md:flex-row md:items-center md:gap-4 gap-1 border-b last:border-b-0 border-border pb-2">
                    <div className="flex-1 flex flex-col md:flex-row md:items-center gap-2">
                      <span className="font-medium capitalize text-foreground">{status}</span>
                      <span className="text-muted-foreground">{isSession ? new Date(s.start_time).toLocaleString() : (s.requested_time ? new Date(s.requested_time).toLocaleString() : "-")}</span>
                      <span className="text-muted-foreground">{s.session_type}</span>
                    </div>
                    <div className="flex gap-2 mt-1 md:mt-0">
                      {isPending && (
                        <>
                          <Button size="sm" variant="outline" onClick={() => { setCurrentRequest(s); setEditModalOpen(true); setNewRequestedDate(s.requested_time ? new Date(s.requested_time) : null); setNewReason(s.reason || ""); fetchAvailableTimesForDate(new Date(s.requested_time)); }}>Edit</Button>
                          <Button size="sm" variant="destructive" onClick={() => { setCurrentRequest(s); setDeleteModalOpen(true); }}>Delete</Button>
                        </>
                      )}
                      {isScheduled && isFuture && (
                        <>
                          {s.meeting_url && <Button size="sm" variant="default" onClick={() => window.open(s.meeting_url, '_blank')}>Join</Button>}
                          <Button size="sm" variant="outline" onClick={() => { setCurrentRequest(s); setRescheduleModalOpen(true); setNewRequestedDate(s.start_time ? new Date(s.start_time) : null); setNewReason(s.reason || ""); fetchAvailableTimesForDate(new Date(s.start_time)); }}>Reschedule</Button>
                          <Button size="sm" variant="destructive" onClick={() => { setCurrentRequest(s); setDeleteModalOpen(true); }}>Cancel</Button>
                        </>
                      )}
                      {isCompleted && (
                        <Button size="sm" variant="outline" onClick={() => {/* TODO: feedback modal */}}>Give Feedback</Button>
                      )}
                      {(isDeclined || isCancelled || isRescheduled) && (
                        <Button size="sm" variant="default" onClick={() => setModalOpen(true)}>Book Again</Button>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </section>

      {/* BOOKING DIALOG */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-lg">
          <DialogTitle>Book a Session with {capitalize(getExpertField("first_name"))}</DialogTitle>
          <DialogDescription className="mb-4 text-xs text-muted-foreground">Select an available slot, session type, and provide a reason for your session request.</DialogDescription>
          {/* Session Type Selection */}
          <div className="mb-4">
            <label className="block text-xs font-medium text-foreground mb-1">Session Type</label>
            <Select value={selectedSessionType} onValueChange={setSelectedSessionType}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select session type" />
              </SelectTrigger>
              <SelectContent>
                {(getExpertField("session_types") || []).map((type: string) => (
                  <SelectItem key={type} value={type}>{type}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {/* Date Selection */}
          <div className="mb-4">
            <label className="block text-xs font-medium text-foreground mb-1">Date</label>
            <Calendar
              selected={selectedDate}
              onSelect={date => {
                setSelectedDate(date);
                // Find available slots for this date
                if (!date) return setAvailableTimesForDate([]);
                const dayOfWeek = date.getDay();
                const slots = availability.filter((slot: any) => slot.day_of_week === dayOfWeek);
                const times: string[] = [];
                slots.forEach((slot: any) => {
                  slot.time_slots.forEach((t: any) => {
                    times.push(`${t.start_time} - ${t.end_time}`);
                  });
                });
                setAvailableTimesForDate(times);
              }}
              disabled={date => {
                // Only enable days with availability
                const dayOfWeek = date.getDay();
                return !availability.some((slot: any) => slot.day_of_week === dayOfWeek);
              }}
            />
          </div>
          {/* Time Slot Selection */}
          <div className="mb-4">
            <label className="block text-xs font-medium text-foreground mb-1">Time Slot</label>
            <Select value={selectedSlot ? `${selectedSlot.start} - ${selectedSlot.end}` : ''} onValueChange={val => {
              const [start, end] = val.split(' - ');
              setSelectedSlot(selectedDate ? { day: selectedDate.getDay(), start, end } : null);
            }}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select time slot" />
              </SelectTrigger>
              <SelectContent>
                {availableTimesForDate.map((time, idx) => (
                  <SelectItem key={idx} value={time}>{time}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {/* Reason Input */}
          <div className="mb-4">
            <label className="block text-xs font-medium text-foreground mb-1">Reason for session</label>
            <Textarea
              value={reason}
              onChange={e => setReason(e.target.value)}
              placeholder="Describe why you want to book this session..."
              className="min-h-[80px] bg-background text-foreground"
            />
          </div>
          {submitError && <div className="text-xs text-destructive mb-2">{submitError}</div>}
          {submitSuccess && <div className="text-xs text-green-600 mb-2">Session request submitted successfully!</div>}
          <div className="flex gap-2 justify-end">
            <DialogClose asChild>
              <Button variant="outline" size="sm">Cancel</Button>
            </DialogClose>
            <Button
              size="sm"
              className="bg-primary text-primary-foreground"
              disabled={submitting || !selectedSlot || !reason.trim() || !selectedSessionType}
              onClick={async () => {
                setSubmitting(true);
                setSubmitError(null);
                setSubmitSuccess(false);
                try {
                  const slot = selectedSlot;
                  const sessionType = selectedSessionType;
                  if (!slot || !sessionType) throw new Error("Please select a slot and session type.");
                  // Compose start and end time as Date objects for the next occurrence of the selected day
                  const now = new Date();
                  const today = now.getDay();
                  let daysToAdd = slot.day - today;
                  if (daysToAdd < 0) daysToAdd += 7;
                  const nextDate = new Date(now);
                  nextDate.setDate(now.getDate() + daysToAdd);
                  // Set start time
                  const [startHour, startMinute] = slot.start.split(":").map(Number);
                  nextDate.setHours(startHour, startMinute, 0, 0);
                  const startTime = new Date(nextDate);
                  // Set end time
                  const [endHour, endMinute] = slot.end.split(":").map(Number);
                  const endTime = new Date(nextDate);
                  endTime.setHours(endHour, endMinute, 0, 0);
                  // Submit session request
                  const res = await fetch(`/api/session-requests`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      expert_id: id,
                      client_id: session.user.id,
                      session_type: sessionType,
                      reason: reason.trim(),
                      requested_time: startTime.toISOString(),
                    }),
                  });
                  if (!res.ok) throw new Error((await res.json()).error || "Failed to submit session request.");
                  setSubmitSuccess(true);
                  setModalOpen(false);
                  setSelectedSlot(null);
                  setSelectedSessionType("");
                  setReason("");
                  // Optionally refetch sessions
                } catch (err: any) {
                  setSubmitError(err.message || "Failed to submit session request.");
                } finally {
                  setSubmitting(false);
                }
              }}
            >
              {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Submit"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Modal */}
      <Dialog open={editModalOpen} onOpenChange={setEditModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Session Request</DialogTitle>
            <DialogDescription>Change the requested date, time, and reason for this session.</DialogDescription>
          </DialogHeader>
          <div className="mb-4">
            <label className="block text-xs font-medium text-foreground mb-1">Date</label>
            <Calendar
              selected={newRequestedDate}
              onSelect={async date => {
                setNewRequestedDate(date);
                if (date) await fetchAvailableTimesForDate(date);
              }}
              disabled={date => {
                const dayOfWeek = date.getDay();
                return !availability.some((slot: any) => slot.day_of_week === dayOfWeek);
              }}
            />
          </div>
          <div className="mb-4">
            <label className="block text-xs font-medium text-foreground mb-1">Time Slot</label>
            <Select value={newRequestedSlot ? `${newRequestedSlot.start} - ${newRequestedSlot.end}` : ''} onValueChange={val => {
              const [start, end] = val.split(' - ');
              setNewRequestedSlot({ start, end });
            }}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select time slot" />
              </SelectTrigger>
              <SelectContent>
                {newAvailableTimes.map((time, idx) => (
                  <SelectItem key={idx} value={time}>{time}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Textarea
            value={newReason}
            onChange={e => setNewReason(e.target.value)}
            placeholder="Reason for session"
            className="min-h-[80px] mb-3"
          />
          {actionError && <div className="text-xs text-destructive mb-2">{actionError}</div>}
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button onClick={async () => {
              setActionLoading(true);
              setActionError(null);
              try {
                if (!newRequestedDate || !newRequestedSlot) throw new Error('Please select a date and time slot.');
                const date = new Date(newRequestedDate);
                const [startHour, startMinute] = newRequestedSlot.start.split(":").map(Number);
                date.setHours(startHour, startMinute, 0, 0);
                const requested_time = date.toISOString();
                // PATCH session to reschedule
                const res = await fetch(`/api/session-requests/${currentRequest?._id}`, {
                  method: 'PATCH',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    requested_time,
                    reason: newReason,
                    status: 'rescheduled',
                  }),
                });
                if (!res.ok) throw new Error((await res.json()).error || 'Failed to update.');
                setEditModalOpen(false);
                setCurrentRequest(null);
                setNewRequestedDate(null);
                setNewRequestedSlot(null);
                setNewReason("");
                setActionError(null);
                // Optionally refetch sessions
              } catch (err: any) {
                setActionError(err.message || 'Failed to update.');
              } finally {
                setActionLoading(false);
              }
            }} disabled={actionLoading || !newRequestedDate || !newRequestedSlot}>
              {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save Changes'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Modal */}
      <Dialog open={deleteModalOpen} onOpenChange={setDeleteModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Session Request</DialogTitle>
            <DialogDescription>Are you sure you want to delete this session request?</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button onClick={async () => {
              setActionLoading(true);
              setActionError(null);
              try {
                if (!currentRequest) throw new Error('No session request selected.');
                // DELETE session request
                const res = await fetch(`/api/session-requests/${currentRequest._id}`, {
                  method: 'DELETE',
                });
                if (!res.ok) throw new Error((await res.json()).error || 'Failed to delete.');
                setDeleteModalOpen(false);
                setCurrentRequest(null);
                // Optionally refetch sessions
              } catch (err: any) {
                setActionError(err.message || 'Failed to delete.');
              } finally {
                setActionLoading(false);
              }
            }} disabled={actionLoading}>
              {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reschedule Modal */}
      <Dialog open={rescheduleModalOpen} onOpenChange={setRescheduleModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reschedule Session</DialogTitle>
            <DialogDescription>Select a new date and time for this session.</DialogDescription>
          </DialogHeader>
          <div className="mb-4">
            <label className="block text-xs font-medium text-foreground mb-1">Date</label>
            <Calendar
              selected={newRequestedDate}
              onSelect={async date => {
                setNewRequestedDate(date);
                if (date) await fetchAvailableTimesForDate(date);
              }}
              disabled={date => {
                const dayOfWeek = date.getDay();
                return !availability.some((slot: any) => slot.day_of_week === dayOfWeek);
              }}
            />
          </div>
          <div className="mb-4">
            <label className="block text-xs font-medium text-foreground mb-1">Time Slot</label>
            <Select value={newRequestedSlot ? `${newRequestedSlot.start} - ${newRequestedSlot.end}` : ''} onValueChange={val => {
              const [start, end] = val.split(' - ');
              setNewRequestedSlot({ start, end });
            }}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select time slot" />
              </SelectTrigger>
              <SelectContent>
                {newAvailableTimes.map((time, idx) => (
                  <SelectItem key={idx} value={time}>{time}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Textarea
            value={newReason}
            onChange={e => setNewReason(e.target.value)}
            placeholder="Reason for session"
            className="min-h-[80px] mb-3"
          />
          {actionError && <div className="text-xs text-destructive mb-2">{actionError}</div>}
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button onClick={async () => {
              setActionLoading(true);
              setActionError(null);
              try {
                if (!newRequestedDate || !newRequestedSlot) throw new Error('Please select a date and time slot.');
                const date = new Date(newRequestedDate);
                const [startHour, startMinute] = newRequestedSlot.start.split(":").map(Number);
                date.setHours(startHour, startMinute, 0, 0);
                const requested_time = date.toISOString();
                // PATCH session to reschedule
                const res = await fetch(`/api/session-requests/${currentRequest?._id}`, {
                  method: 'PATCH',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    requested_time,
                    reason: newReason,
                    status: 'rescheduled',
                  }),
                });
                if (!res.ok) throw new Error((await res.json()).error || 'Failed to update.');
                setRescheduleModalOpen(false);
                setCurrentRequest(null);
                setNewRequestedDate(null);
                setNewRequestedSlot(null);
                setNewReason("");
                setActionError(null);
                // Optionally refetch sessions
              } catch (err: any) {
                setActionError(err.message || 'Failed to update.');
              } finally {
                setActionLoading(false);
              }
            }} disabled={actionLoading || !newRequestedDate || !newRequestedSlot}>
              {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save Changes'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
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
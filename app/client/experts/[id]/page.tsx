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
import SessionRequestModal from '@/components/sessions/SessionRequest';
import { Card, CardHeader, CardContent } from "@/components/ui/card";

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

  // Helper to get the first available date
  const firstAvailableDay = React.useMemo(() => {
    if (!availability.length) return undefined;
    const today = new Date();
    for (let i = 0; i < 60; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      if (availability.some(slot => slot.day_of_week === d.getDay())) {
        return d;
      }
    }
    return today;
  }, [availability]);

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
      .catch((error) => {
        console.error('Error loading expert data:', error);
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

  // Helper to check if a date has availability
  function hasAvailabilityForDate(date: Date) {
    const dayOfWeek = date.getDay();
    return availability.some((slot: any) => slot.day_of_week === dayOfWeek);
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

      {/* Responsive Grid Layout */}
      <div className="flex flex-col lg:flex-row gap-6 w-full">
        {/* LEFT PANEL: Expert Details (65%) */}
        <div className="w-full lg:w-[65%] p-2 lg:border lg:border-border rounded-xl lg:py-6 lg:px-4 flex-shrink-0 flex flex-col gap-6 bg-background">
          {/* HEADER SECTION */}
          <section className="p-4 md:py-8 md:px-6 rounded-xl border border-border flex flex-col items-center gap-4">
            <Avatar className="h-28 w-28 mb-2">
              {getExpertField("profile_img_url") ? (
                <AvatarImage src={getExpertField("profile_img_url")} alt={getExpertField("first_name")} />
              ) : (
                <AvatarFallback className="text-4xl font-bold bg-primary/10 text-primary">
                  {capitalize(getExpertField("first_name")?.[0] || "?")}
                </AvatarFallback>
              )}
            </Avatar>
            <div className="w-full flex flex-col items-center">
              <div className="font-bold text-2xl md:text-3xl text-foreground mb-1 text-center">{capitalize(getExpertField("first_name"))} {capitalize(getExpertField("last_name"))}</div>
              <div className="text-sm text-muted-foreground mb-2 text-center">{getExpertField("location")}</div>
              <div className="text-xs sm:text-sm mt-4 text-foreground/70"><b>License: </b>{getExpertField("license_type")} ({getExpertField("license_number")})</div>
              <div className="text-xs sm:text-sm text-foreground/70"><b>Experience: </b>{getExpertField("years_of_experience")} years</div>
            </div>
            <Button className="mt-2 w-full max-w-xs" variant="secondary">Send Message</Button>
          </section>

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
                <span className="text-xs text-muted-foreground">No availability set. Please contact the expert directly.</span>
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

        {/* RIGHT PANEL: Sessions (35%) */}
        <div className="w-full lg:w-[35%] p-2 flex flex-col gap-4 lg:border lg:border-border rounded-xl lg:py-6 lg:px-4 bg-background">
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-2 gap-2">
            <h2 className="font-semibold text-foreground/65 text-lg">Your Sessions with this Expert</h2>
            <Button 
              onClick={() => setModalOpen(true)} 
              className="w-full md:w-auto bg-primary-accent hover:bg-primary-bright"
              disabled={availability.length === 0}
            >
              {availability.length === 0 ? 'No Availability' : 'Book Session'}
            </Button>
          </div>
          <div className="rounded-xl border border-border bg-card p-2 shadow-sm overflow-x-auto min-h-[120px] h-full">
            {sessionsLoading ? (
              <div className="text-xs text-muted-foreground">Loading...</div>
            ) : dedupedSessions.length === 0 ? (
              <div className="text-xs text-muted-foreground">You have no sessions or requests with this expert yet.</div>
            ) : (
              <div className="flex flex-col gap-3">
                {dedupedSessions.map((event, i) => {
                  // --- Begin: Compact Card Design (copied from sessions/page.tsx) ---
                  const isSession = !!event.start_time;
                  const expertObj = isSession ? event.expert_id : event.expert_id;
                  const dateTime = isSession ? new Date(event.start_time) : new Date(event.requested_time);
                  const status = event.status === 'accepted' ? 'scheduled' : event.status;
                  const isPending = status === 'pending';
                  const isAccepted = status === 'accepted';
                  const isDeclined = status === 'declined';
                  const isRescheduled = status === 'rescheduled';
                  const isScheduled = status === 'scheduled';
                  const isCompleted = status === 'completed';
                  const isCancelled = status === 'cancelled';
                  const isFuture = isSession ? new Date(event.start_time) > new Date() : new Date(event.requested_time) > new Date();
                  const canJoin = isSession && event.meeting_url && new Date() >= new Date(event.start_time) && new Date() <= new Date(event.end_time);

                  let statusColor = '';
                  let statusBorderColor = '';
                  if (isSession) {
                    switch (status) {
                      case 'scheduled': statusColor = 'hsl(var(--session-scheduled))'; statusBorderColor = 'border-green-500'; break;
                      case 'completed': statusColor = 'hsl(var(--session-completed))'; statusBorderColor = 'border-gray-500'; break;
                      case 'cancelled': statusColor = 'hsl(var(--session-cancelled))'; statusBorderColor = 'border-red-500'; break;
                    }
                  } else {
                    switch (status) {
                      case 'pending': statusColor = 'hsl(var(--request-pending))'; statusBorderColor = 'border-yellow-500'; break;
                      case 'accepted': statusColor = 'hsl(var(--request-accepted))'; statusBorderColor = 'border-blue-500'; break;
                      case 'declined': statusColor = 'hsl(var(--request-declined))'; statusBorderColor = 'border-red-500'; break;
                      case 'rescheduled': statusColor = 'hsl(var(--request-rescheduled))'; statusBorderColor = 'border-purple-500'; break;
                    }
                  }
                  const isManageableRequest = !isSession && (isPending || isRescheduled);
                  // --- End: Compact Card Design ---
                  return (
                    <Card key={event._id || i} className={`group border-l-4 ${statusBorderColor} rounded-[10px] shadow-sm hover:shadow-md transition-shadow duration-150 flex flex-col relative overflow-hidden bg-card/90`}>
                      <div className="absolute inset-y-0 left-0 w-1.5" style={{ backgroundColor: statusColor }}></div>
                      <CardHeader className="flex-row items-center justify-between gap-2 p-3 pb-1 space-y-0">
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="truncate text-base font-semibold text-foreground/85">{dateTime.toLocaleString()}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded text-xs" style={{ backgroundColor: statusColor, color: '#fff' }}>{status.charAt(0).toUpperCase() + status.slice(1)}</span>
                        </div>
                      </CardHeader>
                      <CardContent className="px-3 pt-0 pb-3 flex flex-col gap-1">
                        <div className="flex items-center gap-2 min-w-0">
                          <h3 className="truncate text-sm font-medium text-foreground/80">
                            {capitalize(getExpertField("first_name"))} {capitalize(getExpertField("last_name"))}
                          </h3>
                          <span className="text-xs text-gray-400">• {isSession ? 'Session' : 'Request'} • {event.session_type}</span>
                        </div>
                        {event.reason && (
                          <div className="text-xs text-gray-500 italic truncate" title={event.reason || event.notes}>
                            {event.reason}
                          </div>
                        )}
                        {!isSession && isDeclined && event.reason && (
                          <div className="mt-1 p-1 bg-red-50 border border-red-200 rounded text-red-700 text-xs">
                            <span className="font-semibold">Declined Reason:</span> {event.reason}
                          </div>
                        )}
                        {isSession && (isScheduled || isCompleted) && event.meeting_url && (
                          <div className="mt-1">
                            <a 
                              href={event.meeting_url} 
                              target="_blank" 
                              rel="noopener noreferrer" 
                              className="text-primary hover:underline inline-flex items-center text-xs font-medium"
                            >
                              Join Session
                            </a>
                          </div>
                        )}
                        {isManageableRequest && (
                          <div className="mt-2 flex gap-2">
                            <Button variant="outline" size="sm" className="px-2 py-1 h-7 text-xs" onClick={() => {
                              setCurrentRequest(event);
                              setEditModalOpen(true);
                              setNewRequestedDate(event.requested_time ? new Date(event.requested_time) : null);
                              setNewReason(event.reason || "");
                              fetchAvailableTimesForDate(new Date(event.requested_time));
                            }}>
                              Edit
                            </Button>
                            <Button variant="destructive" size="sm" className="px-2 py-1 h-7 text-xs" onClick={() => { setCurrentRequest(event); setDeleteModalOpen(true); }}>Delete</Button>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* BOOKING DIALOG */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-lg">
          <DialogTitle>Book a Session with {capitalize(getExpertField("first_name"))}</DialogTitle>
          <DialogDescription className="mb-4 text-xs text-muted-foreground">
            Select an available slot, session type, and provide a reason for your session request.
          </DialogDescription>
          <SessionRequestModal
            expertId={id as string}
            sessionTypes={getExpertField("session_types") || []}
            open={modalOpen}
            onOpenChange={setModalOpen}
            clientId={session?.user?.id}
            mode="create"
            onSuccess={() => {
              // Refetch sessions after booking
              fetch(`/api/sessions?client_id=${session.user.id}`)
                .then(res => res.json())
                .then(data => {
                  const filtered = (data.events || []).filter((ev: any) => {
                    const expertId = ev.expert_id?._id || ev.expert_id;
                    return String(expertId) === String(id);
                  });
                  setClientSessions(filtered);
                })
                .catch(() => {});
            }}
          />
        </DialogContent>
      </Dialog>

      {/* Edit Modal */}
      <Dialog open={editModalOpen} onOpenChange={setEditModalOpen}>
        <DialogContent className="max-w-lg">
          <DialogTitle>Edit Session Request</DialogTitle>
          <DialogDescription className="mb-4 text-xs text-muted-foreground">
            Change the requested date, time, and reason for this session.
          </DialogDescription>
          {currentRequest && (
            <SessionRequestModal
              expertId={id as string}
              sessionTypes={getExpertField("session_types") || []}
              open={editModalOpen}
              onOpenChange={setEditModalOpen}
              clientId={session?.user?.id}
              mode="edit"
              initialData={{
                sessionType: currentRequest.session_type,
                date: currentRequest.requested_time ? new Date(currentRequest.requested_time) : null,
                timeSlot: null, // Will be set by user
                reason: currentRequest.reason || '',
                requestId: currentRequest._id,
              }}
              onSuccess={() => {
                // Refetch sessions after edit
                fetch(`/api/sessions?client_id=${session.user.id}`)
                  .then(res => res.json())
                  .then(data => {
                    const filtered = (data.events || []).filter((ev: any) => {
                      const expertId = ev.expert_id?._id || ev.expert_id;
                      return String(expertId) === String(id);
                    });
                    setClientSessions(filtered);
                  })
                  .catch(() => {});
              }}
            />
          )}
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
                // Refetch sessions to update the list
                fetch(`/api/sessions?client_id=${session.user.id}`)
                  .then(res => res.json())
                  .then(data => {
                    const filtered = (data.events || []).filter((ev: any) => {
                      const expertId = ev.expert_id?._id || ev.expert_id;
                      return String(expertId) === String(id);
                    });
                    setClientSessions(filtered);
                  })
                  .catch(() => {});
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
      <Dialog open={rescheduleModalOpen} onOpenChange={(open) => {
        setRescheduleModalOpen(open);
        if (!open) {
          // Clean up state when modal is closed
          setCurrentRequest(null);
          setNewRequestedDate(null);
          setNewRequestedSlot(null);
          setNewReason("");
          setNewAvailableTimes([]);
          setActionError(null);
        }
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reschedule Session</DialogTitle>
            <DialogDescription>Select a new date and time for this session.</DialogDescription>
          </DialogHeader>
          <div className="mb-4">
            <label className="block text-xs font-medium text-foreground mb-1">Date</label>
            {loading ? <div>Loading...</div> : (
              <Calendar
                key={availability.map(a => a.day_of_week).join(',')}
                defaultMonth={firstAvailableDay}
                selected={newRequestedDate}
                onSelect={async date => {
                  setNewRequestedDate(date);
                  if (date) await fetchAvailableTimesForDate(date);
                }}
                disabled={date => {
                  return !hasAvailabilityForDate(date);
                }}
              />
            )}
          </div>
          <div className="mb-4">
            <label className="block text-xs font-medium text-foreground mb-1">Time Slot</label>
            {newAvailableTimes.length === 0 ? (
              <div className="text-xs text-muted-foreground p-2 bg-muted rounded">
                {newRequestedDate ? 'No time slots available for this date.' : 'Please select a date first.'}
              </div>
            ) : (
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
            )}
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
                // Refetch sessions to update the list
                fetch(`/api/sessions?client_id=${session.user.id}`)
                  .then(res => res.json())
                  .then(data => {
                    const filtered = (data.events || []).filter((ev: any) => {
                      const expertId = ev.expert_id?._id || ev.expert_id;
                      return String(expertId) === String(id);
                    });
                    setClientSessions(filtered);
                  })
                  .catch(() => {});
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
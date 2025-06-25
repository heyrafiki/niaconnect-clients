"use client"

import React, { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, CalendarClock, Ban, CheckCircle2, CircleDashed, Edit, Trash2, ArrowRight } from 'lucide-react';
import { Session, SessionRequest } from '@/types/expert'; // Assuming these types are correct and shared
import { format, isFuture, isPast } from 'date-fns';
import { Dialog, DialogContent, DialogHeader, DialogFooter, DialogTitle, DialogDescription, DialogClose } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
} from '@/components/ui/alert-dialog';
import { Calendar } from '@/components/ui/calendar';

// Helper to capitalize strings for display
function capitalize(str: string) {
  return str ? str.charAt(0).toUpperCase() + str.slice(1).toLowerCase() : "";
}

const ALL_STATUSES = [
  'all',
  'pending',
  'accepted',
  'declined',
  'rescheduled',
  'scheduled',
  'completed',
  'cancelled',
];

export default function SessionsPage() {
  const { data: session } = useSession();
  const [events, setEvents] = useState<(Session | SessionRequest)[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [firstTime, setFirstTime] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [currentRequest, setCurrentRequest] = useState<SessionRequest | null>(null);
  const [newRequestedTime, setNewRequestedTime] = useState<string>('');
  const [newReason, setNewReason] = useState<string>('');
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [rescheduleModalOpen, setRescheduleModalOpen] = useState(false);
  const [currentSession, setCurrentSession] = useState<Session | null>(null);
  const [rescheduleAvailability, setRescheduleAvailability] = useState<any[]>([]);
  const [rescheduleSlot, setRescheduleSlot] = useState<string>("");
  const [rescheduleReason, setRescheduleReason] = useState("");
  const [rescheduleLoading, setRescheduleLoading] = useState(false);
  const [editRequestedDate, setEditRequestedDate] = useState<Date | null>(null);
  const [editAvailableTimes, setEditAvailableTimes] = useState<string[]>([]);
  const [editRequestedSlot, setEditRequestedSlot] = useState<{ start: string; end: string } | null>(null);

  const fetchEvents = async () => {
    if (!session?.user?.id) return;
    setLoading(true);
    setError(null);
    try {
      let url = `/api/sessions?client_id=${session.user.id}`;
      if (filterStatus !== 'all') {
        url += `&status=${filterStatus}`;
      }
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch sessions and requests.");
      const data = await res.json();
      setEvents(data.events || []);
      setFirstTime((data.events || []).length === 0);
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, [session?.user?.id, filterStatus]); // Re-fetch when filterStatus changes

  const handleEditRequest = async () => {
    if (!currentRequest || !newRequestedTime || !newReason.trim()) {
      setActionError("Please select a new time and provide a reason.");
      return;
    }
    setActionLoading(true);
    setActionError(null);
    setActionSuccess(null);
    try {
      const res = await fetch(`/api/session-requests/${currentRequest._id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          requested_time: new Date(newRequestedTime).toISOString(),
          reason: newReason.trim(),
          status: 'rescheduled' // Set status to rescheduled after client initiates edit
        }),
      });
      if (!res.ok) throw new Error((await res.json()).error || "Failed to update session request.");
      setActionSuccess("Session request updated successfully!");
      setEditModalOpen(false);
      fetchEvents(); // Re-fetch events to update UI
    } catch (err: any) {
      setActionError(err.message || "Failed to update session request.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteRequest = async () => {
    if (!currentRequest) return;
    setActionLoading(true);
    setActionError(null);
    setActionSuccess(null);
    try {
      const res = await fetch(`/api/session-requests/${currentRequest._id}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error((await res.json()).error || "Failed to delete session request.");
      setActionSuccess("Session request deleted successfully!");
      setDeleteModalOpen(false);
      fetchEvents(); // Re-fetch events to update UI
    } catch (err: any) {
      setActionError(err.message || "Failed to delete session request.");
    } finally {
      setActionLoading(false);
    }
  };

  // Deduplicate events: if both a Session and SessionRequest exist for the same expert and time, prefer Session
  const dedupedEvents = React.useMemo(() => {
    const sessionKeys = new Set<string>();
    const deduped: (Session | SessionRequest)[] = [];
    for (const event of events) {
      const isSession = (event as Session).start_time !== undefined;
      const expertId = isSession ? (event as Session).expert_id?._id || (event as Session).expert_id : (event as SessionRequest).expert_id?._id || (event as SessionRequest).expert_id;
      const time = isSession ? (event as Session).start_time : (event as SessionRequest).requested_time;
      const key = String(expertId) + '|' + String(new Date(time).toISOString());
      if (isSession) {
        sessionKeys.add(key);
        deduped.push(event);
      } else if (!sessionKeys.has(key)) {
        deduped.push(event);
      }
    }
    
    if (filterStatus && filterStatus !== 'all') {
      return deduped.filter(event => event.status === filterStatus);
    }
    return deduped;
  }, [events, filterStatus]);

  // Helper: get status tag
  function getStatusTag(event) {
    const isSession = (event as Session).start_time !== undefined;
    const status = event.status;
    if (status === 'completed') return <span className="px-2 py-0.5 rounded bg-green-100 text-green-700 text-xs">complete</span>;
    if (status === 'scheduled') {
      const now = new Date();
      const start = new Date((event as Session).start_time);
      const end = (event as Session).end_time ? new Date((event as Session).end_time) : null;
      if ((end && now > end) || (!end && now > start)) {
        return <span className="px-2 py-0.5 rounded bg-yellow-100 text-yellow-700 text-xs">passed</span>;
      }
      return <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-700 text-xs">scheduled</span>;
    }
    return null;
  }

  // Helper to fetch available times for a date and expert
  async function fetchEditAvailableTimesForDate(date: Date, expertId: string) {
    const res = await fetch(`/api/experts/${expertId}/availability`);
    const data = await res.json();
    const dayOfWeek = date.getDay();
    const slots = (data.availability || []).filter((slot: any) => slot.day_of_week === dayOfWeek);
    const times: string[] = [];
    slots.forEach((slot: any) => {
      slot.time_slots.forEach((t: any) => {
        times.push(`${t.start_time} - ${t.end_time}`);
      });
    });
    setEditAvailableTimes(times);
    return times;
  }

  return (
    <div className="px-2 md:px-8 py-6 min-h-screen bg-background text-foreground">
      <h1 className="text-2xl font-bold text-foreground/80 mb-4">My Sessions & Requests</h1>
      <p className="mb-6 text-foreground/65">View and manage all your scheduled sessions and pending requests with experts.</p>

      {/* Filter Section */}
      <div className="mb-6 flex flex-wrap gap-2">
        {ALL_STATUSES.map((status) => (
          <Button
            key={status}
            variant={filterStatus === status ? "default" : "outline"}
            size="sm"
            className={`${filterStatus === status ? "bg-primary-accent text-white hover:bg-primary" : "border-border text-foreground/65 hover:bg-muted"}`}
            onClick={() => setFilterStatus(status)}
          >
            {capitalize(status)}
          </Button>
        ))}
      </div>

      {firstTime && !loading && !error && (
        <div className="bg-primary/10 border border-primary text-primary rounded-lg p-4 mb-6 text-center shadow-sm">
          <b>Welcome!</b> You haven't booked any sessions yet. Once you book a session with an expert, it will appear here. Use the <b>Experts</b> page to find and book your first session.
        </div>
      )}

      {loading ? (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : error ? (
        <div className="text-center text-red-500 py-12">{error}</div>
      ) : dedupedEvents.length === 0 ? (
        <div className="text-center text-gray-500 py-12">No sessions or requests found.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {dedupedEvents.map((event) => {
            const isSession = (event as Session).start_time !== undefined;
            const expert = isSession ? (event as Session).expert_id : (event as SessionRequest).expert_id;
            const dateTime = isSession ? new Date((event as Session).start_time) : new Date((event as SessionRequest).requested_time);
            const status = event.status;
            const isPending = status === 'pending';
            const isAccepted = status === 'accepted';
            const isDeclined = status === 'declined';
            const isRescheduled = status === 'rescheduled';
            const isScheduled = status === 'scheduled';
            const isCompleted = status === 'completed';
            const isCancelled = status === 'cancelled';
            const isFuture = isSession ? new Date((event as Session).start_time) > new Date() : new Date((event as SessionRequest).requested_time) > new Date();
            const canJoin = isSession && event.meeting_url && new Date() >= new Date(event.start_time) && new Date() <= new Date(event.end_time);

            let statusColor = 'text-gray-600';
            let statusBg = 'bg-gray-100';
            let statusBorderColor = 'border-gray-300';
            let statusIcon: React.ReactNode = <CircleDashed className="w-4 h-4" />;

            switch (status) {
              case 'pending':
                statusColor = 'text-blue-600';
                statusBg = 'bg-blue-100';
                statusBorderColor = 'border-blue-500';
                statusIcon = <CalendarClock className="w-4 h-4" />;
                break;
              case 'accepted':
              case 'scheduled':
                statusColor = 'text-green-600';
                statusBg = 'bg-green-100';
                statusBorderColor = 'border-green-500';
                statusIcon = <CheckCircle2 className="w-4 h-4" />;
                break;
              case 'declined':
              case 'cancelled':
                statusColor = 'text-red-600';
                statusBg = 'bg-red-100';
                statusBorderColor = 'border-red-500';
                statusIcon = <Ban className="w-4 h-4" />;
                break;
              case 'rescheduled':
                statusColor = 'text-orange-600';
                statusBg = 'bg-orange-100';
                statusBorderColor = 'border-orange-500';
                statusIcon = <Edit className="w-4 h-4" />;
                break;
              case 'completed':
                statusColor = 'text-purple-600';
                statusBg = 'bg-purple-100';
                statusBorderColor = 'border-purple-500';
                statusIcon = <CheckCircle2 className="w-4 h-4" />;
            }

            const isManageableRequest = !isSession && (isPending || isRescheduled);

            return (
              <Card key={event._id} className={`shadow-md hover:shadow-lg transition-shadow duration-200 ease-in-out rounded-xl flex flex-col relative overflow-hidden group border-l-4 ${statusBorderColor}`}>
                <div className="absolute inset-y-0 left-0 w-4" style={{ backgroundColor: statusColor.replace('text-','').replace('-600','').replace('-700','') + '-500' }}></div>
                
                <CardHeader className="flex flex-col items-start p-4 pb-2">
                  <div className="flex flex-col w-full gap-1">
                    <div className="flex justify-between items-center w-full">
                      {/* Combined date/time header */}
                      <div className="flex items-center gap-2 text-xl font-bold text-foreground/80">
                        <CalendarClock className="w-4 h-4 text-foreground/80" />
                        <span>{format(dateTime, 'EEEE, MMM d, yyyy @ p')}</span>
                      </div>

                      {/* Status badge */}
                      {getStatusTag(event)}
                    </div>
                    
                    {/* Expert info */}
                    <div className="mt-1">
                      <h3 className="text-lg font-semibold text-foreground/70">
                        {capitalize(expert?.first_name || '')} {capitalize(expert?.last_name || '')}
                      </h3>
                      <p className="text-xs text-gray-500">
                        {isSession ? 'Session' : 'Request'} • {event.session_type}
                      </p>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="px-4 pb-4 pt-0">
                  {/* Reason/notes */}
                  {event.reason && (
                    <div className="mt-2 text-sm text-gray-600">
                      <p className="italic" title={event.reason || event.notes}>
                        {event.reason}
                      </p>
                    </div>
                  )}
                  
                  {/* Special cases */}
                  {!isSession && isDeclined && (event as SessionRequest).reason && (
                    <div className="mt-3 p-2 bg-red-50 border border-red-200 rounded-md text-red-700 text-xs">
                      <span className="font-semibold">Declined Reason:</span> {(event as SessionRequest).reason}
                    </div>
                  )}
                  
                  {isSession && (isScheduled || isCompleted) && (event as Session).meeting_url && (
                    <div className="mt-3">
                      <a 
                        href={(event as Session).meeting_url} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="text-primary hover:underline inline-flex items-center text-sm"
                      >
                        Join Session <ArrowRight className="w-4 h-4 ml-1" />
                      </a>
                    </div>
                  )}
                  
                  {/* Action buttons */}
                  {isManageableRequest && (
                    <div className="mt-4 flex gap-2">
                      <Button variant="outline" onClick={async () => {
                        setCurrentRequest(event as SessionRequest);
                        setEditModalOpen(true);
                        const reqTime = (event as SessionRequest).requested_time;
                        const date = reqTime ? new Date(reqTime) : null;
                        setEditRequestedDate(date);
                        setEditRequestedSlot(null);
                        setNewReason(event.reason || '');
                        if (date) await fetchEditAvailableTimesForDate(date, (event as SessionRequest).expert_id?._id || (event as SessionRequest).expert_id);
                      }}>
                        Edit
                      </Button>
                      <Button variant="destructive" onClick={() => { setCurrentRequest(event as SessionRequest); setDeleteModalOpen(true); }}>Delete</Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

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
              selected={editRequestedDate}
              onSelect={async date => {
                setEditRequestedDate(date);
                setEditRequestedSlot(null);
                if (date && currentRequest) await fetchEditAvailableTimesForDate(date, currentRequest.expert_id?._id || currentRequest.expert_id);
              }}
              disabled={date => {
                if (!currentRequest) return true;
                const dayOfWeek = date.getDay();
                return !editAvailableTimes.length && !date;
              }}
            />
          </div>
          <div className="mb-4">
            <label className="block text-xs font-medium text-foreground mb-1">Time Slot</label>
            <Select value={editRequestedSlot ? `${editRequestedSlot.start} - ${editRequestedSlot.end}` : ''} onValueChange={val => {
              const [start, end] = val.split(' - ');
              setEditRequestedSlot({ start, end });
            }}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select time slot" />
              </SelectTrigger>
              <SelectContent>
                {editAvailableTimes.map((time, idx) => (
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
                if (!editRequestedDate || !editRequestedSlot) throw new Error('Please select a date and time slot.');
                const date = new Date(editRequestedDate);
                const [startHour, startMinute] = editRequestedSlot.start.split(":").map(Number);
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
                setEditRequestedDate(null);
                setEditRequestedSlot(null);
                setNewReason("");
                setActionError(null);
                fetchEvents();
              } catch (err: any) {
                setActionError(err.message || 'Failed to update.');
              } finally {
                setActionLoading(false);
              }
            }} disabled={actionLoading || !editRequestedDate || !editRequestedSlot}>
              {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save Changes'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Modal */}
      <AlertDialog open={deleteModalOpen} onOpenChange={setDeleteModalOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Session Request</AlertDialogTitle>
            <AlertDialogDescription>Are you sure you want to delete this session request? This action cannot be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          {actionError && <div className="text-xs text-destructive mb-2">{actionError}</div>}
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteRequest} disabled={actionLoading}>{actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Delete'}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Reschedule Modal */}
      <Dialog open={rescheduleModalOpen} onOpenChange={setRescheduleModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reschedule Session</DialogTitle>
            <DialogDescription>Select a new available slot and provide a reason.</DialogDescription>
          </DialogHeader>
          {rescheduleLoading ? (
            <div className="flex justify-center items-center py-6"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
          ) : (
            <>
              <div className="mb-4">
                <label className="block text-xs font-medium text-foreground mb-1">Available Slots</label>
                <Select value={rescheduleSlot} onValueChange={setRescheduleSlot}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select slot" />
                  </SelectTrigger>
                  <SelectContent>
                    {rescheduleAvailability.flatMap((slot: any) =>
                      slot.time_slots.map((t: any, idx: number) => (
                        <SelectItem key={slot.day_of_week + '-' + idx} value={JSON.stringify({ day: slot.day_of_week, start: t.start_time, end: t.end_time })}>
                          {['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'][slot.day_of_week]}: {t.start_time} - {t.end_time}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>
              <Textarea
                value={rescheduleReason}
                onChange={e => setRescheduleReason(e.target.value)}
                placeholder="Reason for rescheduling"
                className="min-h-[80px] mb-3"
              />
              {actionError && <div className="text-xs text-destructive mb-2">{actionError}</div>}
              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="outline">Cancel</Button>
                </DialogClose>
                <Button
                  onClick={async () => {
                    setActionLoading(true);
                    setActionError(null);
                    try {
                      if (!rescheduleSlot) throw new Error('Please select a slot.');
                      const slot = JSON.parse(rescheduleSlot);
                      // Compose new requested_time
                      const now = new Date();
                      const today = now.getDay();
                      let daysToAdd = slot.day - today;
                      if (daysToAdd < 0) daysToAdd += 7;
                      const nextDate = new Date(now);
                      nextDate.setDate(now.getDate() + daysToAdd);
                      const [startHour, startMinute] = slot.start.split(":").map(Number);
                      nextDate.setHours(startHour, startMinute, 0, 0);
                      const requested_time = nextDate.toISOString();
                      // PATCH session to reschedule
                      const res = await fetch(`/api/session-requests/${currentSession?._id}`, {
                        method: 'PATCH',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                          requested_time,
                          reason: rescheduleReason,
                          status: 'rescheduled',
                        }),
                      });
                      if (!res.ok) throw new Error((await res.json()).error || 'Failed to reschedule.');
                      setRescheduleModalOpen(false);
                      fetchEvents();
                    } catch (err: any) {
                      setActionError(err.message || 'Failed to reschedule.');
                    } finally {
                      setActionLoading(false);
                    }
                  }}
                  disabled={actionLoading || !rescheduleSlot || !rescheduleReason.trim()}
                >
                  {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Reschedule'}
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

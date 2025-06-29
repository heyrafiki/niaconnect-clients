"use client"

import React, { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, CalendarClock, Ban, CheckCircle2, CircleDashed, Edit, Trash2, ArrowRight } from 'lucide-react';
import { Session, SessionRequest } from '@/types/expert'; // Assuming these types are correct and shared
import { format, isFuture, isPast } from 'date-fns';
import { Dialog, DialogContent, DialogHeader, DialogFooter, DialogTitle, DialogDescription, DialogClose } from '@/components/ui/dialog';

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
import SessionRequestModal from '@/components/sessions/SessionRequest';

// Helper to capitalize strings for display
function capitalize(str: string) {
  return str ? str.charAt(0).toUpperCase() + str.slice(1).toLowerCase() : "";
}

// Legend Item Component
function LegendItem({ color, label }: { color: string, label: string }) {
  return (
    <div className="flex items-center gap-2 text-xs">
      <span className="inline-block w-3 h-3 rounded-full" style={{ background: `hsl(var(--${color}))` }}></span>
      <span>{label}</span>
    </div>
  );
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
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');

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
    
    if (isSession) {
      if (status === 'completed') {
        return <span className="px-2 py-0.5 rounded text-xs" style={{ 
          backgroundColor: 'hsl(var(--session-completed))', 
          color: 'hsl(var(--foreground))' 
        }}>Completed</span>;
      }
      if (status === 'scheduled') {
        const now = new Date();
        const start = new Date((event as Session).start_time);
        const end = (event as Session).end_time ? new Date((event as Session).end_time) : null;
        if ((end && now > end) || (!end && now > start)) {
          return <span className="px-2 py-0.5 rounded text-xs" style={{ 
            backgroundColor: 'hsl(var(--session-completed))', 
            color: 'hsl(var(--foreground))' 
          }}>Passed</span>;
        }
        return <span className="px-2 py-0.5 rounded text-xs" style={{ 
          backgroundColor: 'hsl(var(--session-scheduled))', 
          color: 'white' 
        }}>Scheduled</span>;
      }
      if (status === 'cancelled') {
        return <span className="px-2 py-0.5 rounded text-xs" style={{ 
          backgroundColor: 'hsl(var(--session-cancelled))', 
          color: 'white' 
        }}>Cancelled</span>;
      }
    } else {
      switch (status) {
        case 'pending':
          return <span className="px-2 py-0.5 rounded text-xs" style={{ 
            backgroundColor: 'hsl(var(--request-pending))', 
            color: 'hsl(var(--foreground))' 
          }}>Pending</span>;
        case 'accepted':
          return <span className="px-2 py-0.5 rounded text-xs" style={{ 
            backgroundColor: 'hsl(var(--request-accepted))', 
            color: 'white' 
          }}>Accepted</span>;
        case 'declined':
          return <span className="px-2 py-0.5 rounded text-xs" style={{ 
            backgroundColor: 'hsl(var(--request-declined))', 
            color: 'white' 
          }}>Declined</span>;
        case 'rescheduled':
          return <span className="px-2 py-0.5 rounded text-xs" style={{ 
            backgroundColor: 'hsl(var(--request-rescheduled))', 
            color: 'white' 
          }}>Rescheduled</span>;
      }
    }
    return null;
  }

  return (
    <div className=" min-h-screen text-foreground">
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

      {/* Color Legend */}
      <div className="mb-4 p-3 bg-muted/50 rounded-lg">
        <h3 className="text-xs font-semibold mb-2 text-foreground/80">Status Legend</h3>
        <div className="flex flex-wrap gap-3">
          <LegendItem color="session-scheduled" label="Scheduled Sessions" />
          <LegendItem color="session-completed" label="Completed Sessions" />
          <LegendItem color="session-cancelled" label="Cancelled Sessions" />
          <LegendItem color="request-pending" label="Pending Requests" />
          <LegendItem color="request-accepted" label="Accepted Requests" />
          <LegendItem color="request-declined" label="Declined Requests" />
          <LegendItem color="request-rescheduled" label="Rescheduled Requests" />
        </div>
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
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

            let statusColor = '';
            let statusBg = '';
            let statusBorderColor = '';
            let statusIcon: React.ReactNode = <CircleDashed className="w-4 h-4" />;

            if (isSession) {
              // Session status colors
              switch (status) {
                case 'scheduled':
                  statusColor = 'hsl(var(--session-scheduled))';
                  statusBg = 'bg-green-100';
                  statusBorderColor = 'border-green-500';
                  statusIcon = <CheckCircle2 className="w-4 h-4" />;
                  break;
                case 'completed':
                  statusColor = 'hsl(var(--session-completed))';
                  statusBg = 'bg-gray-100';
                  statusBorderColor = 'border-gray-500';
                  statusIcon = <CheckCircle2 className="w-4 h-4" />;
                  break;
                case 'cancelled':
                  statusColor = 'hsl(var(--session-cancelled))';
                  statusBg = 'bg-red-100';
                  statusBorderColor = 'border-red-500';
                  statusIcon = <Ban className="w-4 h-4" />;
                  break;
              }
            } else {
              // Session Request status colors
              switch (status) {
                case 'pending':
                  statusColor = 'hsl(var(--request-pending))';
                  statusBg = 'bg-yellow-100';
                  statusBorderColor = 'border-yellow-500';
                  statusIcon = <CalendarClock className="w-4 h-4" />;
                  break;
                case 'accepted':
                  statusColor = 'hsl(var(--request-accepted))';
                  statusBg = 'bg-blue-100';
                  statusBorderColor = 'border-blue-500';
                  statusIcon = <CheckCircle2 className="w-4 h-4" />;
                  break;
                case 'declined':
                  statusColor = 'hsl(var(--request-declined))';
                  statusBg = 'bg-red-100';
                  statusBorderColor = 'border-red-500';
                  statusIcon = <Ban className="w-4 h-4" />;
                  break;
                case 'rescheduled':
                  statusColor = 'hsl(var(--request-rescheduled))';
                  statusBg = 'bg-purple-100';
                  statusBorderColor = 'border-purple-500';
                  statusIcon = <Edit className="w-4 h-4" />;
                  break;
              }
            }

            const isManageableRequest = !isSession && (isPending || isRescheduled);

            return (
              <Card key={event._id} className={`group border-l-4 ${statusBorderColor} rounded-[10px] shadow-sm hover:shadow-md transition-shadow duration-150 flex flex-col relative overflow-hidden bg-card/90`}>                
                <div className="absolute inset-y-0 left-0 w-1.5" style={{ backgroundColor: statusColor }}></div>
                <CardHeader className="flex-row items-center justify-between gap-2 p-3 pb-1 space-y-0">
                  <div className="flex items-center gap-2 min-w-0">
                    <CalendarClock className="w-4 h-4 text-foreground/70 shrink-0" />
                    <span className="truncate text-base font-semibold text-foreground/85">{format(dateTime, 'EEE, MMM d, yyyy @ p')}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusTag(event)}
                  </div>
                </CardHeader>
                <CardContent className="px-3 pt-0 pb-3 flex flex-col gap-1">
                  <div className="flex items-center gap-2 min-w-0">
                    <h3 className="truncate text-sm font-medium text-foreground/80">
                      {capitalize(expert?.first_name || '')} {capitalize(expert?.last_name || '')}
                    </h3>
                    <span className="text-xs text-gray-400">• {isSession ? 'Session' : 'Request'} • {event.session_type}</span>
                  </div>
                  {event.reason && (
                    <div className="text-xs text-gray-500 italic truncate" title={event.reason || event.notes}>
                      {event.reason}
                    </div>
                  )}
                  {!isSession && isDeclined && (event as SessionRequest).reason && (
                    <div className="mt-1 p-1 bg-red-50 border border-red-200 rounded text-red-700 text-xs">
                      <span className="font-semibold">Declined Reason:</span> {(event as SessionRequest).reason}
                    </div>
                  )}
                  {isSession && (isScheduled || isCompleted) && (event as Session).meeting_url && (
                    <div className="mt-1">
                      <a 
                        href={(event as Session).meeting_url} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="text-primary hover:underline inline-flex items-center text-xs font-medium"
                      >
                        Join Session <ArrowRight className="w-4 h-4 ml-1" />
                      </a>
                    </div>
                  )}
                  {isManageableRequest && (
                    <div className="mt-2 flex gap-2">
                      <Button variant="outline" size="sm" className="px-2 py-1 h-7 text-xs" onClick={() => {
                        setCurrentRequest(event as SessionRequest);
                        setEditModalOpen(true);
                      }}>
                        Edit
                      </Button>
                      <Button variant="destructive" size="sm" className="px-2 py-1 h-7 text-xs" onClick={() => { setCurrentRequest(event as SessionRequest); setDeleteModalOpen(true); }}>Delete</Button>
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
        <DialogContent className="max-w-lg">
          <DialogTitle>Edit Session Request</DialogTitle>
          <DialogDescription className="mb-4 text-xs text-muted-foreground">
            Change the requested date, time, and reason for this session.
          </DialogDescription>
          {currentRequest && (
            <SessionRequestModal
              expertId={currentRequest.expert_id?._id || currentRequest.expert_id}
              sessionTypes={currentRequest.expert_id?.session_types || currentRequest.expert_id?.onboarding?.session_types || []}
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
                // Refetch events after edit
                fetchEvents();
              }}
            />
          )}
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
    </div>
  );
}

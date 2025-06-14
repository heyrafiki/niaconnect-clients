"use client"

import React, { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, CalendarClock, Ban, CheckCircle2, CircleDashed, Edit, Trash2, ArrowRight } from 'lucide-react';
import { Session, SessionRequest } from '@/types/expert'; // Assuming these types are correct and shared
import { format, isFuture, isPast } from 'date-fns';
import { Dialog, DialogContent, DialogTitle, DialogDescription, DialogClose, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

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

  return (
    <div className="">
      <h1 className="text-3xl font-bold text-heyrafiki-green mb-4">My Sessions & Requests</h1>
      <p className="mb-6 text-gray-600">View and manage all your scheduled sessions and pending requests with experts.</p>

      {/* Filter Section */}
      <div className="mb-6 flex flex-wrap gap-2">
        {ALL_STATUSES.map((status) => (
          <Button
            key={status}
            variant={filterStatus === status ? "default" : "outline"}
            size="sm"
            className={`${filterStatus === status ? "bg-heyrafiki-green text-white hover:bg-heyrafiki-green-dark" : "border-gray-300 text-gray-700 hover:bg-gray-50"}`}
            onClick={() => setFilterStatus(status)}
          >
            {capitalize(status)}
          </Button>
        ))}
      </div>

      {firstTime && !loading && !error && (
        <div className="bg-heyrafiki-green/10 border border-heyrafiki-green text-heyrafiki-green rounded-lg p-4 mb-6 text-center shadow-sm">
          <b>Welcome!</b> You haven't booked any sessions yet. Once you book a session with an expert, it will appear here. Use the <b>Experts</b> page to find and book your first session.
        </div>
      )}

      {loading ? (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-heyrafiki-green" />
        </div>
      ) : error ? (
        <div className="text-center text-red-500 py-12">{error}</div>
      ) : events.length === 0 ? (
        <div className="text-center text-gray-500 py-12">No sessions or requests found.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {events.map((event) => {
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
                break;
            }

            const isManageableRequest = isPending || isRescheduled;

            return (
              <Card key={event._id} className={`shadow-md hover:shadow-lg transition-shadow duration-200 ease-in-out rounded-xl flex flex-col relative overflow-hidden group border-l-4 ${statusBorderColor}`}>
                <div className="absolute inset-y-0 left-0 w-4" style={{ backgroundColor: statusColor.replace('text-','').replace('-600','').replace('-700','') + '-500' }}></div>
                <CardHeader className="flex-row items-center space-x-4 pb-2 pt-4 pl-4">
                  <Avatar className="h-12 w-12">
                    {expert?.profile_img_url ? (
                      <AvatarImage src={expert.profile_img_url} alt={`${expert.first_name} ${expert.last_name}`} />
                    ) : (
                      <AvatarFallback className="bg-heyrafiki-green/10 text-heyrafiki-green font-semibold text-lg">
                        {capitalize(expert?.first_name?.[0] || '')}
                      </AvatarFallback>
                    )}
                  </Avatar>
                  <div className="flex-1">
                    <CardTitle className="text-xl font-bold text-gray-900">
                      {capitalize(expert?.first_name || '')} {capitalize(expert?.last_name || '')}
                    </CardTitle>
                    <p className="text-sm text-gray-500">{isSession ? 'Session' : 'Request'} - {event.session_type}</p>
                  </div>
                </CardHeader>
                <CardContent className="pt-2 flex-1 flex flex-col md:flex-row md:items-center md:justify-between px-4 pb-4">
                  <div className="flex-1 flex flex-col gap-2">
                    <div className="text-gray-700 text-sm flex items-center gap-2">
                      <CalendarClock className="w-4 h-4 text-gray-500" />
                      <span>{format(dateTime, 'EEEE, MMM d, yyyy @ p')}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${statusColor} ${statusBg} flex items-center gap-1`}>
                        {statusIcon} {capitalize(status)}
                      </span>
                    </div>
                  </div>

                  {!isSession && isDeclined && (event as SessionRequest).reason && (
                    <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded-md text-red-700 text-xs md:mt-0 md:ml-4 flex-grow">
                      <span className="font-semibold">Declined Reason:</span> {(event as SessionRequest).reason}
                    </div>
                  )}

                  {isSession && (isScheduled || isCompleted) && (event as Session).meeting_url && (
                    <a href={(event as Session).meeting_url} target="_blank" rel="noopener noreferrer" className="mt-2 text-heyrafiki-green hover:underline flex items-center text-sm md:mt-0 md:ml-4">
                      Join Session <ArrowRight className="w-4 h-4 ml-1" />
                    </a>
                  )}

                  {isManageableRequest && (
                    <div className="mt-4 flex gap-2 md:mt-0 md:ml-4">
                      <Dialog open={editModalOpen && currentRequest?._id === event._id} onOpenChange={setEditModalOpen}>
                        <DialogTrigger asChild>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="flex-1 border-heyrafiki-green text-heyrafiki-green hover:bg-heyrafiki-green/10"
                            onClick={() => {
                              setCurrentRequest(event as SessionRequest);
                              setNewRequestedTime(format(dateTime, "yyyy-MM-dd'T'HH:mm"));
                              setNewReason((event as SessionRequest).reason || '');
                              setActionError(null);
                              setActionSuccess(null);
                            }}
                          >
                            <Edit className="w-4 h-4 mr-1" /> Edit
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-lg">
                          <DialogTitle>Edit Session Request</DialogTitle>
                          <DialogDescription className="mb-4 text-xs text-gray-500">Propose a new time and/or update your reason for this session request.</DialogDescription>
                          <div className="mb-4">
                            <label className="block text-xs font-medium text-gray-700 mb-1">New Requested Time</label>
                            <input
                              type="datetime-local"
                              value={newRequestedTime}
                              onChange={(e) => setNewRequestedTime(e.target.value)}
                              className="w-full border rounded px-3 py-2 text-sm focus:border-heyrafiki-green focus:ring-heyrafiki-green"
                            />
                          </div>
                          <div className="mb-4">
                            <label className="block text-xs font-medium text-gray-700 mb-1">Reason for session</label>
                            <Textarea
                              value={newReason}
                              onChange={(e) => setNewReason(e.target.value)}
                              placeholder="Update your reason for booking this session..."
                              className="min-h-[80px]"
                            />
                          </div>
                          {actionError && <div className="text-xs text-red-500 mb-2">{actionError}</div>}
                          {actionSuccess && <div className="text-xs text-green-600 mb-2">{actionSuccess}</div>}
                          <div className="flex gap-2 justify-end">
                            <DialogClose asChild>
                              <Button variant="outline" size="sm">Cancel</Button>
                            </DialogClose>
                            <Button
                              size="sm"
                              className="bg-heyrafiki-green text-white"
                              onClick={handleEditRequest}
                              disabled={actionLoading || !newRequestedTime || !newReason.trim()}
                            >
                              {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save Changes'}
                            </Button>
                          </div>
                        </DialogContent>
                      </Dialog>

                      <Dialog open={deleteModalOpen && currentRequest?._id === event._id} onOpenChange={setDeleteModalOpen}>
                        <DialogTrigger asChild>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="flex-1 border-red-500 text-red-500 hover:bg-red-50"
                            onClick={() => {
                              setCurrentRequest(event as SessionRequest);
                              setActionError(null);
                              setActionSuccess(null);
                            }}
                          >
                            <Trash2 className="w-4 h-4 mr-1" /> Delete
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-sm">
                          <DialogTitle>Delete Session Request</DialogTitle>
                          <DialogDescription className="mb-4">Are you sure you want to delete this session request? This action cannot be undone.</DialogDescription>
                          {actionError && <div className="text-xs text-red-500 mb-2">{actionError}</div>}
                          {actionSuccess && <div className="text-xs text-green-600 mb-2">{actionSuccess}</div>}
                          <div className="flex gap-2 justify-end">
                            <DialogClose asChild>
                              <Button variant="outline" size="sm">Cancel</Button>
                            </DialogClose>
                            <Button
                              size="sm"
                              className="bg-red-500 text-white"
                              onClick={handleDeleteRequest}
                              disabled={actionLoading}
                            >
                              {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Confirm Delete'}
                            </Button>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

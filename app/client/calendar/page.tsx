"use client"

import React, { useEffect, useState, useRef } from "react";
import { useSession } from "next-auth/react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import { Button } from "@/components/ui/button";
import { Plus, Filter } from "lucide-react";
import dynamic from "next/dynamic";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { format } from "date-fns";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { useTheme } from "next-themes";

export default function CalendarPage() {
  const { data: session } = useSession();
  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [firstTime, setFirstTime] = useState(false);
  const calendarRef = useRef<any>(null);
  const [events, setEvents] = useState<any[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterExpert, setFilterExpert] = useState<string>("all");
  const [filterDate, setFilterDate] = useState<string>("");
  const { theme, systemTheme } = useTheme ? useTheme() : { theme: 'light', systemTheme: 'light' };
  const currentTheme = theme === 'system' ? systemTheme : theme;

  useEffect(() => {
    if (!session?.user?.id) return;
    setLoading(true);
    fetch(`/api/sessions?client_id=${session.user.id}`)
      .then(res => res.json())
      .then(data => {
        // data.events contains both sessions and session requests
        setEvents(data.events || []);
        setFirstTime((data.events || []).length === 0);
        setLoading(false);
      })
      .catch(() => {
        setError("Failed to load sessions.");
        setLoading(false);
      });
  }, [session?.user?.id]);

  // Extract unique experts for filter dropdown
  const expertOptions = Array.from(
    new Set(events.map(e => e.expert_id?._id && `${e.expert_id._id}|${e.expert_id.first_name} ${e.expert_id.last_name}`))
  ).filter(Boolean);

  // Filter logic
  const filteredEvents = events.filter(event => {
    let statusMatch = filterStatus === "all" || event.status === filterStatus;
    let expertMatch = filterExpert === "all" || (event.expert_id?._id === filterExpert);
    let dateMatch = !filterDate || (event.start_time ? format(new Date(event.start_time), 'yyyy-MM-dd') === filterDate : event.requested_time && format(new Date(event.requested_time), 'yyyy-MM-dd') === filterDate);
    return statusMatch && expertMatch && dateMatch;
  });

  // Deduplicate accepted requests if a scheduled session exists for the same expert, client, and start_time
  const dedupedEvents = filteredEvents.filter((event, idx, arr) => {
    if (event.status === 'accepted' && event.requested_time) {
      // Find a scheduled session with the same expert, client, and start_time
      return !arr.some(e =>
        e.status === 'scheduled' &&
        e.expert_id?._id === event.expert_id?._id &&
        e.client_id?._id === event.client_id?._id &&
        // Compare times (allowing for possible string/Date differences)
        (e.start_time && new Date(e.start_time).getTime() === new Date(event.requested_time).getTime())
      );
    }
    return true;
  });

  // Map all events (sessions and requests) to FullCalendar events
  const calendarEvents = dedupedEvents.map((event: any) => {
    let title = '';
    let start = '';
    let end = '';
    let status = '';
    let color = '';
    let isSession = 'start_time' in event;
    if (isSession) {
      // Session
      title = `Session with ${event.expert_id?.first_name || "Expert"} ${event.expert_id?.last_name || ""}`;
      start = event.start_time;
      end = event.end_time;
      status = event.status;
      if (status === 'scheduled') color = 'hsl(var(--session-scheduled))';
      else if (status === 'completed') color = 'hsl(var(--session-completed))';
      else if (status === 'cancelled') color = 'hsl(var(--session-cancelled))';
    } else {
      // Session Request
      title = `Request with ${event.expert_id?.first_name || "Expert"} ${event.expert_id?.last_name || ""}`;
      start = event.requested_time;
      end = event.requested_time;
      status = event.status;
      if (status === 'pending') color = 'hsl(var(--request-pending))';
      else if (status === 'accepted') color = 'hsl(var(--request-accepted))';
      else if (status === 'declined') color = 'hsl(var(--request-declined))';
      else if (status === 'rescheduled') color = 'hsl(var(--request-rescheduled))';
    }
    return {
      id: event._id,
      title,
      start,
      end,
      backgroundColor: color,
      borderColor: color,
      extendedProps: {
        status,
        isSession,
        expert: event.expert_id,
        raw: event,
      },
    };
  });

  return (
    <div className="relative min-h-screen bg-layout-bg p-2 sm:p-6 -m-4 -mx-6 lg:-m-8 p-4 md:p-6">
      <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
        <div>
          <h1 className="text-2xl font-bold mb-1">My Calendar</h1>
          <p className="text-gray-600 text-sm">All your upcoming and past sessions and requests are shown here. Click on an event for more details.</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button
            className="flex items-center gap-2 bg-primary-accent hover:bg-primary-accent/90 shadow px-2 py-1 text-xs sm:text-sm h-8 sm:h-10 min-w-[2rem] sm:min-w-[2.5rem]"
          >
            <span className="font-semibold text-xs sm:text-base">+</span>
            <span className="hidden sm:inline">Add New Session</span>
          </Button>
        </div>
      </div>
      {/* Color Legend */}
      <div className="flex flex-wrap gap-3 mb-4 z-10 relative">
        <LegendItem color="session-scheduled" label="Scheduled" />
        <LegendItem color="session-completed" label="Completed" />
        <LegendItem color="session-cancelled" label="Cancelled" />
        <LegendItem color="request-pending" label="Pending Request" />
        <LegendItem color="request-accepted" label="Accepted Request" />
        <LegendItem color="request-declined" label="Declined Request" />
        <LegendItem color="request-rescheduled" label="Rescheduled Request" />
      </div>
      {/* Filter Bar */}
      <div className="flex flex-wrap gap-2 mb-4 z-10 relative text-xs sm:text-base">
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-24 sm:w-40 h-8 sm:h-10 text-xs sm:text-sm">
            <SelectValue placeholder="All Statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="scheduled">Scheduled</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="accepted">Accepted</SelectItem>
            <SelectItem value="declined">Declined</SelectItem>
            <SelectItem value="rescheduled">Rescheduled</SelectItem>
          </SelectContent>
        </Select>
        <Select value={filterExpert} onValueChange={setFilterExpert}>
          <SelectTrigger className="w-24 sm:w-40 h-8 sm:h-10 text-xs sm:text-sm">
            <SelectValue placeholder="All Experts" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Experts</SelectItem>
            {expertOptions.map(opt => {
              const [id, name] = opt.split("|");
              return <SelectItem key={id} value={id}>{name}</SelectItem>;
            })}
          </SelectContent>
        </Select>
        <input type="date" className="border rounded px-2 py-1 h-8 sm:h-10 text-xs sm:text-sm dark:bg-background dark:text-foreground" value={filterDate} onChange={e => setFilterDate(e.target.value)} />
      </div>

      {loading ? (
        <div className="text-center text-gray-500">Loading calendar...</div>
      ) : error ? (
        <div className="text-center text-red-500">{error}</div>
      ) : (
        <div className="bg-background rounded-2xl shadow p-2 sm:p-6 z-10 relative">
          <FullCalendar
              ref={calendarRef}
              plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
              initialView="dayGridMonth"
              headerToolbar={{
                left: "dayGridMonth,timeGridWeek,timeGridDay",
                center: "title",
                right: "prev,next today"
              }}
              height="auto"
              events={calendarEvents}
              eventContent={renderEventContent}
              eventClick={info => {
                info.jsEvent.preventDefault();
                setSelectedEvent(info.event.extendedProps.raw);
              }}
              dayMaxEvents={2}
              selectable={false}
              aspectRatio={1.6}
              fixedWeekCount={false}
              eventDisplay="block"
              nowIndicator={true}
          />
        </div>
      )}
      {/* Event/Session Details Modal */}
      <Dialog open={!!selectedEvent} onOpenChange={open => !open && setSelectedEvent(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selectedEvent ? (selectedEvent.start_time ? "Session Details" : "Session Request Details") : ""}</DialogTitle>

            {selectedEvent && (
              <div className="space-y-2 mt-2">
                <div><b>Practicioner:</b> {selectedEvent.expert_id?.first_name} {selectedEvent.expert_id?.last_name}</div>
                <div><b>Status:</b> {selectedEvent.status}</div>
                <div><b>Type:</b> {selectedEvent.session_type}</div>
                <div><b>Date/Time:</b> {selectedEvent.start_time ? format(new Date(selectedEvent.start_time), 'PPpp') : format(new Date(selectedEvent.requested_time), 'PPpp')}</div>
                {selectedEvent.reason && <div><b>Reason:</b> {selectedEvent.reason}</div>}
                {selectedEvent.notes && <div><b>Notes:</b> {selectedEvent.notes}</div>}
                {selectedEvent.meeting_url && <div><b>Meeting URL:</b> <a href={selectedEvent.meeting_url} className="text-blue-600 underline" target="_blank" rel="noopener noreferrer">Join</a></div>}
                {selectedEvent.feedback && <div><b>Feedback:</b> {selectedEvent.feedback.comment} (Rating: {selectedEvent.feedback.rating})</div>}
                {/* Add more fields as needed */}
              </div>
            )}
          </DialogHeader>
          <DialogFooter>
            {/* Contextual actions based on status/type */}
            <DialogClose asChild>
              <button className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300">Close</button>
            </DialogClose>
            {/* TODO: Add Cancel, Reschedule, Delete, etc. actions here */}
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <div className="mt-8 text-center text-xs text-gray-400 z-10 relative">This page shows all your session bookings and requests in a calendar view. You can view details, status, and manage your appointments here.</div>
      <style jsx global>{`
        /* Calendar toolbar and nav buttons for mobile */
        @media (max-width: 640px) {
          .fc .fc-button, .fc .fc-toolbar-chunk > button, .fc .fc-toolbar-chunk > .fc-button-group > button {
            font-size: 0.8rem !important;
            min-width: 1.5rem !important;
            height: 1.5rem !important;
            padding: 0.1rem 0.2rem !important;
            border-radius: 0.25rem !important;
          }
          .fc .fc-toolbar-title {
            font-size: 1rem !important;
          }
        }
      `}</style>
    </div>
  );
}

function renderEventContent(eventInfo: any) {
  return (
    <div
      className="flex flex-col text-xs px-2 py-1 h-full text-foreground/80"
      style={{
        backgroundColor: 'hsl(var(--muted))',
        borderLeft: `3px solid ${eventInfo.event.backgroundColor}`,
      }}
    >
      <span className="font-semibold truncate" title={eventInfo.event.title}>{eventInfo.event.title}</span>
      <span className="text-[10px]">{eventInfo.timeText}</span>
      <span
        className="text-[10px] font-semibold"
        style={{ color: eventInfo.event.backgroundColor }}
      >
        {eventInfo.event.extendedProps.status}
      </span>
    </div>
  );
}

function LegendItem({ color, label }: { color: string, label: string }) {
  return (
    <div className="flex items-center gap-1 text-xs">
      <span className="inline-block w-3 h-3 rounded-full" style={{ background: `hsl(var(--${color}))` }}></span>
      <span>{label}</span>
    </div>
  );
}

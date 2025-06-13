"use client"

import React, { useEffect, useState, useRef } from "react";
import { useSession } from "next-auth/react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import { Button } from "@/components/ui/button";
import { Plus, Filter } from "lucide-react";

export default function CalendarPage() {
  const { data: session } = useSession();
  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [firstTime, setFirstTime] = useState(false);
  const calendarRef = useRef<any>(null);

  useEffect(() => {
    if (!session?.user?.id) return;
    setLoading(true);
    fetch(`/api/sessions?client_id=${session.user.id}`)
      .then(res => res.json())
      .then(data => {
        setSessions(data.sessions || []);
        setFirstTime((data.sessions || []).length === 0);
        setLoading(false);
      })
      .catch(() => {
        setError("Failed to load sessions.");
        setLoading(false);
      });
  }, [session?.user?.id]);

  // Transform sessions to FullCalendar events
  const events = sessions.map((session: any) => ({
    id: session._id,
    title: `Session with ${session.expert_id?.first_name || "Expert"} ${session.expert_id?.last_name || ""}`,
    start: session.start_time,
    end: session.end_time,
    extendedProps: {
      status: session.status,
      expert: session.expert_id,
    },
    color: session.status === "confirmed" ? "#1BBF83" : session.status === "pending" ? "#FBBF24" : "#CBD5E1",
  }));

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
        <div>
          <h1 className="text-2xl font-bold mb-1">My Calendar</h1>
          <p className="text-gray-600 text-sm">All your upcoming and past sessions are shown here. Click on a session for more details.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="flex items-center gap-2"><Filter size={16}/> Filter</Button>
          <Button className="flex items-center gap-2 bg-heyrafiki-green hover:bg-heyrafiki-green/90"><Plus size={16}/> Add New Session</Button>
        </div>
      </div>
      {/* {firstTime && !loading && !error && (
        <div className="bg-heyrafiki-green/10 border border-heyrafiki-green text-heyrafiki-green rounded-lg p-4 mb-6 text-center">
          <b>Welcome!</b> You haven't booked any sessions yet. Once you book a session with an expert, it will appear here. Use the <b>Experts</b> page to find and book your first session.
        </div>
      )} */}
      {loading ? (
        <div className="text-center text-gray-500">Loading calendar...</div>
      ) : error ? (
        <div className="text-center text-red-500">{error}</div>
      ) : (
        <div className="bg-white rounded-2xl shadow p-2 sm:p-6">
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
              events={events}
              eventContent={renderEventContent}
              eventClick={info => {
                // Optionally show a modal with session details
                info.jsEvent.preventDefault();
                // TODO: Implement modal for session details
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
      <div className="mt-8 text-center text-xs text-gray-400">This page shows all your session bookings in a calendar view. You can view details, status, and manage your appointments here.</div>
    </div>
  );
}

function renderEventContent(eventInfo: any) {
  return (
    <div className="flex flex-col text-xs">
      <span className="font-semibold truncate" title={eventInfo.event.title}>{eventInfo.event.title}</span>
      <span className="text-gray-500">{eventInfo.timeText}</span>
      <span className="text-[10px]" style={{ color: eventInfo.event.backgroundColor }}>{eventInfo.event.extendedProps.status}</span>
    </div>
  );
} 
"use client"

import React, { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';

export default function SessionsPage() {
  const { data: session } = useSession();
  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [firstTime, setFirstTime] = useState(false);

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
        setError('Failed to load sessions.');
        setLoading(false);
      });
  }, [session?.user?.id]);

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-2">My Sessions</h1>
      <p className="mb-6 text-gray-600">View and manage your upcoming and past sessions with experts.</p>
      {firstTime && !loading && !error && (
        <div className="bg-heyrafiki-green/10 border border-heyrafiki-green text-heyrafiki-green rounded-lg p-4 mb-6 text-center">
          <b>Welcome!</b> You haven't booked any sessions yet. Once you book a session with an expert, it will appear here. Use the <b>Experts</b> page to find and book your first session.
        </div>
      )}
      {loading ? (
        <div className="text-center text-gray-500">Loading...</div>
      ) : error ? (
        <div className="text-center text-red-500">{error}</div>
      ) : (
        <div className="space-y-4">
          {sessions.length === 0 ? (
            <div className="text-center text-gray-500">No sessions scheduled. This section will list all your upcoming and past sessions with details about the expert, date, and status.</div>
          ) : (
            sessions.map(session => (
              <div key={session._id} className="border rounded-xl p-4 flex flex-col md:flex-row justify-between items-start md:items-center bg-white shadow-sm hover:shadow-md transition">
                <div>
                  <div className="font-semibold text-lg text-heyrafiki-green">
                    Session with {session.expert_id?.first_name} {session.expert_id?.last_name}
                  </div>
                  <div className="text-sm text-gray-600">
                    {new Date(session.start_time).toLocaleDateString()} at {new Date(session.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
                <span className="mt-2 md:mt-0 px-2 py-1 rounded bg-gray-100 text-xs text-gray-700 border border-gray-200">{session.status}</span>
              </div>
            ))
          )}
        </div>
      )}
      <div className="mt-8 text-center text-xs text-gray-400">This page shows all your session bookings. You can view details, status, and manage your appointments here.</div>
    </div>
  );
}

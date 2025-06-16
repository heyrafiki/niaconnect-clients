import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Session from '@/models/Session';
import SessionRequest from '@/models/SessionRequest';

export async function GET(req: NextRequest) {
  await dbConnect();
  const { searchParams } = new URL(req.url);
  const client_id = searchParams.get('client_id');
  const statusFilter = searchParams.get('status');

  if (!client_id) {
    return NextResponse.json({ error: 'Missing client_id' }, { status: 400 });
  }

  try {
    let sessionQuery: any = { client_id };
    let sessionRequestQuery: any = { client_id };

    if (statusFilter && statusFilter !== 'all') {
      if (['scheduled', 'completed', 'cancelled'].includes(statusFilter)) {
        sessionQuery.status = statusFilter;
      } else if (['pending', 'accepted', 'declined', 'rescheduled'].includes(statusFilter)) {
        sessionRequestQuery.status = statusFilter;
      } else {
        // If an unknown status is provided, return empty arrays
        return NextResponse.json({ events: [] });
      }
    }

    // Fetch confirmed sessions
    const sessions = await Session.find(sessionQuery)
      .populate('expert_id')
      .lean();

    // Fetch session requests
    const sessionRequests = await SessionRequest.find(sessionRequestQuery)
      .populate('expert_id')
      .lean();

    // Combine and sort by date (e.g., start_time for sessions, requested_time for requests)
    // For simplicity, we'll sort all items together based on their relevant time field
    const allEvents = [...sessions, ...sessionRequests].sort((a, b) => {
      const dateA = ('start_time' in a) ? a.start_time : a.requested_time;
      const dateB = ('start_time' in b) ? b.start_time : b.requested_time;
      return new Date(dateB).getTime() - new Date(dateA).getTime(); // Sort descending
    });

    return NextResponse.json({ events: allEvents });
  } catch (error) {
    console.error('Failed to fetch sessions and session requests:', error);
    return NextResponse.json({ error: 'Failed to fetch sessions and session requests.' }, { status: 500 });
  }
} 
import React, { useEffect, useState, useMemo } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

interface SessionRequestProps {
  expertId: string;
  sessionTypes: string[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialData?: {
    sessionType?: string;
    date?: Date;
    timeSlot?: { start: string; end: string };
    reason?: string;
    requestId?: string;
  };
  onSuccess?: () => void;
  clientId: string;
  mode?: 'create' | 'edit';
}

export default function SessionRequestModal({
  expertId,
  sessionTypes,
  open,
  onOpenChange,
  initialData,
  onSuccess,
  clientId,
  mode = 'create',
}: SessionRequestProps) {
  const [availability, setAvailability] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSessionType, setSelectedSessionType] = useState(initialData?.sessionType || '');
  const [selectedDate, setSelectedDate] = useState<Date | null>(initialData?.date || null);
  const [availableTimesForDate, setAvailableTimesForDate] = useState<string[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<{ start: string; end: string } | null>(initialData?.timeSlot || null);
  const [reason, setReason] = useState(initialData?.reason || '');
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    if (!expertId) return;
    setLoading(true);
    fetch(`/api/experts/${expertId}/availability`)
      .then(res => res.json())
      .then(data => {
        setAvailability(data.availability || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [expertId]);

  // Helper to get the first available date
  const firstAvailableDay = useMemo(() => {
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

  // Helper to check if a date has availability
  function hasAvailabilityForDate(date: Date) {
    const dayOfWeek = date.getDay();
    return availability.some((slot: any) => slot.day_of_week === dayOfWeek);
  }

  // Update available times when date changes
  useEffect(() => {
    if (!selectedDate) {
      setAvailableTimesForDate([]);
      return;
    }
    const dayOfWeek = selectedDate.getDay();
    const slots = availability.filter((slot: any) => slot.day_of_week === dayOfWeek);
    const times: string[] = [];
    slots.forEach((slot: any) => {
      slot.time_slots.forEach((t: any) => {
        times.push(`${t.start_time} - ${t.end_time}`);
      });
    });
    setAvailableTimesForDate(times);
  }, [selectedDate, availability]);

  // Reset state when dialog is closed
  useEffect(() => {
    if (!open) {
      setSelectedSessionType(initialData?.sessionType || '');
      setSelectedDate(initialData?.date || null);
      setSelectedSlot(initialData?.timeSlot || null);
      setReason(initialData?.reason || '');
      setSubmitError(null);
      setSubmitting(false);
    }
    // eslint-disable-next-line
  }, [open]);

  async function handleSubmit() {
    setSubmitting(true);
    setSubmitError(null);
    try {
      if (!selectedSlot || !selectedSessionType || !selectedDate) throw new Error('Please select all fields.');
      // Compose start time
      const now = new Date();
      const today = now.getDay();
      let daysToAdd = selectedDate.getDay() - today;
      if (daysToAdd < 0) daysToAdd += 7;
      const nextDate = new Date(selectedDate);
      // Set start time
      const [startHour, startMinute] = selectedSlot.start.split(":").map(Number);
      nextDate.setHours(startHour, startMinute, 0, 0);
      const startTime = new Date(nextDate);
      // API call
      let res;
      if (mode === 'edit' && initialData?.requestId) {
        res = await fetch(`/api/session-requests/${initialData.requestId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            requested_time: startTime.toISOString(),
            reason: reason.trim(),
            session_type: selectedSessionType,
            status: 'rescheduled',
          }),
        });
      } else {
        res = await fetch(`/api/session-requests`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            expert_id: expertId,
            client_id: clientId,
            session_type: selectedSessionType,
            reason: reason.trim(),
            requested_time: startTime.toISOString(),
          }),
        });
      }
      if (!res.ok) throw new Error((await res.json()).error || 'Failed to submit session request.');
      if (onSuccess) onSuccess();
      onOpenChange(false);
    } catch (err: any) {
      setSubmitError(err.message || 'Failed to submit session request.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div>
      {/* Session Type Selection */}
      <div className="mb-4">
        <label className="block text-xs font-medium text-foreground mb-1">Session Type</label>
        <Select value={selectedSessionType} onValueChange={setSelectedSessionType}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select session type" />
          </SelectTrigger>
          <SelectContent>
            {sessionTypes.map((type: string) => (
              <SelectItem key={type} value={type}>{type}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      {/* Date Selection */}
      <div className="mb-4">
        <label className="block text-xs font-medium text-foreground mb-1">Date</label>
        {loading ? <div>Loading...</div> : (
          <Calendar
            key={availability.map(a => a.day_of_week).join(',')}
            defaultMonth={firstAvailableDay}
            mode="single"
            selected={selectedDate || undefined}
            onSelect={setSelectedDate}
            disabled={date => !hasAvailabilityForDate(date)}
          />
        )}
      </div>
      {/* Time Slot Selection */}
      <div className="mb-4">
        <label className="block text-xs font-medium text-foreground mb-1">Time Slot</label>
        {availableTimesForDate.length === 0 ? (
          <div className="text-xs text-muted-foreground p-2 bg-muted rounded">
            {selectedDate ? 'No time slots available for this date.' : 'Please select a date first.'}
          </div>
        ) : (
          <Select value={selectedSlot ? `${selectedSlot.start} - ${selectedSlot.end}` : ''} onValueChange={val => {
            const [start, end] = val.split(' - ');
            setSelectedSlot({ start, end });
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
        )}
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
      <div className="flex gap-2 justify-end">
        <Button variant="outline" size="sm" onClick={() => onOpenChange(false)}>Cancel</Button>
        <Button
          size="sm"
          className="bg-primary text-primary-foreground"
          disabled={submitting || !selectedSlot || !reason.trim() || !selectedSessionType}
          onClick={handleSubmit}
        >
          {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : (mode === 'edit' ? 'Save Changes' : 'Submit')}
        </Button>
      </div>
    </div>
  );
} 
// app/api/appointments/slots/route.ts
// Returns available time slots for a given date
// Called by the booking form when date changes

import { NextRequest, NextResponse } from "next/server";
import { getAvailableSlots } from "@/lib/services/appointmentService";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {

    // Must be logged in
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const date = request.nextUrl.searchParams.get("date")
    if (!date) return NextResponse.json({ error: 'Date is required' }, { status: 400 });

    const slots = await getAvailableSlots(date)
    return NextResponse.json({ slots });
}
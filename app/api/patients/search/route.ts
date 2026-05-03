// app/api/patients/search/route.ts
// Quick patient search for booking form dropdown

import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const query = request.nextUrl.searchParams.get("query") ?? ""
    if (query.length < 2) return NextResponse.json({ patients: [] });

    const patients = await prisma.patient.findMany({
        where: {
            OR: [
                { profile: { name: { contains: query, mode: "insensitive" } } },
                { nic: { contains: query, mode: "insensitive" } }
            ]
        },
        include: { profile: { select: { name: true } } },
        take: 5, // max 5 results in dropdown
    })

    return NextResponse.json({
        patients: patients.map(p => ({
            id: p.id,
            name: p.profile?.name ?? "Unknown",
            nic: p.nic
        }))
    })

}
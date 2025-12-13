import type { Database } from "@pickle/contracts";
import { createNoteSchema } from "@pickle/contracts/src/note";
import { NextResponse } from "next/server";
import { createClient } from "@/shared/lib/supabase/server";

export async function POST(request: Request) {
  try {
    const supabase = await createClient(); // Await the potential promise if updated later, though currently sync-ish usually
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const json = await request.json();
    const result = createNoteSchema.safeParse(json);

    if (!result.success) {
      return NextResponse.json(
        { error: "Validation Error", details: result.error.errors },
        { status: 400 },
      );
    }

    const { type, url, content, data, tags } = result.data;

    const insertPayload: Database["public"]["Tables"]["notes"]["Insert"] = {
      user_id: user.id,
      type,
      url,
      content: content ?? null,
      data: data as unknown as Database["public"]["Tables"]["notes"]["Insert"]["data"],
      tags: tags ?? [],
    };

    // Supabase client is typed with Database, so it knows the schema of 'notes' table
    const { data: note, error } = await supabase
      .from("notes")
      .insert(insertPayload)
      .select()
      .single();

    if (error) {
      console.error("Error creating note:", error);
      return NextResponse.json(
        { error: "Database Error", details: error.message },
        { status: 500 },
      );
    }

    return NextResponse.json({ note }, { status: 201 });
  } catch (e) {
    console.error("Internal Server Error:", e);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}

export async function GET(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const cursor = searchParams.get("cursor"); // For pagination later
    const type = searchParams.get("type");

    let query = supabase
      .from("notes")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(20);

    if (type) {
      // Validate type if needed, but string match is fine for DB
      query = query.eq("type", type);
    }

    // Simple pagination using created_at cursor if provided
    if (cursor) {
      query = query.lt("created_at", cursor);
    }

    const { data: notes, error } = await query;

    if (error) {
      console.error("Error fetching notes:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ notes });
  } catch (e) {
    console.error("GET Notes Error:", e);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}

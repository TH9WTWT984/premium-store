import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get("q")?.trim() ?? "";
  if (query.length < 2) return NextResponse.json({ results: [] });

  try {
    const response = await fetch(
      `https://api.pincodeapi.in/api/v1/search/suggest?q=${encodeURIComponent(query)}`,
      { headers: { Accept: "application/json" }, next: { revalidate: 3600 } },
    );

    if (!response.ok) {
      return NextResponse.json({ error: "Unable to load address suggestions." }, { status: 502 });
    }

    const payload = await response.json();
    const raw = Array.isArray(payload?.results)
      ? payload.results
      : Array.isArray(payload?.suggestions)
        ? payload.suggestions
        : [];

    return NextResponse.json({
      results: raw.slice(0, 8).map((item: {
        title?: string;
        subtitle?: string;
        type?: string;
        pincode?: string;
        state?: string;
        district?: string;
        city?: string;
      }) => ({
        title: item.title || item.city || item.district || "",
        subtitle: item.subtitle || [item.district, item.state, item.pincode].filter(Boolean).join(", "),
        type: item.type || "location",
        pincode: item.pincode || "",
        state: item.state || "",
        district: item.district || "",
        city: item.city || item.district || "",
      })),
    });
  } catch (error) {
    console.error("GET /api/address/search", error);
    return NextResponse.json({ error: "Unable to load address suggestions." }, { status: 502 });
  }
}

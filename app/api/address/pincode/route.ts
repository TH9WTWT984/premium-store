import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const pin = request.nextUrl.searchParams.get("pin")?.trim() ?? "";
  if (!/^\d{6}$/.test(pin)) {
    return NextResponse.json({ error: "Enter a valid 6-digit Indian PIN code." }, { status: 400 });
  }

  try {
    const response = await fetch(`https://api.pincodeapi.in/api/v1/pincode/${pin}`, {
      headers: { Accept: "application/json" },
      next: { revalidate: 86400 },
    });

    if (!response.ok) {
      return NextResponse.json({ error: "Unable to look up this PIN code right now." }, { status: 502 });
    }

    const payload = await response.json();
    const offices = Array.isArray(payload?.data?.post_offices) ? payload.data.post_offices : [];

    if (!payload?.success || offices.length === 0) {
      return NextResponse.json({ error: "We couldn't find that PIN code." }, { status: 404 });
    }

    const first = offices[0];
    return NextResponse.json({
      pin,
      city: first?.district || first?.office_name || "",
      state: first?.state || "",
      country: "IN",
      postOffices: offices.slice(0, 8).map((office: {
        office_name?: string;
        district?: string;
        state?: string;
        office_type?: string;
        delivery_status?: string;
      }) => ({
        name: office.office_name || "",
        district: office.district || "",
        state: office.state || "",
        type: office.office_type || "",
        deliveryStatus: office.delivery_status || "",
      })),
    });
  } catch (error) {
    console.error("GET /api/address/pincode", error);
    return NextResponse.json({ error: "Unable to look up this PIN code right now." }, { status: 502 });
  }
}

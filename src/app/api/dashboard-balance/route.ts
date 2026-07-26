import { getDashboardBalanceOverTime } from "@/db/summaries";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const startDate = searchParams.get("startDate");
  const endDate = searchParams.get("endDate");

  try {
    const data = getDashboardBalanceOverTime(startDate, endDate);
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching dashboard balance:", error);
    return NextResponse.json(
      { error: "Failed to fetch data" },
      { status: 500 },
    );
  }
}

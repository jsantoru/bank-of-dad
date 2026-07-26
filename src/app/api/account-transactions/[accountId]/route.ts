import { getAccountMonthlyTransactions } from "@/db/summaries";
import { NextRequest, NextResponse } from "next/server";

type RouteContext = {
  params: Promise<{
    accountId: string;
  }>;
};

export async function GET(request: NextRequest, context: RouteContext) {
  const { accountId } = await context.params;
  const searchParams = request.nextUrl.searchParams;
  const startDate = searchParams.get("startDate");
  const endDate = searchParams.get("endDate");

  try {
    const data = getAccountMonthlyTransactions(
      Number(accountId),
      startDate,
      endDate,
    );
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching account transactions:", error);
    return NextResponse.json(
      { error: "Failed to fetch data" },
      { status: 500 },
    );
  }
}

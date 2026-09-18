import { neon } from "@neondatabase/serverless";
import { NextResponse } from "next/server";
import type { ReportProps } from "@/app/types/types";

const sql = neon(process.env.DATABASE_URL || "");

const TZ = "America/Toronto";
const isYMD = (v: string | null): v is string => !!v && /^\d{4}-\d{2}-\d{2}$/.test(v);

export async function POST() {
  try {
    const report = await sql`
      INSERT INTO reports (status)
      VALUES ('pending')
      RETURNING id, created_at`
    ;

    return NextResponse.json(report, { status: 200 })
  }
  catch(error) {
    return NextResponse.json(
      { error: "Internal server error", details: String(error) },
      { status: 500 }
    );
  }
}

export async function PATCH(req: Request) {
  try {
    const request = await req.json();
    const reportId = Number(request.reportId);
    const status = request.status;

    const report = await sql`
      UPDATE reports
      SET status = ${status},
          created_at = CASE WHEN ${status} = 'completed' THEN now() ELSE created_at END
      WHERE id = ${reportId}
      RETURNING id, status, created_at
    `;

    return NextResponse.json(report, { status: 200 })
  } catch(error) {
    return NextResponse.json(
      { error: "Internal server error", details: String(error) },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const initialDate = searchParams.get("initialDate");
  const finalDate = searchParams.get("finalDate");

  if (!isYMD(initialDate) || !isYMD(finalDate)) {
    return NextResponse.json(
      { error: "initialDate y finalDate son requeridos en formato YYYY-MM-DD" },
      { status: 400 }
    );
  }

  if (initialDate > finalDate) {
    return NextResponse.json(
      { error: "initialDate no puede ser posterior a finalDate" },
      { status: 400 }
    );
  }

  try {
    const result = (await sql`
      SELECT * FROM reports
      WHERE created_at >= (${initialDate}::date)::timestamp AT TIME ZONE ${TZ}
        AND created_at <  (${finalDate}::date + 1)::timestamp AT TIME ZONE ${TZ}
      ORDER BY created_at DESC;
    `) as ReportProps[];

    return NextResponse.json({ data: result }, { status: 200 });
  } catch (error) {
    console.error("Error getting report list: ", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
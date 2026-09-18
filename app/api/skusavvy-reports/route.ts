import { neon } from "@neondatabase/serverless";
import { NextResponse } from "next/server";

const sql = neon(process.env.DATABASE_URL || "");

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
import "server-only";
import { neon } from "@neondatabase/serverless";

function db() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL is not configured!");
  return neon(url);
}

export async function createReport() {

  const sql = db();

  try {
    const report = await sql`
      INSERT INTO reports (status)
      VALUES ('pending')
      RETURNING id, created_at`
    ;

    return { success: true, data: report };
  } catch(error) {
    console.error(`[cron] failed to create initial report`, error);
    return { success: false, data: null, error: String(error) }
  }
}

export async function updateReport(reportId: string) {
  const sql = db();

  try {
    const report = await sql`
      UPDATE reports
      SET status = 'completed'
      WHERE id = ${reportId}
      RETURNING id, status, created_at
    `;

    return { success: true, data: report };
  } catch(error) {
    console.error(`[cron] failed to create initial report`, error);
    return { success: false, data: null, error: String(error) }
  }
}
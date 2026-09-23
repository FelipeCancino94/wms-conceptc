import { NextResponse } from "next/server";
// import { cronGenerateWarehouseInform } from "@/app/lib/cronGenerateWarehouseInform";
import { CronReports } from "@/app/lib/cronReports";

export const dynamic = "force-dynamic";
export const maxDuration = 600;

const TZ = "America/Toronto";

function getPartsInTZ(date: Date) {
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  });

  const parts = formatter.formatToParts(date);

  const get = (type: Intl.DateTimeFormatPartTypes): number => {
    const value = parts.find((part) => part.type === type)?.value;
    if (value === undefined) throw new Error(`Missing date part: ${type}`);

    const parsed = Number(value);
    if (Number.isNaN(parsed)) throw new Error(`Invalid date part ${type}: ${value}`);

    return parsed;
  };

  return {
    year: get("year"),
    month: get("month"),
    day: get("day"),
    hour: get("hour"),
    minute: get("minute"),
  };
}

function isScheduledMoment(now = new Date()) {
  const today = getPartsInTZ(now);
  const tomorrow = getPartsInTZ(new Date(now.getTime() + 86_400_000));

  const isLastDayOfMonth = today.month !== tomorrow.month;
  const isTargetHour = today.hour === 23 && today.minute >= 40 && today.minute < 50;

  return isLastDayOfMonth && isTargetHour;
}

export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    console.error("[cron] CRON_SECRET is not configured");
    return NextResponse.json({ ok: false, error: "misconfigured" }, { status: 500 });
  }

  if (req.headers.get("authorization") !== `Bearer ${secret}`) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    if (!isScheduledMoment()) {
      const local = getPartsInTZ(new Date());
      console.log(
        `[cron] skip — ${local.year}-${local.month}-${local.day} ` +
          `${local.hour}:${local.minute} ${TZ}`
      );
      return NextResponse.json({ skipped: true });
    }

    // const result = await cronGenerateWarehouseInform();
    const result = await CronReports();
    return NextResponse.json({ ok: true, ...result });
  } catch (error) {
    console.error("[cron] warehouse report failed:", error);
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
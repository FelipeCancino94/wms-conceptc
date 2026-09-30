import { NextResponse } from "next/server";
import { auth } from "@/auth";

const baseUrl = process.env.SKUSAVVY_BASE_URL || "";
const apiKey = process.env.SKUSAVVY_API_KEY || "";

const query = `
  query {
    warehouses {
      id
      name
    }
  }
`;

type GraphQLError = {
  message: string;
  extensions?: {
    cost?: {
      success: boolean;
      waitTimeInSeconds: number;
    };
  };
};

export async function POST() {
  const session = await auth();

  if (!session?.user?.canAccessSkusavvy) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const res = await fetch(baseUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Token": apiKey,
      },
      body: JSON.stringify({ query }),
      cache: "no-store",
    });

    const json = await res.json();

    if (json.errors) {
      const rateLimit = (json.errors as GraphQLError[]).find(
        (error) => error.extensions?.cost?.success === false
      );

      // Rate limited: tell the client how long to wait before trying again
      if (rateLimit) {
        return NextResponse.json(
          { error: json.errors, waitTimeInSeconds: Math.max(1, rateLimit.extensions?.cost?.waitTimeInSeconds ?? 60) },
          { status: 429 }
        );
      }

      return NextResponse.json({ error: json.errors }, { status: 400 });
    }

    return NextResponse.json(json.data.warehouses);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch warehouses", data: error }, { status: 500 });
  }
}
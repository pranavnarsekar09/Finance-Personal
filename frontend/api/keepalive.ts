const backendUrl = process.env.RENDER_BACKEND_URL;
const cronSecret = process.env.CRON_SECRET;

export async function GET(request: Request) {
  if (cronSecret) {
    const authHeader = request.headers.get("authorization");
    if (authHeader !== `Bearer ${cronSecret}`) {
      return new Response("Unauthorized", { status: 401 });
    }
  }

  if (!backendUrl) {
    return Response.json(
      {
        ok: false,
        message: "RENDER_BACKEND_URL is not configured.",
      },
      { status: 500 }
    );
  }

  const target = `${backendUrl.replace(/\/$/, "")}/api/health`;

  try {
    const response = await fetch(target, {
      method: "GET",
      cache: "no-store",
    });

    return Response.json({
      ok: response.ok,
      status: response.status,
      target,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return Response.json(
      {
        ok: false,
        target,
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

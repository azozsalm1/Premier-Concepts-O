const JSON_HEADERS = {
  "Content-Type": "application/json; charset=utf-8",
  "Cache-Control": "no-store"
};

const reply = (statusCode, payload) => ({
  statusCode,
  headers: JSON_HEADERS,
  body: JSON.stringify(payload)
});

exports.handler = async (event) => {
  if (event.httpMethod !== "GET") return reply(405, { error: "Method not allowed" });

  const address = String(event.queryStringParameters?.address || "").trim();
  if (!address) return reply(400, { error: "Address is required" });

  const key = process.env.RENTCAST_API_KEY;
  if (!key) return reply(500, { error: "RENTCAST_API_KEY is not configured in Netlify" });

  try {
    const url = "https://api.rentcast.io/v1/properties?address=" + encodeURIComponent(address);
    const response = await fetch(url, {
      headers: { "X-Api-Key": key, "Accept": "application/json" }
    });

    const raw = await response.text();
    let data;
    try { data = raw ? JSON.parse(raw) : null; }
    catch { return reply(502, { error: "RentCast returned a non-JSON response" }); }

    if (!response.ok) {
      return reply(response.status, {
        error: data?.message || data?.error || `RentCast returned ${response.status}`
      });
    }

    const property = Array.isArray(data) ? data[0] : data;
    if (!property) return reply(404, { error: "No property record found for this address" });

    return reply(200, { property });
  } catch (error) {
    console.error("property-lookup", error);
    return reply(502, { error: "Could not connect to RentCast" });
  }
};

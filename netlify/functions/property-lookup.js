const RENTCAST_ENDPOINT = "https://api.rentcast.io/v1/properties";

exports.handler = async (event) => {
  const headers = {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type"
  };

  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 204, headers, body: "" };
  }

  if (event.httpMethod !== "GET") {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: "Method not allowed" })
    };
  }

  const address = String(event.queryStringParameters?.address || "").trim();
  if (!address) {
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({ error: "Property address is required" })
    };
  }

  const apiKey = process.env.RENTCAST_API_KEY;
  if (!apiKey) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: "RENTCAST_API_KEY is not configured in Netlify environment variables"
      })
    };
  }

  try {
    const response = await fetch(
      `${RENTCAST_ENDPOINT}?address=${encodeURIComponent(address)}`,
      {
        headers: {
          Accept: "application/json",
          "X-Api-Key": apiKey
        }
      }
    );

    const raw = await response.text();
    let data;
    try {
      data = raw ? JSON.parse(raw) : null;
    } catch {
      data = { message: raw };
    }

    if (!response.ok) {
      return {
        statusCode: response.status,
        headers,
        body: JSON.stringify({
          error: data?.message || data?.error || `RentCast returned ${response.status}`
        })
      };
    }

    const property = Array.isArray(data) ? data[0] : data;
    if (!property) {
      return {
        statusCode: 404,
        headers,
        body: JSON.stringify({ error: "No property record found" })
      };
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ property })
    };
  } catch (error) {
    console.error("Property lookup error:", error);
    return {
      statusCode: 502,
      headers,
      body: JSON.stringify({ error: "Could not connect to RentCast" })
    };
  }
};

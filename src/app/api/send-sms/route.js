import axios from "axios";
import jwt from "jsonwebtoken";

const SECRET = process.env.JWT_SECRET || "super-secret-key";

export async function POST(req) {
  try {
    const { token, message } = await req.json();


    if (!token || !message) {
      return new Response(JSON.stringify({ error: "Missing 'token' or 'message'" }), {
        status: 400,
      });
    }
    const decoded = jwt.verify(token, SECRET);
    const to = decoded.phone;
    console.log("Decoded phone number:", to);
    const API_KEY = "textbelt";

    const res = await axios.post(
      "https://textbelt.com/text",
      {
        phone: to,
        message: message,
        key: API_KEY,
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    console.log("SMS API response:", res.data);
    if (res.data.success) {
      return new Response(JSON.stringify({ success: true, data: res.data }), { status: 200 });
    } else {
      return new Response(
        JSON.stringify({ success: false, error: res.data.error || "Failed to send SMS" }),
        { status: 400 }
      );
    }
  } catch (err) {
    console.error("SMS send failed:", err.message || err);
    return new Response(JSON.stringify({ error: "Internal server error" }), { status: 500 });
  }
}
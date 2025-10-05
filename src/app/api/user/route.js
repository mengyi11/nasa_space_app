import { NextResponse } from "next/server";
import pool from "../../../lib/db";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

const SECRET = process.env.JWT_SECRET || "super-secret-key";


async function getUserFromToken(token) {
  try {
    const decoded = jwt.verify(token, SECRET);
    const [users] = await pool.query("SELECT * FROM user WHERE phone = ?", [decoded.phone]);
    return users.length > 0 ? users[0] : null;
  } catch {
    return null;
  }
}

export async function GET(req) {
  const token = req.headers.get("authorization")?.split(" ")[1];
  if (!token) return NextResponse.json({ error: "Token required" }, { status: 401 });

  const user = await getUserFromToken(token);
  if (!user) return NextResponse.json({ error: "Invalid token" }, { status: 403 });

  const { password, ...userData } = user;
  return NextResponse.json({ user: userData });
}

export async function PUT(req) {
  const token = req.headers.get("authorization")?.split(" ")[1];
  if (!token) return NextResponse.json({ error: "Token required" }, { status: 401 });

  const user = await getUserFromToken(token);
  if (!user) return NextResponse.json({ error: "Invalid token" }, { status: 403 });

  const body = await req.json();
  const { city, state, country, pregnancy_status, has_asthma, has_bronchitis, has_copd } = body;

  await pool.query(
    `UPDATE user 
     SET city = ?, state = ?, country = ?, pregnancy_status = ?, has_asthma = ?, has_bronchitis = ?, has_copd = ?
     WHERE user_id = ?`,
    [city, state, country, pregnancy_status ? 1 : 0, has_asthma ? 1 : 0, has_bronchitis ? 1 : 0, has_copd ? 1 : 0, user.user_id]
  );

  return NextResponse.json({ message: "Profile updated successfully" });
}

export async function POST(req) {
  const token = req.headers.get("authorization")?.split(" ")[1];
  if (!token) return NextResponse.json({ error: "Token required" }, { status: 401 });

  const user = await getUserFromToken(token);

  console.log("User for password change:", user);
  if (!user) return NextResponse.json({ error: "Invalid token" }, { status: 403 });

  const { oldPassword, newPassword } = await req.json();
  if (!oldPassword || !newPassword) {
    return NextResponse.json({ error: "Missing password fields" }, { status: 400 });
  }

  const valid = await bcrypt.compare(oldPassword, user.password);
  if (!valid) return NextResponse.json({ error: "Old password incorrect" }, { status: 401 });

  const hashed = await bcrypt.hash(newPassword, 10);
  await pool.query("UPDATE user SET password = ? WHERE user_id = ?", [hashed, user.user_id]);

  return NextResponse.json({ message: "Password changed successfully" });
}
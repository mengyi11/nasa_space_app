// app/api/auth/route.js
import { NextResponse } from 'next/server';
import pool from '../../../lib/db';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const SECRET = process.env.JWT_SECRET || "super-secret-key";

export async function POST(req) {
  try {
    const body = await req.json();
    const { action, phone, birthYear, password } = body;

    if (!action) {
      return NextResponse.json({ error: 'Action is required' }, { status: 400 });
    }

    if (action === 'register') {
      console.log("data--------------------");
      console.log(body);
      const {
        phone,
        birthYear,
        password,
        city = "",
        state = "",
        country = "",
        pregnancy_status = false,
        has_asthma = false,
        has_bronchitis = false,
        has_copd = false,
      } = body;

      // 简单必填验证
      if (!phone || !birthYear || !password) {
        return NextResponse.json({ error: "Phone, birthYear, and password are required" }, { status: 400 });
      }

      // 检查手机号是否已注册
      const [existing] = await pool.query("SELECT * FROM user WHERE phone = ?", [phone]);
      if (existing.length > 0) {
        return NextResponse.json({ error: "Phone already registered" }, { status: 400 });
      }

      // 密码加密
      const hashedPassword = await bcrypt.hash(password, 10);

      // 插入新用户
      await pool.query(
        `INSERT INTO user 
      (phone, birth_year, password, city, state, country, pregnancy_status, has_asthma, has_bronchitis, has_copd)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          phone,
          birthYear,
          hashedPassword,
          city,
          state,
          country,
          pregnancy_status ? 1 : 0,
          has_asthma ? 1 : 0,
          has_bronchitis ? 1 : 0,
          has_copd ? 1 : 0,
        ]
      );

      return NextResponse.json({ message: "Registration successful" });

    }

    if (action === 'login') {
      if (!phone || !password) {
        return NextResponse.json({ error: 'Phone and password required' }, { status: 400 });
      }

      const [users] = await pool.query('SELECT * FROM user WHERE phone = ?', [phone]);
      if (users.length === 0) {
        return NextResponse.json({ error: 'User not found' }, { status: 401 });
      }

      const user = users[0];
      const valid = await bcrypt.compare(password, user.password);
      if (!valid) {
        return NextResponse.json({ error: 'Invalid password' }, { status: 401 });
      }

      const token = jwt.sign(
        { id: user.id, phone: user.phone },
        SECRET,
        { expiresIn: "2h" }
      );

      const { password: pw, ...userData } = user;

      return NextResponse.json({
        message: 'Login successful',
        token,
        user: userData
      });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
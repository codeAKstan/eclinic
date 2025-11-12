/*
  Seed the first admin user via terminal.
  Usage: node scripts/seedAdmin.js
*/
import "dotenv/config";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import User from "../models/User.js";

const uri = process.env.MONGODB_URI;
if (!uri) {
  console.error("MONGODB_URI not found in environment.");
  process.exit(1);
}

async function run() {
  try {
    await mongoose.connect(uri, { bufferCommands: false });

    const email = "admin@clinic.com";
    const password = "123456789";
    const existing = await User.findOne({ email });
    if (existing) {
      console.log("Admin already exists. No new admin created.");
      process.exit(0);
    }

    const passwordHash = await bcrypt.hash(password, 10);
    await User.create({ email, passwordHash, role: "admin" });
    console.log("Admin user created:", email);
    process.exit(0);
  } catch (err) {
    console.error("Failed to seed admin:", err);
    process.exit(1);
  }
}

run();
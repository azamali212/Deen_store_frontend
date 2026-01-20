"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import { useAuth } from "@/hooks/auth/useAuth";

interface Props {
  email: string;
  sessionId: string;
  portal: "admin" | "customer";
}

export default function OtpCard({ email, sessionId, portal }: Props) {
  const { verifyOtp } = useAuth();
  const [otp, setOtp] = useState("");

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-sm mx-auto bg-white/10 p-6 rounded-2xl shadow-lg backdrop-blur-md border border-white/20 mt-20"
    >
      <h1 className="text-2xl font-bold text-center mb-6 text-white">
        OTP Verification
      </h1>

      <p className="text-gray-300 text-sm mb-4 text-center">
        We’ve sent a verification code to {email}
      </p>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          verifyOtp({ portal, email, session_id: sessionId, otp });
        }}
        className="space-y-4"
      >
        <input
          type="text"
          maxLength={6}
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
          placeholder="Enter OTP"
          className="w-full px-4 py-2 bg-gray-900/50 rounded-lg border border-gray-700 text-white tracking-widest text-center text-xl"
        />
        <button
          type="submit"
          className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 text-white py-2 rounded-lg hover:opacity-90"
        >
          Verify OTP
        </button>
      </form>
    </motion.div>
  );
}
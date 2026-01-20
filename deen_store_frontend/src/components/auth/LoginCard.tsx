"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import { useAuth } from "@/hooks/auth/useAuth";

interface Props {
  portal: "admin" | "customer";
}

export default function LoginCard({ portal }: Props) {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-sm mx-auto bg-white/10 p-6 rounded-2xl shadow-lg backdrop-blur-md border border-white/20 mt-20"
    >
      <h1 className="text-2xl font-bold text-center mb-6 text-white">
        {portal === "admin" ? "Admin Login" : "Customer Login"}
      </h1>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          login({ email, password, portal });
        }}
        className="space-y-4"
      >
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          required
          className="w-full px-4 py-2 bg-gray-900/50 rounded-lg border border-gray-700 text-white"
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          required
          className="w-full px-4 py-2 bg-gray-900/50 rounded-lg border border-gray-700 text-white"
        />
        <button
          type="submit"
          className="w-full bg-gradient-to-r from-indigo-500 to-blue-600 text-white py-2 rounded-lg hover:opacity-90"
        >
          Sign In
        </button>
      </form>
    </motion.div>
  );
}
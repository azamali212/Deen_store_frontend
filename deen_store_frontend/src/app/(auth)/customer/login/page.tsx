"use client";

import AuthPage from "../../otp/page";

export default function CustomerLogin() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-black flex items-center justify-center">
      <AuthPage portal="customer" />
    </div>
  );
}
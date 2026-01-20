"use client";

import LoginCard from "@/components/auth/LoginCard";
import OtpCard from "@/components/auth/OtpCard";
import { useAuth } from "@/hooks/auth/useAuth";
import { AuthTab } from "@/core/auth/auth.tab";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const getKey = (portal: string) => `${portal}:${AuthTab.getId()}`;

export default function AuthPage({ portal }: { portal: "admin" | "customer" }) {
  const { auth, loading, error } = useAuth();
  const [sessionKey, setSessionKey] = useState<string>("");
  const router = useRouter();
  
  useEffect(() => {
    const key = getKey(portal);
    setSessionKey(key);
    
    // Check if already authenticated
    const token = sessionStorage.getItem(`auth:${portal}:${AuthTab.getId()}`) ||
                  localStorage.getItem(`${portal}_token`);
    
    if (token && auth.sessions[key]?.phase !== "authenticated") {
      // Redirect to appropriate dashboard
      setTimeout(() => {
        router.push(portal === "admin" ? "/dashboard" : "/userInterface");
      }, 100);
    }
  }, [auth, portal, router]);

  const session = auth.sessions[sessionKey];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-red-500 bg-white/10 p-4 rounded-lg">
          Error: {error}
          <button 
            onClick={() => window.location.reload()}
            className="ml-4 px-4 py-2 bg-red-600 text-white rounded"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!session) {
    return <LoginCard portal={portal} />;
  }

  if (session.phase === "otp_required") {
    return (
      <OtpCard
        email={session.email}
        sessionId={session.sessionId}
        portal={portal}
      />
    );
  }

  if (session.phase === "authenticated") {
    // Already handled in useEffect redirect
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-white">Redirecting to dashboard...</div>
      </div>
    );
  }

  return <LoginCard portal={portal} />;
}
export type AuthPhase =
  | "idle"
  | "authenticating"
  | "otp_required"
  | "authenticated"
  | "error";

export interface AuthSession {
  phase: AuthPhase;
  portal: "admin" | "customer";
  email?: string;
  sessionId?: string;
  user?: any;
  error?: string;
}
import type { Request, Response, NextFunction } from "express";

// Middleware para debuggear sesiones
export function sessionDebugMiddleware(req: Request, res: Response, next: NextFunction) {
  console.log("=== SESSION DEBUG ===");
  console.log("URL:", req.url);
  console.log("Method:", req.method);
  console.log("Session ID:", req.sessionID);
  console.log("Session exists:", !!req.session);
  console.log("User in session:", !!req.user);
  console.log("Is authenticated:", req.isAuthenticated?.());
  console.log("Cookies:", req.headers.cookie);
  
  if (req.session) {
    console.log("Session data keys:", Object.keys(req.session));
  }
  
  console.log("=== END SESSION DEBUG ===");
  next();
}
import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import type { Express } from "express";
import { storage } from "./storage";
import type { User } from "@shared/schema";

// Configuración de Google OAuth
export function setupGoogleAuth(app: Express) {
  if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
    console.log("⚠️  Google OAuth no configurado - variables de entorno faltantes");
    return;
  }

  // Configurar estrategia de Google
  passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "/api/auth/google/callback"
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      // Buscar usuario existente por email
      let user = await storage.getUserByEmail(profile.emails?.[0]?.value || "");
      
      if (user) {
        // Usuario existe, actualizar información de Google
        user = await storage.updateUser(user.id, {
          name: profile.displayName || user.name,
          googleId: profile.id,
          profileImage: profile.photos?.[0]?.value
        });
      } else {
        // Crear nuevo usuario
        user = await storage.createUser({
          name: profile.displayName || "Usuario Google",
          email: profile.emails?.[0]?.value || "",
          hashedPassword: null, // No se necesita password para Google
          googleId: profile.id,
          profileImage: profile.photos?.[0]?.value
        });
      }

      return done(null, user);
    } catch (error) {
      console.error("Error en autenticación Google:", error);
      return done(error, null);
    }
  }));

  // Serialización de usuario
  passport.serializeUser((user: any, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id: number, done) => {
    try {
      const user = await storage.getUserById(id);
      done(null, user);
    } catch (error) {
      done(error, null);
    }
  });

  // Rutas de Google OAuth
  app.get('/api/auth/google',
    passport.authenticate('google', { scope: ['profile', 'email'] })
  );

  app.get('/api/auth/google/callback',
    passport.authenticate('google', { failureRedirect: '/auth?error=google' }),
    (req, res) => {
      // Autenticación exitosa, redirigir al inicio
      res.redirect('/');
    }
  );
}
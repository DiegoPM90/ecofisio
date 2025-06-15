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

  console.log("✅ Google OAuth configurado correctamente");
  console.log("📍 Callback URL:", `https://${process.env.REPLIT_DOMAINS}/api/auth/google/callback`);

  // Configurar estrategia de Google
  passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: `https://${process.env.REPLIT_DOMAINS}/api/auth/google/callback`
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      console.log("=== GOOGLE OAUTH STRATEGY INICIADA ===");
      console.log("AccessToken:", accessToken ? "Presente" : "Ausente");
      console.log("Profile completo:", JSON.stringify(profile, null, 2));
      
      const email = profile.emails?.[0]?.value;
      if (!email) {
        console.error("❌ CRÍTICO: Google profile no tiene email");
        console.error("Emails array:", profile.emails);
        return done(new Error("No se pudo obtener email de Google"), false);
      }

      console.log("✅ Email obtenido de Google:", email);

      // Buscar usuario existente por email
      let user = await storage.getUserByEmail(email);
      
      if (user) {
        console.log("Usuario existente encontrado:", user.email);
        // Usuario existe, actualizar información de Google si no la tiene
        if (!user.googleId) {
          user = await storage.updateUser(user.id, {
            googleId: profile.id,
            profileImage: profile.photos?.[0]?.value
          });
          console.log("Usuario actualizado con datos de Google");
        }
      } else {
        console.log("Creando nuevo usuario de Google");
        // Crear nuevo usuario con datos completos
        const userData: any = {
          name: profile.displayName || "Usuario Google",
          email: email,
          googleId: profile.id,
          role: 'client'
        };
        
        // Solo agregar profileImage si existe
        if (profile.photos?.[0]?.value) {
          userData.profileImage = profile.photos[0].value;
        }
        
        console.log("Datos del usuario a crear:", userData);
        user = await storage.createUser(userData);
        console.log("Usuario creado exitosamente:", user.id);
      }

      if (!user) {
        console.error("No se pudo crear o encontrar usuario");
        return done(new Error("Error al procesar usuario"), undefined);
      }

      console.log("🎉 Autenticación Google EXITOSA para:", user.email);
      console.log("=== FIN GOOGLE OAUTH STRATEGY ===");
      return done(null, user);
    } catch (error: any) {
      console.error("💥 ERROR en Google OAuth Strategy:");
      console.error("Mensaje:", error.message);
      console.error("Stack completo:", error.stack);
      console.error("=== FIN ERROR GOOGLE OAUTH STRATEGY ===");
      return done(error, false);
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

  // Las rutas se manejan en routes.ts para evitar duplicación
}
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

  // Determinar callback URL correcto basado en el entorno
  const baseUrl = process.env.REPLIT_DOMAINS 
    ? `https://${process.env.REPLIT_DOMAINS}`
    : 'http://localhost:5000';
  
  const callbackURL = `${baseUrl}/api/auth/google/callback`;

  console.log("✅ Google OAuth configurado correctamente");
  console.log("📍 Callback URL:", callbackURL);
  console.log("🔑 Client ID:", process.env.GOOGLE_CLIENT_ID);

  // Configurar estrategia de Google
  passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: callbackURL
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
        console.log("Creando nuevo usuario de Google con inserción directa");
        
        // Importar MongoDB directamente para evitar validaciones problemáticas
        const { UserModel } = await import('./mongodb');
        const db = UserModel.db;
        const usersCollection = db.collection('users');
        
        const userData = {
          email: email,
          name: profile.displayName || "Usuario Google",
          googleId: profile.id,
          profileImage: profile.photos?.[0]?.value || null,
          role: 'client',
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date()
        };
        
        console.log("Insertando usuario OAuth directamente:", userData);
        
        try {
          const result = await usersCollection.insertOne(userData);
          const insertedUser = await usersCollection.findOne({ _id: result.insertedId });
          
          if (!insertedUser) {
            throw new Error("No se pudo recuperar el usuario insertado");
          }
          
          // Crear objeto User compatible 
          const userDoc = {
            id: insertedUser._id.toString(),
            email: insertedUser.email,
            name: insertedUser.name,
            hashedPassword: null,
            googleId: insertedUser.googleId,
            profileImage: insertedUser.profileImage,
            role: insertedUser.role,
            isActive: insertedUser.isActive,
            createdAt: insertedUser.createdAt.toISOString(),
            updatedAt: insertedUser.updatedAt.toISOString()
          };
          user = userDoc as any;
          
          console.log("Usuario OAuth creado exitosamente:", user!.id);
        } catch (insertError: any) {
          console.error("Error en inserción directa MongoDB:", insertError);
          if (insertError.code === 11000) {
            console.log("Usuario ya existe, obteniendo usuario existente");
            const existingUser = await usersCollection.findOne({ email: email });
            if (existingUser) {
              const existingUserDoc = {
                id: existingUser._id.toString(),
                email: existingUser.email,
                name: existingUser.name,
                hashedPassword: existingUser.hashedPassword || null,
                googleId: existingUser.googleId || profile.id,
                profileImage: existingUser.profileImage,
                role: existingUser.role,
                isActive: existingUser.isActive,
                createdAt: existingUser.createdAt.toISOString(),
                updatedAt: existingUser.updatedAt.toISOString()
              };
              user = existingUserDoc as any;
            }
          } else {
            throw insertError;
          }
        }
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

  // Serialización de usuario - guardar todo el objeto para evitar problemas de ID
  passport.serializeUser((user: any, done) => {
    console.log("🔄 Serializando usuario completo:", user.email);
    done(null, JSON.stringify(user));
  });

  passport.deserializeUser(async (serializedUser: string, done) => {
    try {
      console.log("🔄 Deserializando usuario desde JSON");
      const user = JSON.parse(serializedUser);
      console.log("✅ Usuario deserializado exitosamente:", user.email);
      done(null, user);
    } catch (error) {
      console.error("💥 Error en deserialización:", error);
      done(error, null);
    }
  });

  // Las rutas se manejan en routes.ts para evitar duplicación
}
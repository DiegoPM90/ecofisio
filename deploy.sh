#!/bin/bash

echo "🔄 Preparando deploy con navegación completa..."

# Crear directorio dist si no existe
mkdir -p dist

# Crear index.html optimizado para producción
cat > dist/index.html << 'EOF'
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>EcoFisio - Sistema de Reservas de Kinesiología</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <style>
        .btn-primary { background: #3b82f6; color: white; padding: 0.75rem 1.5rem; border: none; border-radius: 0.5rem; cursor: pointer; font-weight: 500; text-decoration: none; display: inline-block; transition: background 0.2s; }
        .btn-secondary { background: #10b981; color: white; padding: 0.75rem 1.5rem; border: none; border-radius: 0.5rem; cursor: pointer; font-weight: 500; text-decoration: none; display: inline-block; transition: background 0.2s; }
        .btn-ghost { background: transparent; color: #6b7280; padding: 0.5rem 0.75rem; border: none; border-radius: 0.375rem; cursor: pointer; text-decoration: none; display: inline-block; transition: all 0.2s; }
        .btn-primary:hover { background: #2563eb; }
        .btn-secondary:hover { background: #059669; }
        .btn-ghost:hover { color: #374151; background: #f9fafb; }
        .feature-card { transition: transform 0.2s, box-shadow 0.2s; }
        .feature-card:hover { transform: translateY(-2px); box-shadow: 0 10px 25px rgba(0,0,0,0.1); }
    </style>
</head>
<body class="min-h-screen bg-slate-50">
    <!-- Navegación Principal -->
    <nav class="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="flex justify-between h-16">
                <div class="flex items-center">
                    <a href="/" class="flex-shrink-0 flex items-center hover:opacity-80 transition-opacity">
                        <div class="h-8 w-8 bg-blue-600 rounded-lg flex items-center justify-center mr-3">
                            <span class="text-white font-bold text-sm">EC</span>
                        </div>
                        <span class="font-bold text-xl text-gray-900">EcoFisio Centro</span>
                    </a>
                </div>
                <div class="flex items-center space-x-4" id="nav-buttons">
                    <a href="/auth" class="btn-ghost">Iniciar Sesión</a>
                    <a href="/auth" class="btn-primary">Registrarse</a>
                </div>
            </div>
        </div>
    </nav>

    <!-- Contenido Principal -->
    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <!-- Hero Section -->
        <section class="text-center py-16">
            <div class="max-w-4xl mx-auto">
                <h1 class="text-4xl md:text-6xl font-bold text-slate-900 mb-6 leading-tight">
                    Reserva tu Sesión de Kinesiología
                </h1>
                <p class="text-xl text-slate-600 mb-8 max-w-2xl mx-auto leading-relaxed">
                    Sistema inteligente de reservas con asistencia de IA para orientación kinesiológica profesional
                </p>
                <div class="flex flex-col sm:flex-row gap-4 justify-center">
                    <a href="/auth" class="btn-primary text-lg px-8 py-4">Reservar Cita</a>
                    <a href="/status" class="btn-secondary text-lg px-8 py-4">Estado de Citas</a>
                </div>
            </div>
        </section>

        <!-- Features -->
        <section class="py-16">
            <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div class="feature-card bg-white p-6 rounded-xl shadow-sm border border-slate-200 text-center">
                    <div class="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                        <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                    </div>
                    <h3 class="text-lg font-semibold text-slate-900 mb-2">Reserva Rápida</h3>
                    <p class="text-slate-600">Agenda tu cita en minutos con nuestro calendario inteligente</p>
                </div>
                
                <div class="feature-card bg-white p-6 rounded-xl shadow-sm border border-slate-200 text-center">
                    <div class="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                        <svg class="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                        </svg>
                    </div>
                    <h3 class="text-lg font-semibold text-slate-900 mb-2">Asistente IA</h3>
                    <p class="text-slate-600">Recibe orientación inicial sobre tu sesión de kinesiología</p>
                </div>
                
                <div class="feature-card bg-white p-6 rounded-xl shadow-sm border border-slate-200 text-center">
                    <div class="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                        <svg class="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                    </div>
                    <h3 class="text-lg font-semibold text-slate-900 mb-2">Datos Seguros</h3>
                    <p class="text-slate-600">Tu información de salud protegida y confidencial</p>
                </div>
            </div>
        </section>

        <!-- Info Section -->
        <section class="py-16 bg-white rounded-2xl shadow-sm border border-slate-200">
            <div class="max-w-4xl mx-auto text-center px-6">
                <h2 class="text-3xl font-bold text-slate-900 mb-6">Horarios de Atención</h2>
                <div class="bg-blue-50 rounded-lg p-6 mb-6">
                    <p class="text-lg text-slate-700 mb-2"><strong>Sábados:</strong> 10:00 - 13:00</p>
                    <p class="text-slate-600">Especialidad: Rehabilitación Kinesiológica</p>
                </div>
                <p class="text-slate-600">Reserva tu cita y recibe orientación personalizada para tu tratamiento</p>
            </div>
        </section>
    </main>

    <!-- Footer -->
    <footer class="bg-white border-t border-slate-200 mt-16">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div class="text-center">
                <p class="text-slate-600">&copy; 2025 EcoFisio Centro. Sistema de reservas profesional.</p>
            </div>
        </div>
    </footer>

    <script>
        // Verificar autenticación y actualizar navegación
        async function checkAuthAndUpdateNav() {
            try {
                const response = await fetch('/api/auth/me', { 
                    credentials: 'include',
                    headers: { 'Accept': 'application/json' }
                });
                
                if (response.ok) {
                    const data = await response.json();
                    if (data.user) {
                        updateNavForAuthenticatedUser(data.user);
                    }
                }
            } catch (error) {
                // Mantener navegación por defecto si no está autenticado
                console.log('Usuario no autenticado');
            }
        }

        function updateNavForAuthenticatedUser(user) {
            const navButtons = document.getElementById('nav-buttons');
            if (navButtons && user) {
                navButtons.innerHTML = `
                    <span class="text-gray-700 font-medium">Hola, ${user.name || user.email || 'Usuario'}</span>
                    <a href="/status" class="btn-ghost">Mis Citas</a>
                    <button onclick="handleLogout()" class="btn-ghost">Cerrar Sesión</button>
                `;
            }
        }

        async function handleLogout() {
            try {
                const response = await fetch('/api/auth/logout', { 
                    method: 'POST', 
                    credentials: 'include',
                    headers: { 'Accept': 'application/json' }
                });
                
                if (response.ok) {
                    window.location.reload();
                } else {
                    console.error('Error al cerrar sesión');
                }
            } catch (error) {
                console.error('Error al cerrar sesión:', error);
                // Recargar página como fallback
                window.location.reload();
            }
        }

        // Verificar autenticación al cargar la página
        document.addEventListener('DOMContentLoaded', checkAuthAndUpdateNav);
        
        // Verificar autenticación periódicamente
        setInterval(checkAuthAndUpdateNav, 30000); // cada 30 segundos
    </script>
</body>
</html>
EOF

# Compilar backend
echo "🔧 Compilando backend..."
npx esbuild server/index.ts --platform=node --packages=external --bundle --format=esm --outdir=dist

echo "✅ Deploy preparado correctamente"
echo "📁 Archivos listos en dist/"
ls -la dist/
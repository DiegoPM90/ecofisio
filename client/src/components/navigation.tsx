import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/contexts/auth-context";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  User, 
  LogOut, 
  Shield, 
  Calendar,
  Home,
  Menu,
  X
} from "lucide-react";

export default function Navigation() {
  const { user, logout, isAuthenticated } = useAuth();
  const [location, setLocation] = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    setLocation("/");
  };

  const getUserInitials = (name: string) => {
    return name
      .split(" ")
      .map(word => word.charAt(0))
      .join("")
      .toUpperCase();
  };

  const isActive = (path: string) => {
    return location === path;
  };

  return (
    <nav className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
        <div className="flex justify-between h-14 sm:h-16">
          {/* Logo y navegación principal */}
          <div className="flex items-center">
            <Link href="/">
              <div className="flex-shrink-0 flex items-center cursor-pointer">
                <svg width="32" height="32" viewBox="0 0 32 32" className="mr-2 sm:mr-3">
                  <defs>
                    <linearGradient id="exerciseGradientNav" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" style={{ stopColor: '#3b82f6', stopOpacity: 1 }} />
                      <stop offset="50%" style={{ stopColor: '#06b6d4', stopOpacity: 1 }} />
                      <stop offset="100%" style={{ stopColor: '#8b5cf6', stopOpacity: 1 }} />
                    </linearGradient>
                  </defs>
                  <circle cx="16" cy="16" r="15" fill="#f8fafc" stroke="#e2e8f0" strokeWidth="1"/>
                  <g transform="translate(8, 8)">
                    <circle cx="0" cy="0" r="1.5" fill="url(#exerciseGradientNav)"/>
                    <rect x="-0.5" y="1.5" width="1" height="3" fill="url(#exerciseGradientNav)"/>
                    <line x1="-2" y1="2.5" x2="2" y2="2.5" stroke="url(#exerciseGradientNav)" strokeWidth="1.5" strokeLinecap="round"/>
                    <rect x="-2.5" y="2" width="1" height="1" fill="#64748b"/>
                    <rect x="1.5" y="2" width="1" height="1" fill="#64748b"/>
                    <line x1="-0.5" y1="4.5" x2="-1" y2="6" stroke="url(#exerciseGradientNav)" strokeWidth="1"/>
                    <line x1="0.5" y1="4.5" x2="1" y2="6" stroke="url(#exerciseGradientNav)" strokeWidth="1"/>
                    <circle cx="-2" cy="2.5" r="0.3" fill="#22c55e"/>
                    <circle cx="2" cy="2.5" r="0.3" fill="#22c55e"/>
                  </g>
                  <g transform="translate(20, 8)">
                    <circle cx="0" cy="0" r="1.2" fill="url(#exerciseGradientNav)"/>
                    <rect x="-0.4" y="1.2" width="0.8" height="2.5" fill="url(#exerciseGradientNav)"/>
                    <line x1="-0.8" y1="2" x2="-1.5" y2="3.5" stroke="url(#exerciseGradientNav)" strokeWidth="1"/>
                    <line x1="0.8" y1="2" x2="1.5" y2="3.5" stroke="url(#exerciseGradientNav)" strokeWidth="1"/>
                    <line x1="-0.4" y1="3.7" x2="-1.2" y2="5.5" stroke="url(#exerciseGradientNav)" strokeWidth="1"/>
                    <line x1="0.4" y1="3.7" x2="1.2" y2="5.5" stroke="url(#exerciseGradientNav)" strokeWidth="1"/>
                    <circle cx="-0.8" cy="1.5" r="0.2" fill="#ef4444"/>
                    <circle cx="0.8" cy="1.5" r="0.2" fill="#ef4444"/>
                  </g>
                  <text x="16" y="28" textAnchor="middle" fontSize="3" fill="#3b82f6" fontWeight="bold">KINESIO</text>
                </svg>
                <span className="font-bold text-lg sm:text-xl text-gray-900 dark:text-white">
                  ECOFISIO
                </span>
              </div>
            </Link>

            {/* Enlaces de navegación - Desktop */}
            <div className="hidden md:ml-10 md:flex md:space-x-8">
              <Link href="/">
                <button
                  className={`inline-flex items-center px-1 pt-1 text-sm font-medium border-b-2 ${
                    isActive("/")
                      ? "border-blue-500 text-blue-600 dark:text-blue-400"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-300 dark:hover:text-white"
                  }`}
                >
                  <Home className="h-4 w-4 mr-2" />
                  Inicio
                </button>
              </Link>

              {isAuthenticated && (
                <Link href="/my-appointments">
                  <button
                    className={`inline-flex items-center px-1 pt-1 text-sm font-medium border-b-2 ${
                      isActive("/my-appointments")
                        ? "border-blue-500 text-blue-600 dark:text-blue-400"
                        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-300 dark:hover:text-white"
                    }`}
                  >
                    <Calendar className="h-4 w-4 mr-2" />
                    Mis Citas
                  </button>
                </Link>
              )}


            </div>
          </div>

          {/* Menú de usuario - Desktop */}
          <div className="hidden md:flex md:items-center md:space-x-4">
            {isAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-blue-600 text-white text-xs">
                        {user ? getUserInitials(user.name) : "U"}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{user?.name}</p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {user?.email}
                      </p>

                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => setLocation("/profile")}>
                    <User className="mr-2 h-4 w-4" />
                    <span>Mi Perfil</span>
                  </DropdownMenuItem>

                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Cerrar Sesión</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex items-center space-x-4">
                <Link href="/auth">
                  <Button variant="ghost" size="sm">
                    Iniciar Sesión
                  </Button>
                </Link>
                <Link href="/auth">
                  <Button size="sm">
                    Registrarse
                  </Button>
                </Link>
              </div>
            )}
          </div>

          {/* Botón menú móvil */}
          <div className="md:hidden flex items-center">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="inline-flex items-center justify-center p-2 h-10 w-10"
            >
              {isMobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Menú móvil */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-gray-200 dark:border-gray-700">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <Link href="/">
              <button
                className={`block px-3 py-3 text-base font-medium w-full text-left rounded-md ${
                  isActive("/")
                    ? "text-blue-600 bg-blue-50 dark:text-blue-400 dark:bg-blue-900/20"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-50 dark:text-gray-300 dark:hover:text-white dark:hover:bg-gray-700"
                }`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <Home className="h-5 w-5 mr-3 inline" />
                Inicio
              </button>
            </Link>

            {isAuthenticated && (
              <>
                <Link href="/my-appointments">
                  <button
                    className={`block px-3 py-3 text-base font-medium w-full text-left rounded-md ${
                      isActive("/my-appointments")
                        ? "text-blue-600 bg-blue-50 dark:text-blue-400 dark:bg-blue-900/20"
                        : "text-gray-600 hover:text-gray-900 hover:bg-gray-50 dark:text-gray-300 dark:hover:text-white dark:hover:bg-gray-700"
                    }`}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <Calendar className="h-5 w-5 mr-3 inline" />
                    Mis Citas
                  </button>
                </Link>



                <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                  <div className="flex items-center px-3 mb-3">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className="bg-blue-600 text-white">
                        {user ? getUserInitials(user.name) : "U"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="ml-3">
                      <div className="text-base font-medium text-gray-800 dark:text-white">
                        {user?.name}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {user?.email}
                      </div>
                    </div>
                  </div>
                  
                  <button
                    className="block px-3 py-2 text-base font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 dark:text-gray-300 dark:hover:text-white dark:hover:bg-gray-700 w-full text-left"
                    onClick={() => {
                      setLocation("/profile");
                      setIsMobileMenuOpen(false);
                    }}
                  >
                    <User className="h-4 w-4 mr-2 inline" />
                    Mi Perfil
                  </button>
                  
                  <button
                    className="block px-3 py-2 text-base font-medium text-red-600 hover:text-red-900 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-900/20 w-full text-left"
                    onClick={() => {
                      handleLogout();
                      setIsMobileMenuOpen(false);
                    }}
                  >
                    <LogOut className="h-4 w-4 mr-2 inline" />
                    Cerrar Sesión
                  </button>
                </div>
              </>
            )}

            {!isAuthenticated && (
              <div className="border-t border-gray-200 dark:border-gray-700 pt-4 space-y-1">
                <Link href="/auth">
                  <button
                    className="block px-3 py-2 text-base font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 dark:text-gray-300 dark:hover:text-white dark:hover:bg-gray-700 w-full text-left"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Iniciar Sesión
                  </button>
                </Link>
                <Link href="/auth">
                  <button
                    className="block px-3 py-2 text-base font-medium text-blue-600 hover:text-blue-900 hover:bg-blue-50 dark:text-blue-400 dark:hover:text-blue-300 dark:hover:bg-blue-900/20 w-full text-left"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Registrarse
                  </button>
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
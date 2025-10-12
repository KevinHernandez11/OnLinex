import { Github, Linkedin, User, LogOut, Settings, Info } from "lucide-react"
import { Link, Outlet, useNavigate } from "react-router-dom"
import { useState } from "react"

import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { useSession } from "@/context/session-context"

export function MainLayout() {
  const { session, clearSession } = useSession()
  const navigate = useNavigate()
  const [showInfo, setShowInfo] = useState(false)

  function handleLogout() {
    clearSession()
    navigate("/")
  }

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 max-w-screen-2xl items-center justify-between px-4">
          <div className="flex items-center gap-6">
            <Link
              to="/"
              className="flex items-center space-x-2 text-2xl font-bold tracking-tight text-primary transition hover:text-primary/80"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <span className="text-sm font-bold">O</span>
              </div>
              <span className="hidden sm:inline-block">OnLinex</span>
            </Link>
            {session && (
              <nav className="hidden md:flex items-center space-x-6 text-sm font-medium">
                <Link
                  to="/rooms/create"
                  className="transition-colors hover:text-foreground/80 text-foreground/60"
                >
                  Crear sala
                </Link>
                <Link
                  to="/rooms/join"
                  className="transition-colors hover:text-foreground/80 text-foreground/60"
                >
                  Unirse a sala
                </Link>
                <Link
                  to="/ai"
                  className="transition-colors hover:text-foreground/80 text-foreground/60"
                >
                  IA Chat
                </Link>
              </nav>
            )}
          </div>

          <div className="flex items-center gap-4">
            {session ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src="" alt="Usuario" />
                      <AvatarFallback className="bg-primary/10 text-primary">
                        <User className="h-4 w-4" />
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">Mi cuenta</p>
                      <p className="text-xs leading-none text-muted-foreground">
                        Usuario conectado
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to="/profile" className="cursor-pointer">
                      <User className="mr-2 h-4 w-4" />
                      <span>Perfil</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/settings" className="cursor-pointer">
                      <Settings className="mr-2 h-4 w-4" />
                      <span>Configuración</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="cursor-pointer">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Cerrar sesión</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex items-center gap-2">
                <Button variant="ghost" asChild>
                  <Link to="/login">Iniciar sesión</Link>
                </Button>
                <Button asChild>
                  <Link to="/register">Registrarse</Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      </header>
      <main className="flex-1 px-4 py-4 sm:px-6 sm:py-6">
        <div className="flex w-full items-center justify-center">
          <Outlet />
        </div>
      </main>
      <footer className="border-t border-border/40 bg-muted/20 backdrop-blur supports-[backdrop-filter]:bg-muted/10">
        <div className="container mx-auto max-w-screen-2xl px-4 py-6">
          <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>Hecho con</span>
              <Badge variant="outline" className="px-2 py-0.5 text-xs">
                ❤️
              </Badge>
              <span>por el equipo OnLinex</span>
            </div>
            <Separator orientation="vertical" className="hidden md:block h-4" />
            <div className="flex items-center gap-6">
              <a
                href="https://github.com/KevinHernandez11"
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 text-sm text-muted-foreground transition hover:text-primary"
              >
                <Github className="h-4 w-4" />
                <span>Kevzx</span>
              </a>
              <a
                href="https://www.linkedin.com/in/KevinHernandez011/"
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 text-sm text-muted-foreground transition hover:text-primary"
              >
                <Linkedin className="h-4 w-4" />
                <span>LinkedIn</span>
              </a>
            </div>
          </div>
        </div>
      </footer>

      {/* Floating Info Button */}
      <div className="fixed bottom-6 right-6 z-50 sm:bottom-8 sm:right-8">
        <button
          type="button"
          onClick={() => setShowInfo(true)}
          className="group relative inline-flex h-12 w-12 items-center justify-center rounded-full bg-primary/90 text-primary-foreground shadow-lg shadow-primary/25 transition-all hover:scale-105 hover:bg-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/70"
        >
          <Info className="h-5 w-5 transition group-hover:rotate-12" aria-hidden="true" />
          <span className="sr-only">Información de la página</span>
        </button>
      </div>

      {/* Info Modal */}
      {showInfo ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 px-4 py-10 backdrop-blur-sm">
          <div className="relative w-full max-w-2xl rounded-2xl border border-border/70 bg-background/95 p-6 shadow-2xl shadow-primary/10 sm:p-8">
            <button
              type="button"
              onClick={() => setShowInfo(false)}
              className="absolute right-4 top-4 inline-flex h-8 w-8 items-center justify-center rounded-full border border-border/60 text-muted-foreground transition hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              <span className="sr-only">Cerrar</span>
            </button>
            <div className="space-y-4">
              <div className="space-y-2">
                <h2 className="text-xl font-semibold text-foreground">Acerca de OnLinex</h2>
                <p className="text-sm text-muted-foreground">
                  OnLinex es una plataforma colaborativa diseñada para equipos modernos que necesitan 
                  comunicarse y trabajar en tiempo real con el apoyo de inteligencia artificial.
                </p>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-lg border border-border/60 bg-muted/30 p-4">
                  <h3 className="font-medium text-foreground mb-2">🚀 Salas Colaborativas</h3>
                  <p className="text-xs text-muted-foreground">
                    Crea espacios de trabajo instantáneos para tu equipo
                  </p>
                </div>
                <div className="rounded-lg border border-border/60 bg-muted/30 p-4">
                  <h3 className="font-medium text-foreground mb-2">🤖 IA Integrada</h3>
                  <p className="text-xs text-muted-foreground">
                    Asistente inteligente disponible 24/7 para ayudarte
                  </p>
                </div>
              </div>
              <div className="flex justify-end">
                <Button variant="secondary" onClick={() => setShowInfo(false)}>
                  Cerrar
                </Button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}

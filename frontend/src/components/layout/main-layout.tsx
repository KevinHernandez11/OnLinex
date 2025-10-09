import { Github, Linkedin } from "lucide-react"
import { Link, Outlet, useNavigate } from "react-router-dom"

import { Button } from "@/components/ui/button"
import { useSession } from "@/context/session-context"

export function MainLayout() {
  const { session, clearSession } = useSession()
  const navigate = useNavigate()

  function handleLogout() {
    clearSession()
    navigate("/")
  }

  return (
    <div className="flex min-h-screen flex-col overflow-hidden bg-background text-foreground">
      <header className="flex items-center justify-between px-6 py-4">
        <Link
          to="/"
          className="text-2xl font-bold tracking-tight text-primary transition hover:text-primary/80"
        >
          OnLinex
        </Link>
        <div className="flex items-center gap-2">
          {session ? (
            <Button variant="outline" onClick={handleLogout}>
              Cerrar sesión
            </Button>
          ) : (
            <>
              <Button variant="ghost" asChild>
                <Link to="/login">Iniciar sesión</Link>
              </Button>
              <Button asChild>
                <Link to="/register">Registrarse</Link>
              </Button>
            </>
          )}
        </div>
      </header>
      <main className="flex-1 overflow-hidden px-4 py-4 sm:px-6 sm:py-6">
        <div className="flex h-full w-full items-center justify-center overflow-hidden">
          <Outlet />
        </div>
      </main>
      <footer className="border-t border-border/70 bg-muted/40 py-4">
        <div className="mx-auto flex max-w-3xl flex-col items-center gap-3 px-6 text-center text-sm text-muted-foreground">
          <p className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
            Hecho con cariño por <span aria-hidden="true">❤️</span>
          </p>
          <div className="flex items-center gap-6">
            <a
              href="https://github.com/KevinHernandez11"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2 transition hover:text-primary"
            >
              <Github className="h-4 w-4" aria-hidden="true" />
              <span>Kevzx</span>
            </a>
            <a
              href="https://www.linkedin.com/in/KevinHernandez011/"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2 transition hover:text-primary"
            >
              <Linkedin className="h-4 w-4" aria-hidden="true" />
              <span>LinkedIn</span>
            </a>
          </div>
        </div>
      </footer>
    </div>
  )
}

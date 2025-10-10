import { CheckCircle2 } from "lucide-react"
import { Link, useNavigate, useSearchParams } from "react-router-dom"

import { RegisterForm } from "@/components/auth/register-form"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useSession } from "@/context/session-context"

export function RegisterPage() {
  const { setSession } = useSession()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const redirectTo = searchParams.get("redirect") ?? "/"

  function handleRegisterSuccess(token: string, tokenType: string) {
    setSession({ token, tokenType })
    navigate(redirectTo, { replace: true })
  }

  const highlights = [
    "Crea salas privadas o públicas en segundos.",
    "Invita a tu equipo y comparte conversaciones seguras.",
    "Accede a la IA para recibir apoyo y automatizar tareas.",
  ]

  return (
    <section className="relative mx-auto flex w-full max-w-5xl overflow-hidden rounded-3xl border bg-card/70 px-6 py-12 shadow-xl shadow-primary/10 sm:px-10 md:py-16">
      <div className="pointer-events-none absolute -left-24 top-8 h-72 w-72 rounded-full bg-primary/15 blur-3xl" />
      <div className="pointer-events-none absolute -right-24 bottom-0 h-72 w-72 rounded-full bg-sky-500/15 blur-3xl" />
      <div className="relative grid gap-10 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="flex flex-col justify-center gap-6 text-left">
          <div className="space-y-4">
            <h2 className="text-3xl font-semibold sm:text-4xl">Construye tu espacio en OnLinex</h2>
            <p className="max-w-lg text-base text-muted-foreground sm:text-lg">
              Regístrate para crear salas sin límites, sumar a tus colaboradores y aprovechar una
              experiencia potenciada por inteligencia artificial.
            </p>
          </div>
          <ul className="space-y-3 text-sm text-muted-foreground">
            {highlights.map((highlight) => (
              <li key={highlight} className="flex items-start gap-2">
                <CheckCircle2 className="mt-0.5 h-4 w-4 text-primary" />
                <span>{highlight}</span>
              </li>
            ))}
          </ul>
        </div>
        <Card className="border border-border/60 bg-background/90 shadow-lg shadow-primary/5 backdrop-blur">
          <CardHeader className="space-y-1 text-center">
            <CardTitle className="text-2xl font-semibold">Crear tu cuenta</CardTitle>
            <CardDescription>
              Completa tus datos y accede a todas las funciones de OnLinex.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <RegisterForm onRegisterSuccess={handleRegisterSuccess} />
            <p className="text-center text-sm text-muted-foreground">
              ¿Ya tienes cuenta?{" "}
              <Link
                to={`/login?redirect=${encodeURIComponent(redirectTo)}`}
                className="font-medium text-primary hover:underline"
              >
                Inicia sesión
              </Link>
              .
            </p>
          </CardContent>
        </Card>
      </div>
    </section>
  )
}

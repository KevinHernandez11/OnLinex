import { CheckCircle2 } from "lucide-react"
import { Link, useNavigate, useSearchParams } from "react-router-dom"

import { LoginForm } from "@/components/auth/login-form"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useSession } from "@/context/session-context"

export function LoginPage() {
  const { setSession } = useSession()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const redirectTo = searchParams.get("redirect") ?? "/"

  function handleLoginSuccess(token: string, tokenType: string) {
    setSession({ token, tokenType })
    navigate(redirectTo, { replace: true })
  }

  const benefits = [
    "Gestiona salas colaborativas en tiempo real.",
    "Invita a tus compañeros y comparte conversaciones.",
    "Accede a la IA integrada para resolver dudas al instante.",
  ]

  return (
    <section className="relative mx-auto flex w-full max-w-5xl overflow-hidden rounded-3xl border bg-card/70 px-6 py-12 shadow-xl shadow-primary/10 sm:px-10 md:py-16">
      <div className="pointer-events-none absolute -left-24 top-8 h-72 w-72 rounded-full bg-primary/15 blur-3xl" />
      <div className="pointer-events-none absolute -right-24 bottom-0 h-72 w-72 rounded-full bg-sky-500/15 blur-3xl" />
      <div className="relative grid gap-10 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="flex flex-col justify-center gap-6 text-left">
          <span className="inline-flex w-fit items-center rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-primary">
            Bienvenido de vuelta
          </span>
          <div className="space-y-4">
            <h2 className="text-3xl font-semibold sm:text-4xl">Continúa donde lo dejaste</h2>
            <p className="max-w-lg text-base text-muted-foreground sm:text-lg">
              Inicia sesión para administrar tus salas activas, organizar a tu equipo y seguir
              conversando con nuestros asistentes inteligentes.
            </p>
          </div>
          <ul className="space-y-3 text-sm text-muted-foreground">
            {benefits.map((benefit) => (
              <li key={benefit} className="flex items-start gap-2">
                <CheckCircle2 className="mt-0.5 h-4 w-4 text-primary" />
                <span>{benefit}</span>
              </li>
            ))}
          </ul>
        </div>
        <Card className="border border-border/60 bg-background/90 shadow-lg shadow-primary/5 backdrop-blur">
          <CardHeader className="space-y-1 text-center">
            <CardTitle className="text-2xl font-semibold">Iniciar sesión</CardTitle>
            <CardDescription>
              Ingresa tus credenciales para retomar tus proyectos y chats en OnLinex.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <LoginForm onLoginSuccess={handleLoginSuccess} />
            <p className="text-center text-sm text-muted-foreground">
              ¿No tienes cuenta?{" "}
              <Link
                to={`/register?redirect=${encodeURIComponent(redirectTo)}`}
                className="font-medium text-primary hover:underline"
              >
                Regístrate aquí
              </Link>
              .
            </p>
          </CardContent>
        </Card>
      </div>
    </section>
  )
}

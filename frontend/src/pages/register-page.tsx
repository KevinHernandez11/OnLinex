import { CheckCircle2, UserPlus, ArrowRight } from "lucide-react"
import { Link, useNavigate, useSearchParams } from "react-router-dom"

import { RegisterForm } from "@/components/auth/register-form"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
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
    <section className="relative mx-auto flex w-full max-w-6xl overflow-hidden rounded-3xl border border-border/40 bg-card px-6 py-12 shadow-lg shadow-primary/5 sm:px-10 md:py-16">
      
      <div className="relative grid gap-12 lg:grid-cols-[1.2fr_1fr]">
        <div className="flex flex-col justify-center gap-8 text-left">
          <div className="space-y-6">
            <Badge variant="outline" className="w-fit px-4 py-2 text-sm font-medium">
              <UserPlus className="mr-2 h-4 w-4" />
              Únete a OnLinex
            </Badge>
            
            <div className="space-y-4">
              <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-4xl">
                Construye tu espacio en OnLinex
              </h1>
              <p className="max-w-xl text-lg text-muted-foreground leading-relaxed">
                Regístrate para crear salas sin límites, sumar a tus colaboradores y aprovechar una
                experiencia potenciada por inteligencia artificial.
              </p>
            </div>
          </div>

          <Separator className="my-6" />
          
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-foreground">¿Qué incluye tu cuenta?</h3>
            <ul className="space-y-4">
              {highlights.map((highlight) => (
                <li key={highlight} className="flex items-start gap-3">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 mt-0.5">
                    <CheckCircle2 className="h-4 w-4 text-primary" />
                  </div>
                  <span className="text-sm text-muted-foreground leading-relaxed">{highlight}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
        
        <Card className="border-2 border-border/40 bg-background/95 shadow-xl shadow-primary/5 backdrop-blur">
          <CardHeader className="space-y-3 text-center pb-6">
            <div className="flex justify-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <UserPlus className="h-6 w-6" />
              </div>
            </div>
            <div className="space-y-2">
              <CardTitle className="text-2xl font-bold">Crear tu cuenta</CardTitle>
              <CardDescription className="text-base">
                Completa tus datos y accede a todas las funciones de OnLinex.
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <RegisterForm onRegisterSuccess={handleRegisterSuccess} />
            
            <Separator />
            
            <div className="text-center">
              <p className="text-sm text-muted-foreground">
                ¿Ya tienes cuenta?{" "}
                <Link
                  to={`/login?redirect=${encodeURIComponent(redirectTo)}`}
                  className="font-medium text-primary hover:underline inline-flex items-center gap-1 group"
                >
                  Inicia sesión
                  <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  )
}

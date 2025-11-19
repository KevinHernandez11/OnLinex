import { useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useNavigate, useSearchParams, Link } from "react-router-dom"
import { User, Zap, MessageCircle, Users, Bot, ArrowRight, Timer, AlertCircle, Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { useSession } from "@/context/session-context"

const tempUserSchema = z.object({
  tempUsername: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
})

type TempUserValues = z.infer<typeof tempUserSchema>

const API_BASE_URL = import.meta.env.VITE_API_URL ?? ""

export function TempAccessPage() {
  const { session, setSession } = useSession()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const redirectTo = searchParams.get("redirect") ?? "/"

  const form = useForm<TempUserValues>({
    resolver: zodResolver(tempUserSchema),
    defaultValues: {
      tempUsername: "",
    },
  })

  useEffect(() => {
    if (session) {
      navigate(redirectTo, { replace: true })
    }
  }, [session, navigate, redirectTo])

  async function handleSubmit(values: TempUserValues) {
    form.clearErrors()

    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/login/temporal/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          temp_username: values.tempUsername,
        }),
      })

      const data = (await response.json().catch(() => null)) as
        | {
            temp_username?: string
            token?: string
            token_type?: string
            detail?: string
            message?: string
          }
        | null

      if (!response.ok) {
        const message =
          data?.detail ?? data?.message ?? "No pudimos generar tu usuario temporal. Intenta nuevamente."
        form.setError("root", { message })
        return
      }

      if (!data?.token) {
        form.setError("root", {
          message: data?.detail ?? "No recibimos el token temporal.",
        })
        return
      }

      const tokenType = data.token_type ?? "bearer"
      setSession({ token: data.token, tokenType })
      navigate(redirectTo, { replace: true })
    } catch (error) {
      console.error("Temp access error", error)
      form.setError("root", {
        message: "Ocurrió un error inesperado. Intenta más tarde.",
      })
    }
  }

  const features = [
    {
      Icon: Users,
      title: "Salas colaborativas",
      description: "Crear o unirte a salas existentes durante las próximas 6 horas.",
      color: "text-blue-500",
      bgColor: "bg-blue-50 dark:bg-blue-950/20",
    },
    {
      Icon: Bot,
      title: "IA integrada",
      description: "Conversar con la IA y probar las funciones colaborativas.",
      color: "text-purple-500",
      bgColor: "bg-purple-50 dark:bg-purple-950/20",
    },
    {
      Icon: Zap,
      title: "Conversión fácil",
      description: "Convertir tu acceso temporal en permanente cuando estés listo.",
      color: "text-green-500",
      bgColor: "bg-green-50 dark:bg-green-950/20",
    },
  ]

  return (
    <section className="flex h-full w-full items-center justify-center px-4 py-6">
      <div className="w-full max-w-6xl">
        {/* Header */}
        <div className="mb-8 text-center">
          <Badge variant="outline" className="mb-4 px-3 py-1 text-xs font-medium">
            <Timer className="mr-1 h-3 w-3" />
            Acceso temporal
          </Badge>
          
          <h1 className="mb-3 text-3xl font-bold tracking-tight sm:text-4xl">
            Obtén acceso por{" "}
            <span className="inline-flex items-center gap-1 text-primary">
              6 horas
            </span>
          </h1>
          <p className="mx-auto max-w-2xl text-base text-muted-foreground">
            Perfecto para invitados, demos o pruebas rápidas. Genera un acceso temporal y explora OnLinex.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.1fr_1fr]">
          {/* Form Card */}
          <Card className="border border-border/40 bg-card shadow-lg">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <User className="h-5 w-5" />
                </div>
                <div>
                  <CardTitle className="text-xl">Crear usuario temporal</CardTitle>
                  <CardDescription>
                    Elige un nombre único y comienza a explorar OnLinex al instante.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                  {form.formState.errors.root?.message ? (
                    <div className="rounded-lg border border-destructive/20 bg-destructive/10 p-3">
                      <div className="flex items-center gap-2">
                        <Badge variant="destructive" className="text-xs">
                          Error
                        </Badge>
                        <p className="text-sm text-destructive">{form.formState.errors.root.message}</p>
                      </div>
                    </div>
                  ) : null}
                  
                  <FormField
                    control={form.control}
                    name="tempUsername"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium">Nombre temporal</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                              placeholder="Ej. invitado-onlinex"
                              autoComplete="off"
                              className="pl-10 h-10"
                              {...field}
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <Button type="submit" className="w-full h-10" disabled={form.formState.isSubmitting}>
                    {form.formState.isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Generando acceso...
                      </>
                    ) : (
                      <>
                        <Zap className="mr-2 h-4 w-4" />
                        Obtener acceso temporal
                      </>
                    )}
                  </Button>
                </form>
              </Form>
              
              <Separator />
              
              <div className="text-center space-y-2">
                <p className="text-xs text-muted-foreground">
                  ¿Prefieres una cuenta permanente?
                </p>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" asChild className="flex-1">
                    <Link to="/login" className="inline-flex items-center gap-1 group">
                      Iniciar sesión
                      <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
                    </Link>
                  </Button>
                  <Button variant="outline" size="sm" asChild className="flex-1">
                    <Link to="/register" className="inline-flex items-center gap-1 group">
                      Registrarse
                      <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
                    </Link>
                  </Button>
                </div>
              </div>
          </CardContent>
        </Card>

          {/* Features Card */}
          <div className="space-y-4">
            <Card className="border border-border/40 bg-card shadow-lg">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <MessageCircle className="h-4 w-4" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">¿Qué incluye?</CardTitle>
                    <CardDescription className="text-sm">
                      Todas las funciones principales por 6 horas
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {features.map(({ Icon, title, description, color, bgColor }) => (
                  <div key={title} className="flex items-start gap-3 rounded-lg border border-border/60 bg-muted/30 p-3">
                    <div className={`flex h-6 w-6 items-center justify-center rounded-lg ${bgColor}`}>
                      <Icon className={`h-3 w-3 ${color}`} />
                    </div>
                    <div className="flex-1 space-y-1">
                      <h3 className="text-sm font-medium text-foreground">{title}</h3>
                      <p className="text-xs text-muted-foreground">{description}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="border border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/20">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900">
                    <AlertCircle className="h-3 w-3 text-amber-600 dark:text-amber-400" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-sm font-medium text-amber-800 dark:text-amber-200">Recordatorio importante</h3>
                    <p className="text-xs text-amber-700 dark:text-amber-300">
                      Tu acceso expirará automáticamente después de 6 horas. Si necesitas más tiempo, puedes generar un nuevo acceso temporal o crear una cuenta permanente.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  )
}

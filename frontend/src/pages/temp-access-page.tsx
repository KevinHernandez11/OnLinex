import { useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useNavigate, useSearchParams } from "react-router-dom"

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

  return (
    <section className="relative mx-auto flex w-full max-w-4xl flex-col gap-10 overflow-hidden rounded-3xl border bg-card/70 px-6 py-12 shadow-xl shadow-primary/10 sm:px-10 md:py-16">
      <div className="pointer-events-none absolute -top-24 left-1/3 h-72 w-72 -translate-x-1/2 rounded-full bg-primary/15 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-20 right-1/3 h-72 w-72 translate-x-1/2 rounded-full bg-sky-500/15 blur-3xl" />
      <div className="relative space-y-3 text-left">
        <span className="inline-flex w-fit items-center rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-primary">
          Acceso temporal
        </span>
        <h1 className="text-3xl font-semibold sm:text-4xl">Obtén un usuario por 6 horas</h1>
        <p className="max-w-2xl text-base text-muted-foreground sm:text-lg">
          Ideal para invitados o pruebas rápidas. Genera un acceso temporal, explora OnLinex y decide
          luego si deseas crear una cuenta permanente.
        </p>
      </div>
      <div className="relative grid gap-8 lg:grid-cols-[1fr_1fr]">
        <div className="rounded-2xl border border-border/70 bg-background/85 p-6 shadow-lg shadow-primary/5 backdrop-blur-sm sm:p-8">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
              {form.formState.errors.root?.message ? (
                <p className="rounded-md border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                  {form.formState.errors.root.message}
                </p>
              ) : null}
              <FormField
                control={form.control}
                name="tempUsername"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nombre temporal</FormLabel>
                    <FormControl>
                      <Input placeholder="Ej. invitado-onlinex" autoComplete="off" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? "Generando acceso..." : "Obtener acceso temporal"}
              </Button>
            </form>
          </Form>
        </div>
        <div className="rounded-2xl border border-border/60 bg-background/80 p-6 shadow-lg shadow-primary/5 backdrop-blur-sm sm:p-8">
          <h2 className="text-xl font-semibold">¿Qué puedo hacer con un usuario temporal?</h2>
          <ul className="mt-4 space-y-3 text-sm text-muted-foreground">
            <li className="rounded-lg border border-border/60 bg-muted/40 px-4 py-3">
              Crear o unirte a salas existentes durante las próximas 6 horas.
            </li>
            <li className="rounded-lg border border-border/60 bg-muted/40 px-4 py-3">
              Conversar con la IA y probar las funciones colaborativas.
            </li>
            <li className="rounded-lg border border-border/60 bg-muted/40 px-4 py-3">
              Convertir tu acceso temporal en permanente cuando estés listo.
            </li>
          </ul>
          <p className="mt-6 text-sm text-muted-foreground">
            Recuerda que el token expirará automáticamente. Si necesitas más tiempo, puedes generar
            un nuevo usuario temporal o crear una cuenta completa.
          </p>
        </div>
      </div>
    </section>
  )
}

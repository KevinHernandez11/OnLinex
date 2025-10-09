import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useNavigate } from "react-router-dom"

import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { useSession } from "@/context/session-context"
import { useRequireSession } from "@/hooks/use-require-session"

const joinRoomSchema = z.object({
  code: z.string().min(1, "El codigo de la sala es obligatorio"),
})

type JoinRoomValues = z.infer<typeof joinRoomSchema>

const API_BASE_URL = import.meta.env.VITE_API_URL ?? ""

export function JoinRoomPage() {
  const { session, isLoading } = useRequireSession()
  const { clearSession } = useSession()
  const navigate = useNavigate()

  const form = useForm<JoinRoomValues>({
    resolver: zodResolver(joinRoomSchema),
    defaultValues: { code: "" },
  })

  if (isLoading) {
    return (
      <section className="flex flex-1 items-center justify-center">
        <p className="text-muted-foreground">Preparando acceso...</p>
      </section>
    )
  }

  if (!session) {
    return null
  }

  async function handleSubmit(values: JoinRoomValues) {
    if (!session) {
      form.setError("root", {
        message: "Tu sesion expiro. Inicia sesion nuevamente.",
      })
      return
    }

    form.clearErrors()

    try {
      const url = new URL(`${API_BASE_URL}/api/v1/rooms/join`)
      url.searchParams.set("room_code", values.code)

      const response = await fetch(url.toString(), {
        method: "GET",
        headers: {
          Authorization: `${session.tokenType} ${session.token}`,
        },
      })

      const data = (await response.json().catch(() => null)) as
        | { message?: string; detail?: string }
        | null

      if (response.status === 401) {
        clearSession()
        navigate(`/login?redirect=${encodeURIComponent("/rooms/join")}`, { replace: true })
        return
      }

      if (!response.ok) {
        const message = data?.detail ?? data?.message ?? "No pudimos unirte a la sala."
        form.setError("root", { message })
        return
      }

      navigate(`/rooms/${values.code}`)
    } catch (error) {
      console.error("Join room error", error)
      form.setError("root", {
        message: "Ocurrio un error inesperado. Intenta mas tarde.",
      })
    }
  }

  return (
    <section className="relative mx-auto flex w-full max-w-6xl flex-col gap-12 overflow-hidden rounded-3xl border bg-card/70 px-6 py-12 shadow-xl shadow-primary/10 sm:px-10 md:py-16">
      <div className="pointer-events-none absolute -top-24 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-primary/15 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 right-1/2 h-72 w-72 translate-x-1/2 rounded-full bg-sky-500/15 blur-3xl" />

      <div className="relative space-y-3 text-left">
        <span className="inline-flex w-fit items-center rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-primary">
          Unite a la conversacion
        </span>
        <h1 className="text-3xl font-semibold sm:text-4xl">Ingresa a una sala existente</h1>
        <p className="max-w-3xl text-base text-muted-foreground sm:text-lg">
          Introduce el codigo que recibiste para conectarte con tu equipo y retomar la charla sin
          perder ningun detalle.
        </p>
      </div>

      <div className="relative grid gap-10 lg:grid-cols-[0.9fr_1.1fr]">
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
                name="code"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Codigo de la sala</FormLabel>
                    <FormControl>
                      <Input placeholder="Ej. ABC-123" autoComplete="off" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? "Uniendote..." : "Unirme a la sala"}
              </Button>
            </form>
          </Form>
        </div>

        <div className="rounded-2xl border border-border/60 bg-background/80 p-6 shadow-lg shadow-primary/5 backdrop-blur-sm sm:p-8">
          <div className="space-y-2">
            <h2 className="text-xl font-semibold">Nuevo flujo de sala</h2>
            <p className="text-sm text-muted-foreground">
              Al validar tu codigo te llevaremos al espacio de sala, donde el chat ocupa la mayor parte
              de la pantalla para que la conversacion fluya sin limites.
            </p>
          </div>
          <ul className="mt-6 space-y-3 text-sm text-muted-foreground">
            <li className="rounded-lg border border-border/60 bg-muted/40 px-4 py-3">
              Confirma con tu anfitrion que tienes los permisos necesarios para ingresar.
            </li>
            <li className="rounded-lg border border-border/60 bg-muted/40 px-4 py-3">
              Una vez dentro, comparte ideas, archivos o acuerdos directamente en el chat ampliado.
            </li>
            <li className="rounded-lg border border-border/60 bg-muted/40 px-4 py-3">
              Si necesitas crear tu propia sala, puedes hacerlo desde el nuevo espacio en un solo clic.
            </li>
          </ul>
        </div>
      </div>
    </section>
  )
}

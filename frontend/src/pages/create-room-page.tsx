import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useNavigate } from "react-router-dom"

import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { useSession } from "@/context/session-context"
import { useRequireSession } from "@/hooks/use-require-session"

const createRoomSchema = z.object({
  name: z.string().min(1, "El nombre de la sala es obligatorio"),
  capacity: z.string().min(1, "La capacidad es obligatoria"),
  language: z.string().min(1, "El lenguaje es obligatorio"),
  isPublic: z.boolean(),
})

type CreateRoomValues = z.infer<typeof createRoomSchema>

const API_BASE_URL = import.meta.env.VITE_API_URL ?? ""

export function CreateRoomPage() {
  const { session, isLoading } = useRequireSession()
  const { clearSession } = useSession()
  const navigate = useNavigate()

  const form = useForm<CreateRoomValues>({
    resolver: zodResolver(createRoomSchema),
    defaultValues: {
      name: "",
      capacity: "4",
      language: "",
      isPublic: true,
    },
  })

  if (isLoading) {
    return (
      <section className="flex flex-1 items-center justify-center">
        <p className="text-muted-foreground">Cargando...</p>
      </section>
    )
  }

  if (!session) {
    return null
  }

  async function handleSubmit(values: CreateRoomValues) {
    if (!session) {
      form.setError("root", {
        message: "Tu sesion expiro. Inicia sesion nuevamente.",
      })
      return
    }

    form.clearErrors()

    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/rooms`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `${session.tokenType} ${session.token}`,
        },
        body: JSON.stringify({
          name: values.name,
          capacity: Number(values.capacity),
          language: values.language,
          is_public: values.isPublic,
        }),
      })

      const data = (await response.json().catch(() => null)) as
        | { code?: string; detail?: string; message?: string }
        | null

      if (response.status === 401) {
        clearSession()
        navigate(`/login?redirect=${encodeURIComponent("/rooms/create")}`, { replace: true })
        return
      }

      if (!response.ok) {
        const message =
          data?.detail ?? data?.message ?? "No pudimos crear la sala. Intenta nuevamente."
        form.setError("root", { message })
        return
      }

      if (!data?.code) {
        form.setError("root", { message: "No recibimos el codigo de la sala." })
        return
      }

      form.reset({
        name: "",
        capacity: "4",
        language: "",
        isPublic: true,
      })

      navigate(`/rooms/${data.code}`)
    } catch (error) {
      console.error("Create room error", error)
      form.setError("root", {
        message: "Ocurrio un error inesperado. Intenta mas tarde.",
      })
    }
  }

  return (
    <div className="flex flex-1 items-center justify-center">
      <section className="relative w-full max-w-3xl space-y-12 overflow-hidden rounded-3xl border bg-card/70 px-6 py-10 shadow-xl shadow-primary/10 sm:px-8">
        <div className="space-y-3 text-center">
          <h1 className="text-3xl font-semibold sm:text-4xl">Crea una sala colaborativa</h1>
          <p className="mx-auto max-w-2xl text-base text-muted-foreground sm:text-lg">
            Personaliza los detalles de tu sala, invita participantes y manten una conversacion fluida
            con los asistentes de OnLinex.
          </p>
        </div>

        <div className="relative mx-auto w-full max-w-md">
          <div className="rounded-2xl border border-border/70 bg-background/85 p-6 text-left shadow-lg shadow-primary/5 backdrop-blur-sm sm:p-7">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
                {form.formState.errors.root?.message ? (
                  <p className="rounded-md border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                    {form.formState.errors.root.message}
                  </p>
                ) : null}
                <div className="grid gap-4 sm:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nombre de la sala</FormLabel>
                        <FormControl>
                          <Input placeholder="Ej. Sala de soporte" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="capacity"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Capacidad</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min={1}
                            placeholder="Cantidad de participantes"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={form.control}
                  name="language"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Idioma principal</FormLabel>
                      <FormControl>
                        <select
                          value={field.value}
                          onChange={(event) => field.onChange(event.target.value)}
                          className="flex h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm transition focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          <option value="" disabled>
                            Selecciona un idioma
                          </option>
                          <option value="es">Espanol</option>
                          <option value="en">Ingles</option>
                          <option value="fr">Frances</option>
                        </select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="isPublic"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Visibilidad</FormLabel>
                      <FormControl>
                        <div className="grid gap-2 sm:grid-cols-2">
                          <button
                            type="button"
                            onClick={() => field.onChange(true)}
                            className={`rounded-lg border px-3 py-4 text-xs font-semibold uppercase tracking-wide transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 ${
                              field.value
                                ? "border-primary bg-primary/10 text-primary shadow-sm shadow-primary/20"
                                : "border-border/70 bg-background/80 text-muted-foreground hover:border-primary/40"
                            }`}
                          >
                            Publica
                          </button>
                          <button
                            type="button"
                            onClick={() => field.onChange(false)}
                            className={`rounded-lg border px-3 py-4 text-xs font-semibold uppercase tracking-wide transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 ${
                              field.value === false
                                ? "border-primary bg-primary/10 text-primary shadow-sm shadow-primary/20"
                                : "border-border/70 bg-background/80 text-muted-foreground hover:border-primary/40"
                            }`}
                          >
                            Privada
                          </button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
                  {form.formState.isSubmitting ? "Creando sala..." : "Crear sala"}
                </Button>
              </form>
            </Form>
          </div>
        </div>
      </section>
    </div>
  )
}

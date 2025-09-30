import { useState } from "react"
import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormDescription,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { RoomChat } from "@/components/rooms/room-chat"

const createRoomSchema = z.object({
  name: z.string().min(1, "El nombre de la sala es obligatorio"),
  capacity: z.string().min(1, "La capacidad es obligatoria"),
  language: z.string().min(1, "El lenguaje es obligatorio"),
  isPublic: z.boolean(),
})

const joinRoomSchema = z.object({
  code: z.string().min(1, "El codigo de la sala es obligatorio"),
})

type CreateRoomValues = z.infer<typeof createRoomSchema>
type JoinRoomValues = z.infer<typeof joinRoomSchema>

const API_BASE_URL = import.meta.env.VITE_API_URL ?? ""

interface RoomsDashboardProps {
  accessToken: string
  tokenType: string
  onLogout?: () => void
}

export function RoomsDashboard({ accessToken, tokenType, onLogout }: RoomsDashboardProps) {
  const [createdRoomCode, setCreatedRoomCode] = useState<string | null>(null)
  const [joinMessage, setJoinMessage] = useState<string | null>(null)
  const [activeRoomCode, setActiveRoomCode] = useState<string | null>(null)

  const createRoomForm = useForm<CreateRoomValues>({
    resolver: zodResolver(createRoomSchema),
    defaultValues: {
      name: "",
      capacity: "4",
      language: "",
      isPublic: true,
    },
  })

  const joinRoomForm = useForm<JoinRoomValues>({
    resolver: zodResolver(joinRoomSchema),
    defaultValues: {
      code: "",
    },
  })

  async function handleCreateRoom(values: CreateRoomValues) {
    setCreatedRoomCode(null)
    setJoinMessage(null)
    createRoomForm.clearErrors()

    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/rooms`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `${tokenType} ${accessToken}`,
        },
        body: JSON.stringify({
          name: values.name,
          capacity: Number(values.capacity),
          language: values.language,
          is_public: values.isPublic,
        }),
      })

      const data = (await response.json().catch(() => null)) as
        | { code?: string; name?: string; detail?: string; message?: string }
        | null

      if (response.status === 401) {
        createRoomForm.setError("root", {
          message: "Tu sesion expiro. Vuelve a iniciar sesion.",
        })
        onLogout?.()
        return
      }

      if (!response.ok) {
        const message =
          data?.detail ?? data?.message ?? "No pudimos crear la sala. Intenta nuevamente."
        createRoomForm.setError("root", { message })
        return
      }

      if (!data?.code) {
        createRoomForm.setError("root", {
          message: data?.detail ?? "No recibimos el codigo de la sala.",
        })
        return
      }

      setCreatedRoomCode(data.code)
      setActiveRoomCode(data.code)
      createRoomForm.reset({ name: "", capacity: "4", language: "", isPublic: true })
    } catch (error) {
      createRoomForm.setError("root", {
        message: "Ocurrio un error inesperado. Intenta mas tarde.",
      })
      console.error("Create room error", error)
    }
  }

  async function handleJoinRoom(values: JoinRoomValues) {
    setJoinMessage(null)
    joinRoomForm.clearErrors()

    try {
      const url = new URL(`${API_BASE_URL}/api/v1/rooms/join`)
      url.searchParams.set("room_code", values.code)

      const response = await fetch(url.toString(), {
        method: "GET",
        headers: {
          Authorization: `${tokenType} ${accessToken}`,
        },
      })

      const data = (await response.json().catch(() => null)) as
        | { message?: string; detail?: string }
        | null

      if (response.status === 401) {
        joinRoomForm.setError("root", {
          message: "Tu sesion expiro. Vuelve a iniciar sesion.",
        })
        onLogout?.()
        return
      }

      if (!response.ok) {
        const message = data?.detail ?? data?.message ?? "No pudimos unirte a la sala."
        joinRoomForm.setError("root", { message })
        return
      }

      const successMessage = data?.message ?? "Te uniste a la sala correctamente."
      setJoinMessage(successMessage)
      setActiveRoomCode(values.code)
      joinRoomForm.reset({ code: "" })
    } catch (error) {
      joinRoomForm.setError("root", {
        message: "Ocurrio un error inesperado. Intenta mas tarde.",
      })
      console.error("Join room error", error)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto flex min-h-screen max-w-5xl flex-col gap-10 px-4 py-10">
        <header className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-semibold">Bienvenido a OnLinex</h1>
            <p className="text-muted-foreground">
              Gestiona tus salas: crea una nueva o unete con un codigo existente.
            </p>
          </div>
          {onLogout ? (
            <Button variant="outline" onClick={onLogout}>
              Cerrar sesion
            </Button>
          ) : null}
        </header>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <Card className="h-full">
            <CardHeader>
              <CardTitle>Crear sala</CardTitle>
              <CardDescription>
                Define los detalles y comparte el codigo generado con tu equipo.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...createRoomForm}>
                <form onSubmit={createRoomForm.handleSubmit(handleCreateRoom)} className="space-y-6">
                  {createRoomForm.formState.errors.root?.message ? (
                    <p className="text-sm text-destructive">
                      {createRoomForm.formState.errors.root.message}
                    </p>
                  ) : null}
                  {createdRoomCode ? (
                    <div className="rounded-md border border-green-200 bg-green-50 p-4 text-sm text-green-700">
                      Sala creada exitosamente. Codigo: <span className="font-semibold">{createdRoomCode}</span>
                    </div>
                  ) : null}
                  <FormField
                    control={createRoomForm.control}
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
                    control={createRoomForm.control}
                    name="capacity"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Capacidad</FormLabel>
                        <FormControl>
                          <Input type="number" min={1} placeholder="Cantidad de participantes" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={createRoomForm.control}
                    name="language"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Lenguaje</FormLabel>
                        <FormControl>
                          <Input placeholder="Ej. Espanol" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={createRoomForm.control}
                    name="isPublic"
                    render={({ field }) => (
                      <FormItem className="flex items-center justify-between rounded-md border p-3">
                        <div className="space-y-0.5">
                          <FormLabel className="text-sm font-medium leading-none">
                            Sala publica
                          </FormLabel>
                          <FormDescription>
                            Permite que cualquiera con el codigo se una.
                          </FormDescription>
                        </div>
                        <FormControl>
                          <input
                            type="checkbox"
                            className="h-4 w-4"
                            checked={field.value}
                            onChange={(event) => field.onChange(event.target.checked)}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <Button type="submit" className="w-full" disabled={createRoomForm.formState.isSubmitting}>
                    {createRoomForm.formState.isSubmitting ? "Creando sala..." : "Crear sala"}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
          <Card className="h-full">
            <CardHeader>
              <CardTitle>Unirme a una sala</CardTitle>
              <CardDescription>
                Ingresa el codigo que te compartieron para entrar a la sala.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...joinRoomForm}>
                <form onSubmit={joinRoomForm.handleSubmit(handleJoinRoom)} className="space-y-6">
                  {joinRoomForm.formState.errors.root?.message ? (
                    <p className="text-sm text-destructive">
                      {joinRoomForm.formState.errors.root.message}
                    </p>
                  ) : null}
                  {joinMessage ? (
                    <div className="rounded-md border border-green-200 bg-green-50 p-4 text-sm text-green-700">
                      {joinMessage}
                    </div>
                  ) : null}
                  <FormField
                    control={joinRoomForm.control}
                    name="code"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Codigo de la sala</FormLabel>
                        <FormControl>
                          <Input placeholder="Ingresa el codigo" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" className="w-full" disabled={joinRoomForm.formState.isSubmitting}>
                    {joinRoomForm.formState.isSubmitting ? "Uniendote..." : "Unirme"}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
        {activeRoomCode ? (
          <RoomChat roomCode={activeRoomCode} accessToken={accessToken} tokenType={tokenType} />
        ) : null}
      </div>
    </div>
  )
}





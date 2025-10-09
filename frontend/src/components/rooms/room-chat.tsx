import { useEffect, useRef, useState } from "react"
import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"

import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { resolveWsBaseUrl } from "@/lib/ws-url"

const messageSchema = z.object({
  content: z.string().min(1, "Escribe un mensaje"),
})

type MessageFormValues = z.infer<typeof messageSchema>

interface RoomChatProps {
  roomCode: string
  accessToken: string
  tokenType: string
  className?: string
}

interface ChatMessage {
  id: string
  text: string
}

export function RoomChat({ roomCode, accessToken, tokenType, className }: RoomChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [connectionError, setConnectionError] = useState<string | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const form = useForm<MessageFormValues>({
    resolver: zodResolver(messageSchema),
    defaultValues: { content: "" },
  })
  const wsRef = useRef<WebSocket | null>(null)
  const messagesEndRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const baseUrl = resolveWsBaseUrl()
    if (!baseUrl) {
      setConnectionError("No se encontro la ruta para el chat. Configura VITE_WS_URL.")
      return
    }

    const url = new URL(`${baseUrl}/ws/chat/${roomCode}`)
    url.searchParams.set("token", accessToken)
    url.searchParams.set("token_type", tokenType)

    const ws = new WebSocket(url.toString())
    wsRef.current = ws

    ws.onopen = () => {
      setIsConnected(true)
      setConnectionError(null)
    }

    ws.onmessage = (event) => {
      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          text: event.data,
        },
      ])
    }

    ws.onerror = () => {
      setConnectionError("No pudimos conectar con el chat. Revisa tu conexion o intenta de nuevo.")
    }

    ws.onclose = (event) => {
      setIsConnected(false)
      if (event.code === 1008) {
        setConnectionError("Tu sesion expiro o no tienes permisos para esta sala.")
      } else {
        setConnectionError("La conexion con el chat se cerro.")
      }
    }

    return () => {
      ws.close()
      wsRef.current = null
    }
  }, [roomCode, accessToken, tokenType])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  async function handleSendMessage(values: MessageFormValues) {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
      setConnectionError("La conexion esta cerrada. Intenta recargar la pagina.")
      return
    }

    wsRef.current.send(values.content)
    form.reset({ content: "" })
  }

  const {
    handleSubmit,
    control,
    formState: { isSubmitting },
  } = form

  return (
    <div
      className={cn(
        "flex h-full min-h-[28rem] flex-col overflow-hidden rounded-3xl border border-border/60 bg-background/95 shadow-xl shadow-primary/10 backdrop-blur-sm",
        className,
      )}
    >
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border/60 bg-muted/30 px-6 py-4">
        <div className="space-y-1">
          <h2 className="text-lg font-semibold tracking-tight">Sala {roomCode}</h2>
          <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
            <span
              className={cn(
                "h-2.5 w-2.5 rounded-full transition-colors",
                isConnected ? "bg-emerald-500 animate-pulse" : "bg-rose-500",
              )}
            />
            <span>{isConnected ? "Conectado al chat" : "Desconectado"}</span>
          </div>
        </div>
        <span className="rounded-full border border-border/60 bg-background/80 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          OnLinex Rooms
        </span>
      </div>

      <div className="flex flex-1 flex-col">
        <div className="flex-1 space-y-3 overflow-y-auto bg-gradient-to-br from-muted/20 via-background to-muted/30 px-6 py-6">
          {messages.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-border/60 bg-background/80 px-4 py-6 text-center text-sm text-muted-foreground">
              Aun no hay mensajes. Comparte el codigo de la sala y comienza la conversacion.
            </div>
          ) : (
            messages.map((message) => (
              <div
                key={message.id}
                className="w-fit max-w-[80%] rounded-2xl border border-border/50 bg-background/95 px-4 py-2 text-sm shadow-sm shadow-primary/5"
              >
                {message.text}
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        {connectionError ? (
          <div className="border-t border-border/60 bg-destructive/10 px-6 py-3 text-sm text-destructive">
            {connectionError}
          </div>
        ) : null}

        <div className="border-t border-border/60 bg-background/90 px-6 py-4">
          <Form {...form}>
            <form
              onSubmit={handleSubmit(handleSendMessage)}
              className="flex flex-col gap-3 sm:flex-row sm:items-center"
            >
              <FormField
                control={control}
                name="content"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormControl>
                      <Input
                        placeholder="Comparte una actualizacion"
                        autoComplete="off"
                        {...field}
                        disabled={!isConnected}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button
                type="submit"
                disabled={!isConnected || isSubmitting}
                className="w-full sm:w-auto"
              >
                Enviar
              </Button>
            </form>
          </Form>
        </div>
      </div>
    </div>
  )
}


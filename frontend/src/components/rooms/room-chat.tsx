import { useEffect, useRef, useState } from "react"
import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"

import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { resolveWsBaseUrl } from "@/lib/ws-url"

const messageSchema = z.object({
  content: z.string().min(1, "Escribe un mensaje"),
})

type MessageFormValues = z.infer<typeof messageSchema>

interface RoomChatProps {
  roomCode: string
  accessToken: string
  tokenType: string
}

interface ChatMessage {
  id: string
  text: string
}

export function RoomChat({ roomCode, accessToken, tokenType }: RoomChatProps) {
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
    <div className="space-y-4">
      <div className="rounded-lg border bg-card">
        <div className="border-b p-4">
          <h2 className="text-lg font-semibold">Sala {roomCode}</h2>
          <p className="text-sm text-muted-foreground">
            Estado: {isConnected ? "Conectado" : "Desconectado"}
          </p>
        </div>
        <div className="flex h-80 flex-col justify-between">
          <div className="h-full space-y-2 overflow-y-auto p-4">
            {messages.map((message) => (
              <div key={message.id} className="rounded-md bg-muted px-3 py-2 text-sm">
                {message.text}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
          {connectionError ? (
            <div className="border-t px-4 py-2 text-sm text-destructive">
              {connectionError}
            </div>
          ) : null}
          <div className="border-t p-4">
            <Form {...form}>
              <form onSubmit={handleSubmit(handleSendMessage)} className="flex gap-2">
                <FormField
                  control={control}
                  name="content"
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormControl>
                        <Input
                          placeholder="Escribe tu mensaje"
                          autoComplete="off"
                          {...field}
                          disabled={!isConnected}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" disabled={!isConnected || isSubmitting}>
                  Enviar
                </Button>
              </form>
            </Form>
          </div>
        </div>
      </div>
    </div>
  )
}


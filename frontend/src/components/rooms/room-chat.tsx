import { useEffect, useRef, useState } from "react"
import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Send, Wifi, WifiOff, MessageCircle, Users, AlertCircle } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
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
  timestamp?: Date
  sender?: string
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
          timestamp: new Date(),
          sender: "Usuario", // This could be enhanced to show actual sender
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
        "flex min-h-[28rem] flex-col rounded-3xl border border-border/40 bg-background/95 shadow-2xl shadow-primary/10 backdrop-blur-sm",
        className,
      )}
    >
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border/40 bg-gradient-to-r from-muted/20 to-muted/30 px-6 py-5">
        <div className="flex items-center gap-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <MessageCircle className="h-5 w-5" />
          </div>
          <div className="space-y-1">
            <h2 className="text-lg font-semibold tracking-tight">Sala {roomCode}</h2>
            <div className="flex items-center gap-2">
              <Badge variant={isConnected ? "default" : "destructive"} className="text-xs">
                {isConnected ? (
                  <>
                    <Wifi className="mr-1 h-3 w-3" />
                    Conectado
                  </>
                ) : (
                  <>
                    <WifiOff className="mr-1 h-3 w-3" />
                    Desconectado
                  </>
                )}
              </Badge>
              <Badge variant="outline" className="text-xs">
                <Users className="mr-1 h-3 w-3" />
                OnLinex Rooms
              </Badge>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-1 flex-col">
        <div className="flex-1 space-y-4 overflow-y-auto bg-gradient-to-br from-muted/10 via-background to-muted/20 px-6 py-6">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center space-y-4 py-12">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-muted/50">
                <MessageCircle className="h-8 w-8 text-muted-foreground" />
              </div>
              <div className="text-center space-y-2">
                <h3 className="font-medium text-foreground">¡Comienza la conversación!</h3>
                <p className="text-sm text-muted-foreground max-w-sm">
                  Aún no hay mensajes. Comparte el código de la sala y comienza la conversación.
                </p>
              </div>
            </div>
          ) : (
            messages.map((message, index) => (
              <div key={message.id} className="group flex items-start gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-medium">
                  {message.sender?.charAt(0) || "U"}
                </div>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-foreground">
                      {message.sender || "Usuario"}
                    </span>
                    {message.timestamp && (
                      <span className="text-xs text-muted-foreground">
                        {message.timestamp.toLocaleTimeString([], { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </span>
                    )}
                  </div>
                  <div className="rounded-2xl bg-muted/50 px-4 py-2.5 text-sm text-foreground shadow-sm">
                    {message.text}
                  </div>
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        {connectionError ? (
          <div className="border-t border-border/40 bg-destructive/10 px-6 py-4">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-destructive" />
              <p className="text-sm text-destructive">{connectionError}</p>
            </div>
          </div>
        ) : null}

        <Separator />
        
        <div className="bg-background/95 px-6 py-4">
          <Form {...form}>
            <form
              onSubmit={handleSubmit(handleSendMessage)}
              className="flex items-center gap-3"
            >
              <FormField
                control={control}
                name="content"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormControl>
                      <div className="relative">
                        <Input
                          placeholder={isConnected ? "Escribe tu mensaje..." : "Conectando..."}
                          autoComplete="off"
                          disabled={!isConnected}
                          className="pr-12 h-11 bg-muted/50 border-border/40 focus:bg-background transition-colors"
                          {...field}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button
                type="submit"
                disabled={!isConnected || isSubmitting || !form.watch("content")?.trim()}
                size="icon"
                className="h-11 w-11 shrink-0"
              >
                <Send className="h-4 w-4" />
                <span className="sr-only">Enviar mensaje</span>
              </Button>
            </form>
          </Form>
        </div>
      </div>
    </div>
  )
}


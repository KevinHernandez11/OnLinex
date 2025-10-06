import { useEffect, useRef, useState } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { resolveWsBaseUrl } from "@/lib/ws-url"

const conversationSchema = z.object({
  agentName: z.string().min(1, "El nombre del agente es obligatorio"),
})

const messageSchema = z.object({
  content: z.string().min(1, "Escribe un mensaje"),
})

type ConversationFormValues = z.infer<typeof conversationSchema>
type MessageFormValues = z.infer<typeof messageSchema>

const API_BASE_URL = import.meta.env.VITE_API_URL ?? ""

interface AiChatProps {
  accessToken: string
  tokenType: string
  defaultAgentName?: string
  onUnauthorized?: () => void
}

type ChatMessage = {
  id: string
  role: "user" | "assistant"
  text: string
}

export function AiChat({
  accessToken,
  tokenType,
  defaultAgentName = "main",
  onUnauthorized,
}: AiChatProps) {
  const [conversationId, setConversationId] = useState<string | null>(null)
  const [connectionError, setConnectionError] = useState<string | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [isConnecting, setIsConnecting] = useState(false)
  const [activeAgentName, setActiveAgentName] = useState<string | null>(
    defaultAgentName ? defaultAgentName : null
  )
  const [messages, setMessages] = useState<ChatMessage[]>([])

  const wsRef = useRef<WebSocket | null>(null)
  const messagesEndRef = useRef<HTMLDivElement | null>(null)

  const conversationForm = useForm<ConversationFormValues>({
    resolver: zodResolver(conversationSchema),
    defaultValues: { agentName: defaultAgentName },
  })

  const messageForm = useForm<MessageFormValues>({
    resolver: zodResolver(messageSchema),
    defaultValues: { content: "" },
  })

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  useEffect(() => {
    if (!conversationId) {
      return
    }

    const baseUrl = resolveWsBaseUrl()
    if (!baseUrl) {
      setConnectionError("No se encontro la ruta para el chat. Configura VITE_WS_URL.")
      setIsConnecting(false)
      setIsConnected(false)
      return
    }

    setIsConnecting(true)
    setConnectionError(null)

    const url = new URL(`${baseUrl}/ai/ws/chat/${conversationId}`)
    url.searchParams.set("token", accessToken)
    url.searchParams.set("token_type", tokenType)

    const ws = new WebSocket(url.toString())
    wsRef.current = ws

    ws.onopen = () => {
      setIsConnecting(false)
      setIsConnected(true)
      setConnectionError(null)
    }

    ws.onmessage = (event) => {
      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          text: event.data,
        },
      ])
    }

    ws.onerror = () => {
      setConnectionError("No pudimos conectar con la IA. Intenta nuevamente.")
    }

    ws.onclose = (event) => {
      setIsConnecting(false)
      setIsConnected(false)
      if (event.code === 1008) {
        setConnectionError("Tu sesion expiro o no tienes permisos para este chat.")
        onUnauthorized?.()
      } else {
        setConnectionError("La conexion con la IA se cerro.")
      }
    }

    return () => {
      ws.close()
      wsRef.current = null
    }
  }, [conversationId, accessToken, tokenType, onUnauthorized])

  async function handleStartConversation(values: ConversationFormValues) {
    conversationForm.clearErrors()
    setConnectionError(null)

    if (!API_BASE_URL) {
      conversationForm.setError("root", {
        message: "Configura VITE_API_URL para iniciar una conversacion.",
      })
      return
    }

    try {
      const url = new URL(`${API_BASE_URL}/api/v1/conversations`)
      url.searchParams.set("agent_name", values.agentName)

      const response = await fetch(url.toString(), {
        method: "POST",
        headers: {
          Authorization: `${tokenType} ${accessToken}`,
        },
      })

      const data = (await response.json().catch(() => null)) as
        | { conversation_id?: string; detail?: string; message?: string }
        | null

      if (response.status === 401) {
        conversationForm.setError("root", {
          message: "Tu sesion expiro. Vuelve a iniciar sesion.",
        })
        onUnauthorized?.()
        return
      }

      if (!response.ok) {
        const message =
          data?.detail ?? data?.message ?? "No pudimos iniciar la conversacion."
        conversationForm.setError("root", { message })
        return
      }

      if (!data?.conversation_id) {
        conversationForm.setError("root", {
          message: "No recibimos el identificador de la conversacion.",
        })
        return
      }

      setConversationId(data.conversation_id)
      setActiveAgentName(values.agentName)
      setMessages([])
      messageForm.reset({ content: "" })
    } catch (error) {
      console.error("Start conversation error", error)
      conversationForm.setError("root", {
        message: "Ocurrio un error inesperado. Intenta mas tarde.",
      })
    }
  }

  async function handleSendMessage(values: MessageFormValues) {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
      setConnectionError("La conexion esta cerrada. Intenta reiniciar la conversacion.")
      return
    }

    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: "user",
      text: values.content,
    }

    setMessages((prev) => [...prev, userMessage])
    wsRef.current.send(values.content)
    messageForm.reset({ content: "" })
  }

  const {
    handleSubmit: handleConversationSubmit,
    control: conversationControl,
    formState: { isSubmitting: isCreatingConversation },
  } = conversationForm

  const {
    handleSubmit: handleMessageSubmit,
    control: messageControl,
    formState: { isSubmitting: isSendingMessage },
  } = messageForm

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Hablar con la IA</CardTitle>
          <CardDescription>
            Crea o reutiliza una conversacion con tu agente preferido.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...conversationForm}>
            <form
              onSubmit={handleConversationSubmit(handleStartConversation)}
              className="space-y-4"
            >
              {conversationForm.formState.errors.root?.message ? (
                <p className="text-sm text-destructive">
                  {conversationForm.formState.errors.root.message}
                </p>
              ) : null}
              <FormField
                control={conversationControl}
                name="agentName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nombre del agente</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Ej. main"
                        autoComplete="off"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button
                type="submit"
                className="w-full"
                disabled={isCreatingConversation}
              >
                {isCreatingConversation ? "Conectando..." : "Iniciar conversacion"}
              </Button>
            </form>
          </Form>
          {conversationId ? (
            <div className="mt-4 rounded-md border border-green-200 bg-green-50 p-4 text-sm text-green-700">
              Conversacion lista {activeAgentName ? `con ${activeAgentName}` : ""}. ID:
              <span className="ml-1 font-semibold">{conversationId}</span>
            </div>
          ) : null}
        </CardContent>
      </Card>

      {conversationId ? (
        <Card className="h-full">
          <CardHeader>
            <CardTitle>Chat con la IA</CardTitle>
            <CardDescription>
              Estado: {isConnected ? "Conectado" : isConnecting ? "Conectando..." : "Desconectado"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex h-80 flex-col justify-between rounded-md border">
              <div className="flex-1 space-y-2 overflow-y-auto p-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={message.role === "user" ? "text-right" : "text-left"}
                  >
                    <div
                      className={`inline-block max-w-[85%] rounded-md px-3 py-2 text-sm ${
                        message.role === "user"
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted"
                      }`}
                    >
                      {message.text}
                    </div>
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
                <Form {...messageForm}>
                  <form
                    onSubmit={handleMessageSubmit(handleSendMessage)}
                    className="flex gap-2"
                  >
                    <FormField
                      control={messageControl}
                      name="content"
                      render={({ field }) => (
                        <FormItem className="flex-1">
                          <FormControl>
                            <Input
                              placeholder="Escribe tu mensaje"
                              autoComplete="off"
                              disabled={!isConnected || isConnecting}
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button
                      type="submit"
                      disabled={!isConnected || isConnecting || isSendingMessage}
                    >
                      Enviar
                    </Button>
                  </form>
                </Form>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : null}
    </div>
  )
}


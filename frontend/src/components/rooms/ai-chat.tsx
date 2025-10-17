import { useEffect, useRef, useState } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import {
  Bot,
  Send,
  Wifi,
  WifiOff,
  Loader2,
  Sparkles,
  MessageCircle,
  AlertCircle,
  Flame,
  Crosshair,
  Swords,
  type LucideIcon,
} from "lucide-react"

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
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"
import { resolveWsBaseUrl } from "@/lib/ws-url"

const AVAILABLE_PROFILES = ["default", "dante", "lady", "vergil"] as const
type ProfileId = (typeof AVAILABLE_PROFILES)[number]

const PROFILE_DETAILS: Record<ProfileId, { label: string; description: string; icon: LucideIcon }> =
  {
    default: {
      label: "Default",
      description: "Equilibrado para todo tipo de solicitudes.",
      icon: Sparkles,
    },
    dante: {
      label: "Dante",
      description: "Creativo con tono entusiasta.",
      icon: Flame,
    },
    lady: {
      label: "Lady",
      description: "Directo y practico en las respuestas.",
      icon: Crosshair,
    },
    vergil: {
      label: "Vergil",
      description: "Analitico y estructurado.",
      icon: Swords,
    },
  }

const DEFAULT_PROFILE_ID: ProfileId = AVAILABLE_PROFILES[0]

function isProfileId(value: string | null | undefined): value is ProfileId {
  return Boolean(value && AVAILABLE_PROFILES.includes(value as ProfileId))
}

const conversationSchema = z.object({
  agentName: z.enum(AVAILABLE_PROFILES, {
    required_error: "Selecciona un perfil de IA.",
    invalid_type_error: "Selecciona un perfil valido.",
  }),
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
  defaultAgentName?: ProfileId
  onUnauthorized?: () => void
}

type ChatMessage = {
  id: string
  role: "user" | "assistant"
  text: string
  timestamp?: Date
}

export function AiChat({
  accessToken,
  tokenType,
  defaultAgentName = DEFAULT_PROFILE_ID,
  onUnauthorized,
}: AiChatProps) {
  const [conversationId, setConversationId] = useState<string | null>(null)
  const [connectionError, setConnectionError] = useState<string | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [isConnecting, setIsConnecting] = useState(false)
  const [activeAgentName, setActiveAgentName] = useState<ProfileId | null>(null)
  const [messages, setMessages] = useState<ChatMessage[]>([])

  const wsRef = useRef<WebSocket | null>(null)
  const messagesEndRef = useRef<HTMLDivElement | null>(null)

  const initialSelectedProfile = isProfileId(defaultAgentName)
    ? defaultAgentName
    : DEFAULT_PROFILE_ID

  const conversationForm = useForm<ConversationFormValues>({
    resolver: zodResolver(conversationSchema),
    defaultValues: { agentName: initialSelectedProfile },
  })

  const messageForm = useForm<MessageFormValues>({
    resolver: zodResolver(messageSchema),
    defaultValues: { content: "" },
  })

  const watchedAgentName = conversationForm.watch("agentName")
  const pendingAgentProfile = isProfileId(watchedAgentName)
    ? PROFILE_DETAILS[watchedAgentName]
    : null
  const activeAgentProfile = activeAgentName ? PROFILE_DETAILS[activeAgentName] : null

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
          timestamp: new Date(),
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
      timestamp: new Date(),
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
    <div className="space-y-6">
      <Card className="border-2 border-border/40 shadow-lg">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500/10 to-blue-500/10 text-purple-600 dark:text-purple-400">
              <Bot className="h-6 w-6" />
            </div>
            <div>
              <CardTitle className="flex items-center gap-2">
                Hablar con la IA
                <Badge variant="outline" className="text-xs">
                  <Sparkles className="mr-1 h-3 w-3" />
                  Beta
                </Badge>
              </CardTitle>
              <CardDescription>
                Crea o reutiliza una conversación con tu agente preferido.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Form {...conversationForm}>
            <form
              onSubmit={handleConversationSubmit(handleStartConversation)}
              className="space-y-4"
            >
              {conversationForm.formState.errors.root?.message ? (
                <div className="rounded-lg border border-destructive/20 bg-destructive/10 p-4">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 text-destructive" />
                    <p className="text-sm text-destructive">
                      {conversationForm.formState.errors.root.message}
                    </p>
                  </div>
                </div>
              ) : null}
              
              <FormField
                control={conversationControl}
                name="agentName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium">Selecciona un perfil</FormLabel>
                    <FormControl>
                      <div className="grid gap-3 sm:grid-cols-2">
                        {AVAILABLE_PROFILES.map((profileId) => {
                          const profile = PROFILE_DETAILS[profileId]
                          const Icon = profile.icon
                          const isSelected = field.value === profileId

                          return (
                            <button
                              type="button"
                              key={profileId}
                              onClick={() => field.onChange(profileId)}
                              onBlur={field.onBlur}
                              aria-pressed={isSelected}
                              className={cn(
                                "flex h-full w-full items-center gap-3 rounded-xl border p-4 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
                                isSelected
                                  ? "border-primary bg-primary/5"
                                  : "border-border/50 hover:border-primary/40 hover:bg-muted/50"
                              )}
                            >
                              <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                <Icon className="h-5 w-5" />
                              </span>
                              <span className="flex flex-col gap-1">
                                <span className="text-sm font-semibold capitalize">
                                  {profile.label}
                                </span>
                                <span className="text-xs text-muted-foreground">
                                  {profile.description}
                                </span>
                              </span>
                            </button>
                          )
                        })}
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <Button
                type="submit"
                className="w-full h-11"
                disabled={isCreatingConversation || !watchedAgentName}
              >
                {isCreatingConversation ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Conectando...
                  </>
                ) : (
                  <>
                    <MessageCircle className="mr-2 h-4 w-4" />
                    {pendingAgentProfile ? `Hablar con ${pendingAgentProfile.label}` : "Iniciar conversacion"}
                  </>
                )}
              </Button>
            </form>
          </Form>
          
          {conversationId ? (
            <div className="mt-4 rounded-lg border border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950/20 p-4">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300">
                  Conectado
                </Badge>
                <span className="text-sm text-green-700 dark:text-green-300">
                  Conversacion lista {activeAgentProfile ? `con ${activeAgentProfile.label}` : ""}
                </span>
              </div>
              <p className="mt-1 text-xs text-green-600 dark:text-green-400">
                ID: <span className="font-mono">{conversationId}</span>
              </p>
            </div>
          ) : null}
        </CardContent>
      </Card>

      {conversationId ? (
        <Card className="border-2 border-border/40 shadow-lg">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500/10 to-blue-500/10 text-purple-600 dark:text-purple-400">
                  <MessageCircle className="h-5 w-5" />
                </div>
                <div>
                  <CardTitle>Chat con la IA</CardTitle>
                  <CardDescription>
                    Conversacion activa con {activeAgentProfile?.label ?? "agente"}
                  </CardDescription>
                </div>
              </div>
              <Badge variant={isConnected ? "default" : isConnecting ? "secondary" : "destructive"}>
                {isConnected ? (
                  <>
                    <Wifi className="mr-1 h-3 w-3" />
                    Conectado
                  </>
                ) : isConnecting ? (
                  <>
                    <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                    Conectando...
                  </>
                ) : (
                  <>
                    <WifiOff className="mr-1 h-3 w-3" />
                    Desconectado
                  </>
                )}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex max-h-96 min-h-[24rem] flex-col justify-between rounded-xl border border-border/40 bg-muted/20">
              <div className="flex-1 space-y-4 overflow-y-auto p-6">
                {messages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center space-y-4 py-12">
                    <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-500/10 to-blue-500/10">
                      <Bot className="h-8 w-8 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div className="text-center space-y-2">
                      <h3 className="font-medium text-foreground">¡Hola! Soy tu asistente IA</h3>
                      <p className="text-sm text-muted-foreground max-w-sm">
                        Pregúntame lo que necesites. Estoy aquí para ayudarte con ideas, respuestas y tareas.
                      </p>
                    </div>
                  </div>
                ) : (
                  messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex gap-3 ${message.role === "user" ? "justify-end" : "justify-start"}`}
                    >
                      {message.role === "assistant" && (
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-purple-500/10 to-blue-500/10 text-purple-600 dark:text-purple-400">
                          <Bot className="h-4 w-4" />
                        </div>
                      )}
                      <div className={`flex flex-col space-y-1 max-w-[80%] ${message.role === "user" ? "items-end" : "items-start"}`}>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-medium text-muted-foreground">
                            {message.role === "user" ? "Tu" : (activeAgentProfile?.label ?? "IA")}
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
                        <div
                          className={`rounded-2xl px-4 py-2.5 text-sm shadow-sm ${
                            message.role === "user"
                              ? "bg-primary text-primary-foreground"
                              : "bg-background border border-border/40"
                          }`}
                        >
                          {message.text}
                        </div>
                      </div>
                      {message.role === "user" && (
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-medium">
                          U
                        </div>
                      )}
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
                <Form {...messageForm}>
                  <form
                    onSubmit={handleMessageSubmit(handleSendMessage)}
                    className="flex items-center gap-3"
                  >
                    <FormField
                      control={messageControl}
                      name="content"
                      render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormControl>
                        <Input
                          placeholder={
                            isConnected
                              ? activeAgentProfile
                                ? `Mensaje para ${activeAgentProfile.label}...`
                                : "Escribe tu mensaje..."
                              : "Conectando..."
                          }
                          autoComplete="off"
                          disabled={!isConnected || isConnecting}
                          className="h-11 bg-muted/50 border-border/40 focus:bg-background transition-colors"
                          {...field}
                        />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button
                      type="submit"
                      disabled={!isConnected || isConnecting || isSendingMessage || !messageForm.watch("content")?.trim()}
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
          </CardContent>
        </Card>
      ) : null}
    </div>
  )
}


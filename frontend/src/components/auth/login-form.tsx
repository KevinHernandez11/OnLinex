import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"

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

const loginSchema = z.object({
  username: z.string().min(1, "El nombre de usuario es obligatorio"),
  password: z.string().min(6, "La contrasena debe tener al menos 6 caracteres"),
})

type LoginFormValues = z.infer<typeof loginSchema>

const API_BASE_URL = import.meta.env.VITE_API_URL ?? ""

interface LoginFormProps {
  onLoginSuccess?: (token: string, tokenType: string) => void
}

export function LoginForm({ onLoginSuccess }: LoginFormProps) {
  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  })

  async function onSubmit(values: LoginFormValues) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          username: values.username,
          password: values.password,
        }),
      })

      const data = (await response.json().catch(() => null)) as
        | { access_token?: string; token_type?: string; detail?: string; message?: string }
        | null

      if (!response.ok) {
        const message =
          data?.detail ?? data?.message ?? "No pudimos iniciar tu sesion."
        form.setError("root", { message })
        return
      }

      if (!data?.access_token) {
        form.setError("root", {
          message: data?.detail ?? "No se recibio el token de acceso.",
        })
        return
      }

      const tokenType = data.token_type ?? "bearer"
      localStorage.setItem("access_token", data.access_token)
      localStorage.setItem("token_type", tokenType)
      form.reset()
      onLoginSuccess?.(data.access_token, tokenType)
    } catch (error) {
      form.setError("root", {
        message: "Ocurrio un error inesperado. Intenta mas tarde.",
      })
      console.error("Login error", error)
    }
  }

  const {
    handleSubmit,
    control,
    formState: { isSubmitting, errors },
  } = form

  return (
    <Form {...form}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {errors.root?.message ? (
          <p className="text-sm text-destructive">{errors.root.message}</p>
        ) : null}
        <FormField
          control={control}
          name="username"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Username</FormLabel>
              <FormControl>
                <Input
                  type="text"
                  placeholder="nombre de usuario"
                  autoComplete="username"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <Input
                  type="password"
                  placeholder="********"
                  autoComplete="current-password"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? "Iniciando..." : "Iniciar sesion"}
        </Button>
      </form>
    </Form>
  )
}

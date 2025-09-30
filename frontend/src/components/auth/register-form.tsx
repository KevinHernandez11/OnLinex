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

const registerSchema = z
  .object({
    username: z.string().min(2, "El nombre de usuario debe tener al menos 2 caracteres"),
    password: z
      .string()
      .min(8, "La contrasena debe tener al menos 8 caracteres"),
    confirmPassword: z
      .string()
      .min(8, "La contrasena debe tener al menos 8 caracteres"),
  })
  .refine((values) => values.password === values.confirmPassword, {
    message: "Las contrasenas no coinciden",
    path: ["confirmPassword"],
  })

type RegisterFormValues = z.infer<typeof registerSchema>

const API_BASE_URL = import.meta.env.VITE_API_URL ?? ""

export function RegisterForm() {
  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: "",
      password: "",
      confirmPassword: "",
    },
  })

  async function onSubmit(values: RegisterFormValues) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: values.username,
          password: values.password,
          confirm_password: values.confirmPassword,
        }),
      })

      if (!response.ok) {
        const data = (await response.json().catch(() => null)) as
          | { detail?: string; message?: string }
          | null
        const message =
          data?.detail ??
          data?.message ??
          "No pudimos crear tu cuenta. Intenta nuevamente."
        form.setError("root", { message })
        return
      }

      form.reset()
    } catch (error) {
      form.setError("root", {
        message: "Ocurrio un error inesperado. Intenta mas tarde.",
      })
      console.error("Register error", error)
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
                  placeholder="Tu nombre de usuario"
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
              <FormLabel>Contrasena</FormLabel>
              <FormControl>
                <Input
                  type="password"
                  placeholder="********"
                  autoComplete="new-password"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name="confirmPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Confirmar contrasena</FormLabel>
              <FormControl>
                <Input
                  type="password"
                  placeholder="********"
                  autoComplete="new-password"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? "Creando cuenta..." : "Crear cuenta"}
        </Button>
      </form>
    </Form>
  )
}

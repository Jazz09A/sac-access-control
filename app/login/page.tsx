import { LoginForm } from '@/components/auth/login-form'

export default function LoginPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 py-12">
      <LoginForm />
      <p className="mt-8 max-w-md text-center text-xs text-muted-foreground">
        Acceso restringido a personal autorizado. Las credenciales las define el administrador del backend.
      </p>
    </div>
  )
}

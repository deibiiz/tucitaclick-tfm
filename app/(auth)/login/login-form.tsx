'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2, ArrowLeft, Eye, EyeOff } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

const MAX_ATTEMPTS = 3
const COOLDOWN_SECONDS = 60

type View = 'login' | 'register' | 'forgot'

function authErrorMessage(msg: string): string {
  if (msg.includes('Invalid login credentials')) return 'Email o contraseña incorrectos.'
  if (msg.includes('Email not confirmed')) return 'Confirma tu email antes de iniciar sesión. Revisa tu bandeja de entrada.'
  if (msg.includes('User already registered')) return 'Ya existe una cuenta con ese email.'
  if (msg.includes('Password should be')) return 'La contraseña debe tener al menos 6 caracteres.'
  return msg
}

export default function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [view, setView] = useState<View>(
    searchParams.get('tab') === 'register' ? 'register' : 'login'
  )
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [form, setForm] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    nombreNegocio: '',
  })
  const [attempts, setAttempts] = useState(0)
  const [cooldownUntil, setCooldownUntil] = useState<number | null>(null)
  const [secondsLeft, setSecondsLeft] = useState(0)
  const supabase = createClient()

  // actualizamos view si cambia la url
  useEffect(() => {
    setView(searchParams.get('tab') === 'register' ? 'register' : 'login')
  }, [searchParams])

  // reseteamos valores al cambiar de view
  useEffect(() => {
    setForm({ email: '', password: '', confirmPassword: '', nombreNegocio: '' })
    setShowPassword(false)
  }, [view])

  // Control contra fuerza bruta
  useEffect(() => {
    if (!cooldownUntil) return
    const tick = setInterval(() => {
      const left = Math.ceil((cooldownUntil - Date.now()) / 1000)
      if (left <= 0) {
        setCooldownUntil(null)
        setAttempts(0)
        clearInterval(tick)
      } else {
        setSecondsLeft(left)
      }
    }, 1000)
    return () => clearInterval(tick)
  }, [cooldownUntil])

  const isCoolingDown = cooldownUntil !== null && Date.now() < cooldownUntil

  const passwordMismatch = view === 'register' && form.confirmPassword.length > 0 && form.password !== form.confirmPassword
  const passwordTooShort = form.password.length > 0 && form.password.length < 6

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (isCoolingDown) return

    if (view === 'register') {
      if (form.password !== form.confirmPassword) {
        toast.error('Las contraseñas no coinciden.')
        return
      }
      if (!form.nombreNegocio.trim()) {
        toast.error('Introduce el nombre de tu negocio.')
        return
      }
    }

    setLoading(true)
    try {
      if (view === 'register') {
        const { error } = await supabase.auth.signUp({
          email: form.email,
          password: form.password,
          options: {
            data: { nombre_negocio: form.nombreNegocio.trim() },
          },
        })
        if (error) throw error
        toast.success('Cuenta creada. Revisa tu email (incluida la carpeta de spam) para confirmar la dirección.')
        setView('login')
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email: form.email,
          password: form.password,
        })
        if (error) {
          const newAttempts = attempts + 1
          setAttempts(newAttempts)
          if (newAttempts >= MAX_ATTEMPTS) {
            setCooldownUntil(Date.now() + COOLDOWN_SECONDS * 1000)
            setSecondsLeft(COOLDOWN_SECONDS)
          }
          throw error
        }
        router.push('/citas')
        router.refresh()
      }
    } catch (err: unknown) {
      const raw = err instanceof Error ? err.message : 'Error inesperado'
      toast.error(authErrorMessage(raw))
    } finally {
      setLoading(false)
    }
  }

  const handleForgot = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.email.trim()) { toast.error('Introduce tu email primero.'); return }
    setLoading(true)
    const { error } = await supabase.auth.resetPasswordForEmail(form.email.trim(), {
      redirectTo: `${window.location.origin}/update-password`,
    })
    setLoading(false)
    if (error) { toast.error(authErrorMessage(error.message)); return }
    toast.success('Email enviado. Revisa tu bandeja de entrada para restablecer la contraseña.')
    setView('login')
  }

  // Pantalla recuperar contraseña
  if (view === 'forgot') {
    return (
      <Card className="w-full max-w-sm shadow-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Recuperar contraseña</CardTitle>
          <CardDescription>Te enviaremos un enlace para crear una nueva.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleForgot} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="email-forgot">Email</Label>
              <Input
                id="email-forgot"
                type="email"
                placeholder="tu@email.com"
                required
                value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
              />
            </div>
            <Button type="submit" className="w-full h-11" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Enviar enlace
            </Button>
            <button
              type="button"
              onClick={() => setView('login')}
              className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mx-auto"
            >
              <ArrowLeft className="h-3.5 w-3.5" /> Volver al inicio de sesión
            </button>
          </form>
        </CardContent>
      </Card>
    )
  }

  // Pantalla login/registro
  return (
    <Card className="w-full max-w-sm shadow-lg">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">
          {view === 'login' ? 'Bienvenido de nuevo' : 'Crea tu cuenta'}
        </CardTitle>
        <CardDescription>
          {view === 'login'
            ? 'Accede a tu panel de gestión'
            : 'Empieza a gestionar tus citas gratis'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex rounded-lg bg-muted p-1 mb-6 gap-1" role="tablist">
          <button
            role="tab"
            aria-selected={view === 'login'}
            className={`flex-1 text-sm font-medium rounded-md py-1.5 transition-all ${view === 'login' ? 'bg-white shadow text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
            onClick={() => setView('login')}
          >
            Entrar
          </button>
          <button
            role="tab"
            aria-selected={view === 'register'}
            className={`flex-1 text-sm font-medium rounded-md py-1.5 transition-all ${view === 'register' ? 'bg-white shadow text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
            onClick={() => setView('register')}
          >
            Registrarse
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {view === 'register' && (
            <div className="space-y-1.5">
              <Label htmlFor="nombreNegocio">Nombre de tu negocio</Label>
              <Input
                id="nombreNegocio"
                placeholder="Ej: Peluquería Pepe"
                required
                value={form.nombreNegocio}
                onChange={e => setForm(f => ({ ...f, nombreNegocio: e.target.value }))}
              />
            </div>
          )}

          <div className="space-y-1.5">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="tu@email.com"
              required
              value={form.email}
              onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
            />
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Contraseña</Label>
              {view === 'login' && (
                <button
                  type="button"
                  onClick={() => setView('forgot')}
                  className="text-xs text-muted-foreground hover:text-primary transition-colors"
                >
                  ¿Olvidaste tu contraseña?
                </button>
              )}
            </div>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Mínimo 6 caracteres"
                required
                minLength={6}
                value={form.password}
                onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                className={`pr-10 ${passwordTooShort ? 'border-destructive' : ''}`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(v => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {passwordTooShort && (
              <p className="text-xs text-destructive">Mínimo 6 caracteres.</p>
            )}
          </div>

          {view === 'register' && (
            <div className="space-y-1.5">
              <Label htmlFor="confirmPassword">Confirmar contraseña</Label>
              <Input
                id="confirmPassword"
                type={showPassword ? 'text' : 'password'}
                placeholder="Repite la contraseña"
                required
                value={form.confirmPassword}
                onChange={e => setForm(f => ({ ...f, confirmPassword: e.target.value }))}
                className={passwordMismatch ? 'border-destructive' : ''}
              />
              {passwordMismatch && (
                <p className="text-xs text-destructive">Las contraseñas no coinciden.</p>
              )}
            </div>
          )}

          {isCoolingDown && (
            <p className="text-xs text-destructive text-center bg-destructive/5 rounded-md py-2 px-3">
              Demasiados intentos fallidos. Espera {secondsLeft} segundos antes de volver a intentarlo.
            </p>
          )}

          <Button
            type="submit"
            className="w-full h-11"
            disabled={loading || isCoolingDown || passwordMismatch || passwordTooShort}
          >
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {view === 'login' ? 'Iniciar sesión' : 'Crear cuenta'}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}

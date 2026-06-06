'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { CalendarCheck, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import Link from 'next/link'

export default function UpdatePasswordPage() {
  const router = useRouter()
  const supabase = createClient()
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)

  const mismatch = confirm.length > 0 && password !== confirm
  const tooShort = password.length > 0 && password.length < 6
  const canSubmit = password.length >= 6 && password === confirm

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!canSubmit) return
    setLoading(true)
    const { error } = await supabase.auth.updateUser({ password })
    setLoading(false)
    if (error) {
      toast.error('No se pudo actualizar la contraseña. El enlace puede haber caducado, solicita uno nuevo.')
      return
    }
    toast.success('Contraseña actualizada correctamente.')
    router.push('/citas')
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-muted/40 px-4">
      <Link href="/" className="flex items-center gap-2 mb-8 text-foreground hover:text-primary transition-colors">
        <CalendarCheck className="h-6 w-6 text-primary" />
        <span className="font-bold text-xl tracking-tight">TuCitaClick</span>
      </Link>
      <Card className="w-full max-w-sm shadow-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Nueva contraseña</CardTitle>
          <CardDescription>Elige una contraseña segura para tu cuenta.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="password">Nueva contraseña</Label>
              <Input
                id="password"
                type="password"
                placeholder="Mínimo 6 caracteres"
                required
                minLength={6}
                value={password}
                onChange={e => setPassword(e.target.value)}
                className={tooShort ? 'border-destructive' : ''}
              />
              {tooShort && <p className="text-xs text-destructive">Mínimo 6 caracteres.</p>}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="confirm">Confirmar contraseña</Label>
              <Input
                id="confirm"
                type="password"
                placeholder="Repite la contraseña"
                required
                value={confirm}
                onChange={e => setConfirm(e.target.value)}
                className={mismatch ? 'border-destructive' : ''}
              />
              {mismatch && <p className="text-xs text-destructive">Las contraseñas no coinciden.</p>}
            </div>
            <Button type="submit" className="w-full h-11" disabled={loading || !canSubmit}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Guardar contraseña
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

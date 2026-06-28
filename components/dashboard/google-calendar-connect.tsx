'use client'

import { useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { Calendar, CheckCircle2, Unlink } from 'lucide-react'

interface Props {
  comercioId: string
  connected: boolean
}

export default function GoogleCalendarConnect({ comercioId, connected }: Props) {
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    const google = searchParams.get('google')
    if (google === 'connected') toast.success('Google Calendar conectado correctamente.')
    if (google === 'error') toast.error('No se pudo conectar con Google Calendar. Inténtalo de nuevo.')
    if (google) {
      const url = new URL(window.location.href)
      url.searchParams.delete('google')
      router.replace(url.pathname)
    }
  }, [searchParams, router])

  const disconnect = async () => {
    const supabase = createClient()
    await supabase.from('google_calendar_tokens').delete().eq('comercio_id', comercioId)
    toast.success('Google Calendar desconectado.')
    router.refresh()
  }

  if (connected) {
    return (
      <div className="flex items-center gap-3">
        <span className="flex items-center gap-1.5 text-sm text-emerald-600">
          <CheckCircle2 className="h-4 w-4" />
          Conectado
        </span>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-7 text-xs text-destructive border-destructive/30 hover:bg-destructive/10"
          onClick={disconnect}
        >
          <Unlink className="h-3 w-3 mr-1" />
          Desconectar
        </Button>
      </div>
    )
  }

  return (
    <a href="/api/auth/google">
      <Button type="button" variant="outline" size="sm" className="gap-2">
        <Calendar className="h-4 w-4" />
        Conectar Google Calendar
      </Button>
    </a>
  )
}

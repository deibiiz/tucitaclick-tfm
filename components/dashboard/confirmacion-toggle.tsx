'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'

interface Props {
  comercioId: string
  enabled: boolean
}

export default function ConfirmacionToggle({ comercioId, enabled }: Props) {
  const [value, setValue] = useState(enabled)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const toggle = async () => {
    const next = !value
    setLoading(true)
    const supabase = createClient()
    const { error } = await supabase
      .from('comercios')
      .update({ confirmacion_manual: next })
      .eq('id', comercioId)
    setLoading(false)
    if (error) { toast.error(error.message); return }
    setValue(next)
    toast.success(next ? 'Confirmación manual activada' : 'Las citas se confirmarán automáticamente')
    router.refresh()
  }

  return (
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium">Confirmación manual</p>
        <p className="text-xs text-muted-foreground mt-0.5">
          {value
            ? 'Debes confirmar cada cita desde el panel.'
            : 'Las citas se confirman automáticamente al reservarse.'}
        </p>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={value}
        onClick={toggle}
        disabled={loading}
        className={`relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50 ${
          value ? 'bg-primary' : 'bg-muted-foreground/30'
        }`}
      >
        {loading
          ? <Loader2 className="absolute inset-0 m-auto h-3 w-3 animate-spin text-white" />
          : <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${value ? 'translate-x-[18px]' : 'translate-x-0.5'}`} />
        }
      </button>
    </div>
  )
}

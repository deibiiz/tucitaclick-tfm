'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { Loader2, CheckCircle, XCircle, NotebookPen } from 'lucide-react'
import type { Cita } from '@/lib/type'

interface Props {
  citaId: string
  currentEstado: Cita['estado']
  confirmacionManual?: boolean
  notas?: string | null
}

export default function CitaActions({ citaId, currentEstado, confirmacionManual = false, notas: initialNotas }: Props) {
  const [loading, setLoading] = useState<string | null>(null)
  const [notasOpen, setNotasOpen] = useState(false)
  const [notas, setNotas] = useState(initialNotas ?? '')
  const [savingNotas, setSavingNotas] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const update = async (estado: Cita['estado']) => {
    setLoading(estado)
    const { error } = await supabase.from('citas').update({ estado }).eq('id', citaId)
    setLoading(null)
    if (error) { toast.error(error.message); return }
    toast.success(`Cita ${estado === 'confirmado' ? 'confirmada' : 'cancelada'}`)

    fetch('/api/google/sync-cita', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ citaId, action: estado === 'confirmado' ? 'create' : 'delete' }),
    }).catch(() => {})

    fetch('/api/whatsapp/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ citaId, tipo: estado === 'confirmado' ? 'confirmacion' : 'cancelacion' }),
    }).catch(() => {})

    router.refresh()
  }

  const saveNotas = async () => {
    setSavingNotas(true)
    const { error } = await supabase.from('citas').update({ notas: notas.trim() || null }).eq('id', citaId)
    setSavingNotas(false)
    if (error) { toast.error(error.message); return }
    toast.success('Notas guardadas')
    setNotasOpen(false)
    router.refresh()
  }

  return (
    <div className="flex gap-1.5 justify-end items-center">
      {/* botón notas */}
      <Dialog open={notasOpen} onOpenChange={setNotasOpen}>
        <DialogTrigger render={
          <button
            className={`p-1.5 rounded-md transition-colors ${notas ? 'text-primary hover:bg-primary/10' : 'text-muted-foreground hover:text-foreground hover:bg-accent'}`}
            title={notas || 'Añadir nota'}
          />
        }>
          <NotebookPen className="h-3.5 w-3.5" />
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Notas internas</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 pt-1">
            <p className="text-xs text-muted-foreground">Visibles solo en el dashboard, no se envían al cliente.</p>
            <Textarea
              value={notas}
              onChange={e => setNotas(e.target.value)}
              placeholder="Ej: Cliente alérgica al amoniaco. Prefiere cita por la tarde."
              rows={4}
              maxLength={500}
            />
            <Button className="w-full" onClick={saveNotas} disabled={savingNotas}>
              {savingNotas ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Guardar'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Estado citas */}
      {currentEstado !== 'cancelado' && (
        <>
          {confirmacionManual && currentEstado !== 'confirmado' && (
            <Button
              size="sm"
              variant="outline"
              className="h-7 text-xs text-emerald-600 border-emerald-200 hover:bg-emerald-50"
              onClick={() => update('confirmado')}
              disabled={!!loading}
            >
              {loading === 'confirmado' ? <Loader2 className="h-3 w-3 animate-spin" /> : <CheckCircle className="h-3 w-3 mr-1" />}
              Confirmar
            </Button>
          )}
          <Button
            size="sm"
            variant="outline"
            className="h-7 text-xs text-destructive border-destructive/30 hover:bg-destructive/10"
            onClick={() => update('cancelado')}
            disabled={!!loading}
          >
            {loading === 'cancelado' ? <Loader2 className="h-3 w-3 animate-spin" /> : <XCircle className="h-3 w-3 mr-1" />}
            Cancelar
          </Button>
        </>
      )}
      {currentEstado === 'cancelado' && <span className="text-xs text-muted-foreground">—</span>}
    </div>
  )
}

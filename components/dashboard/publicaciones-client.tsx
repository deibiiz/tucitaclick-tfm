'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Plus, Trash2, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import type { Publicacion } from '@/lib/type'

const TIPO_CONFIG: Record<Publicacion['tipo'], { label: string; className: string }> = {
  oferta:  { label: 'Oferta',   className: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
  anuncio: { label: 'Anuncio',  className: 'bg-blue-100 text-blue-800 border-blue-200' },
  aviso:   { label: 'Aviso',    className: 'bg-amber-100 text-amber-800 border-amber-200' },
}

interface Props {
  comercioId: string
  publicaciones: Publicacion[]
}

export default function PublicacionesClient({ comercioId, publicaciones: initial }: Props) {
  const supabase = createClient()
  const [items, setItems] = useState(initial)
  const [open, setOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState<{ tipo: Publicacion['tipo']; titulo: string; contenido: string; fecha_expira: string }>({
    tipo: 'anuncio',
    titulo: '',
    contenido: '',
    fecha_expira: '',
  })

  const handleCreate = async () => {
    if (!form.titulo.trim() || !form.contenido.trim()) return
    setSaving(true)
    const { data, error } = await supabase
      .from('publicaciones')
      .insert({
        comercio_id: comercioId,
        tipo: form.tipo,
        titulo: form.titulo.trim(),
        contenido: form.contenido.trim(),
        fecha_expira: form.fecha_expira ? new Date(form.fecha_expira + 'T23:59:59').toISOString() : null,
      })
      .select()
      .single()
    if (error) { toast.error('Error al crear la publicación'); setSaving(false); return }
    setItems(prev => [data as Publicacion, ...prev])
    setForm({ tipo: 'anuncio', titulo: '', contenido: '', fecha_expira: '' })
    setOpen(false)
    toast.success('Publicación creada')
    setSaving(false)
  }

  const toggleActivo = async (id: string, activo: boolean) => {
    setItems(prev => prev.map(p => p.id === id ? { ...p, activo } : p))
    const { error } = await supabase.from('publicaciones').update({ activo }).eq('id', id)
    if (error) {
      toast.error('Error al actualizar')
      setItems(prev => prev.map(p => p.id === id ? { ...p, activo: !activo } : p))
    }
  }

  const handleDelete = async (id: string) => {
    setItems(prev => prev.filter(p => p.id !== id))
    const { error } = await supabase.from('publicaciones').delete().eq('id', id)
    if (error) toast.error('Error al eliminar')
    else toast.success('Publicación eliminada')
  }

  const today = new Date().toISOString().slice(0, 10)

  return (
    <div className="space-y-4 max-w-2xl">
      <div className="flex justify-end">
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger render={<Button className="flex items-center gap-2" />}>
            <Plus className="h-4 w-4" />
            Nueva publicación
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Nueva publicación</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-2">
              <div className="space-y-1.5">
                <Label>Tipo</Label>
                <Select
                  value={form.tipo}
                  onValueChange={v => setForm(f => ({ ...f, tipo: v as Publicacion['tipo'] }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="oferta">Oferta</SelectItem>
                    <SelectItem value="anuncio">Anuncio</SelectItem>
                    <SelectItem value="aviso">Aviso</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label>Título</Label>
                <Input
                  value={form.titulo}
                  onChange={e => setForm(f => ({ ...f, titulo: e.target.value }))}
                  placeholder="ej. 20% de descuento esta semana"
                  maxLength={100}
                />
              </div>

              <div className="space-y-1.5">
                <Label>Contenido</Label>
                <Textarea
                  value={form.contenido}
                  onChange={e => setForm(f => ({ ...f, contenido: e.target.value }))}
                  placeholder="Describe la oferta, anuncio o aviso…"
                  rows={3}
                  maxLength={500}
                />
              </div>

              <div className="space-y-1.5">
                <Label>
                  Válido hasta{' '}
                  <span className="text-muted-foreground font-normal">(opcional)</span>
                </Label>
                <Input
                  type="date"
                  value={form.fecha_expira}
                  onChange={e => setForm(f => ({ ...f, fecha_expira: e.target.value }))}
                  min={today}
                />
              </div>

              <Button
                className="w-full"
                onClick={handleCreate}
                disabled={saving || !form.titulo.trim() || !form.contenido.trim()}
              >
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Publicar'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {items.length === 0 ? (
        <Card>
          <CardContent className="py-10 text-center text-sm text-muted-foreground">
            No hay publicaciones todavía. Crea una para que aparezca en tu página de reservas.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {items.map(pub => {
            const cfg = TIPO_CONFIG[pub.tipo]
            const expired = pub.fecha_expira ? new Date(pub.fecha_expira) < new Date() : false
            return (
              <Card key={pub.id} className={pub.activo && !expired ? '' : 'opacity-55'}>
                <CardContent className="pt-4 pb-3">
                  <div className="flex items-start gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1.5">
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${cfg.className}`}>
                          {cfg.label}
                        </span>
                        {expired && (
                          <span className="text-xs text-muted-foreground">· Expirada</span>
                        )}
                        {pub.fecha_expira && !expired && (
                          <span className="text-xs text-muted-foreground">
                            · Hasta {new Date(pub.fecha_expira).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}
                          </span>
                        )}
                      </div>
                      <p className="font-semibold text-sm">{pub.titulo}</p>
                      <p className="text-sm text-muted-foreground mt-0.5 leading-relaxed">{pub.contenido}</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0 pt-0.5">
                      <Switch
                        checked={pub.activo}
                        onCheckedChange={v => toggleActivo(pub.id, v)}
                      />
                      <button
                        onClick={() => handleDelete(pub.id)}
                        className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}

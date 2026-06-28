'use client'

import { useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { Loader2, Copy, Check, Phone, MapPin, ImageUp, FileText, X } from 'lucide-react'
import type { Comercio } from '@/lib/type'

interface Props {
  comercio: Comercio | null
  userId: string
  initialNombreNegocio?: string
}

function slugified(val: string) {
  return val.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '').slice(0, 40)
}

export default function ConfigForm({ comercio, userId, initialNombreNegocio }: Props) {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const defaultNombre = comercio?.nombre ?? initialNombreNegocio ?? ''

  const [form, setForm] = useState({
    nombre: defaultNombre,
    slug: comercio?.slug ?? slugified(defaultNombre),
    descripcion: comercio?.descripcion ?? '',
    telefono: comercio?.telefono ?? '',
    direccion: comercio?.direccion ?? '',
    foto_portada: comercio?.foto_portada ?? '',
    dias_anticipacion: comercio?.dias_anticipacion ?? 14,
  })

  const handleUploadFoto = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      toast.error('El archivo debe ser una imagen.')
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('La imagen no puede superar los 5 MB.')
      return
    }
    setUploading(true)

    // Eliminar foto anterior si existe
    if (form.foto_portada) {
      const oldPath = form.foto_portada.split('/portadas/')[1]?.split('?')[0]
      if (oldPath) await supabase.storage.from('portadas').remove([oldPath])
    }

    const ext = file.name.split('.').pop()
    const path = `${userId}/portada-${Date.now()}.${ext}`
    const { error } = await supabase.storage
      .from('portadas')
      .upload(path, file)
    if (error) {
      toast.error('No se pudo subir la imagen.')
      setUploading(false)
      return
    }
    const { data } = supabase.storage.from('portadas').getPublicUrl(path)
    setForm(f => ({ ...f, foto_portada: data.publicUrl }))
    setUploading(false)
    toast.success('Imagen subida correctamente')
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const payload = {
      nombre: form.nombre.trim(),
      slug: slugified(form.slug),
      dueno_id: userId,
      descripcion: form.descripcion.trim() || null,
      telefono: form.telefono.trim() || null,
      direccion: form.direccion.trim() || null,
      foto_portada: form.foto_portada.trim() || null,
      dias_anticipacion: Math.min(365, Math.max(1, form.dias_anticipacion)),
    }

    const { error } = comercio
      ? await supabase.from('comercios').update(payload).eq('id', comercio.id)
      : await supabase.from('comercios').insert(payload)

    setLoading(false)
    if (error) {
      toast.error(error.code === '23505' ? 'Ese slug ya está en uso, elige otro.' : error.message)
      return
    }
    toast.success('Cambios guardados')
    router.refresh()
  }

  const bookingUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/${slugified(form.slug)}`

  const copyUrl = async () => {
    await navigator.clipboard.writeText(bookingUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <form onSubmit={handleSave} className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="nombre">Nombre del negocio</Label>
        <Input
          id="nombre"
          placeholder="Ej: Peluquería Pepe"
          required
          value={form.nombre}
          onChange={e => setForm(f => ({ ...f, nombre: e.target.value }))}
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="slug">Slug (URL personalizada)</Label>
        <div className="flex gap-2">
          <div className="flex items-center px-3 bg-muted border rounded-l-md text-muted-foreground text-sm whitespace-nowrap border-r-0">
            /
          </div>
          <Input
            id="slug"
            className="rounded-l-none"
            placeholder="peluqueria-pepe"
            required
            value={form.slug}
            onChange={e => setForm(f => ({ ...f, slug: slugified(e.target.value) }))}
          />
        </div>
        <p className="text-xs text-muted-foreground">Solo letras minúsculas, números y guiones.</p>
      </div>

      {form.slug && (
        <div className="flex items-center gap-2 p-2.5 bg-muted rounded-lg">
          <code className="text-xs text-muted-foreground flex-1 truncate">/{slugified(form.slug)}</code>
          <Button type="button" size="sm" variant="ghost" className="h-6 w-6 p-0 shrink-0" onClick={copyUrl}>
            {copied ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
          </Button>
        </div>
      )}

      <div className="border-t pt-4 space-y-4">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Información pública</p>

        <div className="space-y-1.5">
          <Label htmlFor="descripcion" className="flex items-center gap-1.5">
            <FileText className="h-3.5 w-3.5" /> Descripción
          </Label>
          <textarea
            id="descripcion"
            rows={3}
            maxLength={300}
            placeholder="Ej: Peluquería unisex en el centro, especializados en coloración y corte moderno."
            value={form.descripcion}
            onChange={e => setForm(f => ({ ...f, descripcion: e.target.value }))}
            className="w-full min-w-0 rounded-lg border border-input bg-transparent px-2.5 py-1.5 text-sm transition-colors outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 resize-none"
          />
          <p className={`text-xs text-right tabular-nums ${form.descripcion.length >= 280 ? 'text-destructive' : 'text-muted-foreground'}`}>
            {form.descripcion.length}/300
          </p>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="telefono" className="flex items-center gap-1.5">
            <Phone className="h-3.5 w-3.5" /> Teléfono de contacto
          </Label>
          <Input
            id="telefono"
            type="tel"
            placeholder="Ej: 600 123 456"
            value={form.telefono}
            onChange={e => setForm(f => ({ ...f, telefono: e.target.value }))}
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="direccion" className="flex items-center gap-1.5">
            <MapPin className="h-3.5 w-3.5" /> Dirección
          </Label>
          <Input
            id="direccion"
            placeholder="Ej: Calle Mayor 12, 28001 Madrid"
            value={form.direccion}
            onChange={e => setForm(f => ({ ...f, direccion: e.target.value }))}
          />
          <p className="text-xs text-muted-foreground">Se mostrará un enlace a Google Maps en tu página.</p>
        </div>

        <div className="space-y-1.5">
          <Label className="flex items-center gap-1.5">
            <ImageUp className="h-3.5 w-3.5" /> Foto de portada
          </Label>

          {form.foto_portada ? (
            <div className="relative rounded-lg overflow-hidden border">
              <img
                src={form.foto_portada}
                alt="Portada"
                className="w-full h-32 object-cover"
              />
              <button
                type="button"
                onClick={async () => {
                  const oldPath = form.foto_portada.split('/portadas/')[1]?.split('?')[0]
                  if (oldPath) await supabase.storage.from('portadas').remove([oldPath])
                  setForm(f => ({ ...f, foto_portada: '' }))
                }}
                className="absolute top-2 right-2 bg-black/50 hover:bg-black/70 text-white rounded-full p-1 transition-colors"
                aria-label="Eliminar foto"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="w-full h-24 rounded-lg border-2 border-dashed border-input hover:border-primary/50 hover:bg-accent/30 transition-colors flex flex-col items-center justify-center gap-1.5 text-muted-foreground text-sm disabled:opacity-50 disabled:pointer-events-none"
            >
              {uploading
                ? <><Loader2 className="h-5 w-5 animate-spin" /> Subiendo...</>
                : <><ImageUp className="h-5 w-5" /> Haz clic para subir una imagen</>
              }
            </button>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={e => {
              const file = e.target.files?.[0]
              if (file) handleUploadFoto(file)
              e.target.value = ''
            }}
          />
          <p className="text-xs text-muted-foreground">JPG, PNG o WebP · máx. 5 MB</p>
        </div>
      </div>

      <div className="border-t pt-4 space-y-1.5">
        <Label htmlFor="dias_anticipacion">Días de antelación máxima</Label>
        <Input
          id="dias_anticipacion"
          type="number"
          min={1}
          max={365}
          value={form.dias_anticipacion}
          onChange={e => setForm(f => ({ ...f, dias_anticipacion: Number(e.target.value) }))}
        />
        <p className="text-xs text-muted-foreground">Los clientes podrán reservar hasta {form.dias_anticipacion} días con antelación.</p>
      </div>

      <Button type="submit" className="w-full" disabled={loading}>
        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {comercio ? 'Guardar cambios' : 'Crear negocio'}
      </Button>
    </form>
  )
}

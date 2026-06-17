import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import BookingFlow from '@/components/booking/booking-flow'
import { CalendarCheck, Phone, MapPin, Clock, ExternalLink } from 'lucide-react'
import { DIAS_CORTO, DIA_ORDER } from '@/lib/constants'
import type { Horario, Publicacion } from '@/lib/type'

const TIPO_CONFIG: Record<Publicacion['tipo'], { label: string; bg: string; badge: string }> = {
  oferta:  { label: 'Oferta',  bg: 'bg-emerald-50 border-emerald-200', badge: 'bg-emerald-100 text-emerald-800' },
  anuncio: { label: 'Anuncio', bg: 'bg-blue-50 border-blue-200',       badge: 'bg-blue-100 text-blue-800' },
  aviso:   { label: 'Aviso',   bg: 'bg-amber-50 border-amber-200',     badge: 'bg-amber-100 text-amber-800' },
}

function HorarioSemana({ horarios }: { horarios: Horario[] }) {
  const byDia = Object.fromEntries(horarios.map(h => [h.dia_semana, h]))
  const hoy = new Date().getDay()

  return (
    <div className="space-y-0.5">
      {DIA_ORDER.map(dia => {
        const h = byDia[dia]
        const abierto = h?.activo ?? false
        const esHoy = dia === hoy
        return (
          <div
            key={dia}
            className={`flex items-center gap-3 rounded-md px-2 py-1.5 text-sm ${esHoy ? 'bg-primary/10' : ''}`}
          >
            <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${abierto ? 'bg-emerald-500' : 'bg-muted-foreground/25'}`} />
            <span className={`w-7 shrink-0 font-medium ${esHoy ? 'text-primary' : abierto ? 'text-foreground' : 'text-muted-foreground/60'}`}>
              {DIAS_CORTO[dia]}
            </span>
            {abierto
              ? <span className={`tabular-nums ${esHoy ? 'text-foreground font-medium' : 'text-muted-foreground'}`}>
                  {h!.hora_inicio.slice(0, 5)} – {h!.hora_fin.slice(0, 5)}
                </span>
              : <span className="text-muted-foreground/40 text-xs italic">Cerrado</span>
            }
            {esHoy && (
              <span className="ml-auto text-xs font-semibold text-primary bg-primary/15 px-2 py-0.5 rounded-full">
                Hoy
              </span>
            )}
          </div>
        )
      })}
    </div>
  )
}

export default async function BookingPage({ params, }: {params: Promise<{ slug: string }>}) {
  const { slug } = await params
  const supabase = await createClient()

  const { data: comercio } = await supabase
    .from('comercios')
    .select('*')
    .eq('slug', slug)
    .single()

  if (!comercio) notFound()

  const [{ data: servicios }, { data: horarios }, { data: publicaciones }] = await Promise.all([
    supabase.from('servicios').select('*').eq('comercio_id', comercio.id).order('nombre'),
    supabase.from('horarios').select('*').eq('comercio_id', comercio.id),
    supabase.from('publicaciones').select('id,tipo,titulo,contenido,fecha_expira')
      .eq('comercio_id', comercio.id)
      .eq('activo', true)
      .or('fecha_expira.is.null,fecha_expira.gt.' + new Date().toISOString())
      .order('created_at', { ascending: false }),
  ])

  const mapsUrl = comercio.direccion
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(comercio.direccion)}`
    : null

  return (
    <div className="min-h-screen bg-gradient-to-b from-accent/30 to-background">
      {/* Header */}
      <header className="w-full border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="w-full max-w-2xl mx-auto px-4 h-14 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 min-w-0">
            <CalendarCheck className="h-5 w-5 text-primary shrink-0" />
            <span className="font-semibold text-sm truncate">{comercio.nombre}</span>
          </div>
          {comercio.telefono && (
            <a
              href={`tel:${comercio.telefono}`}
              className="flex items-center gap-1.5 text-xs text-primary font-medium shrink-0 hover:underline"
            >
              <Phone className="h-3.5 w-3.5" />
              {comercio.telefono}
            </a>
          )}
        </div>
      </header>

      <div className="w-full max-w-2xl mx-auto">
        {/* Foto del comercio */}
        {comercio.foto_portada && (
          <div className="bg-muted/40 flex items-center justify-center overflow-hidden">
            <img
              src={comercio.foto_portada}
              alt={comercio.nombre}
              className="w-full max-h-80 object-contain"
            />
          </div>
        )}

        <div className="px-4 pt-5 pb-1">
          <h1 className="text-xl font-bold">{comercio.nombre}</h1>
          {comercio.descripcion && (
            <p className="text-sm text-muted-foreground mt-1.5 leading-relaxed">{comercio.descripcion}</p>
          )}
        </div>

        {/* Tablón de publicaciones */}
        {publicaciones && publicaciones.length > 0 && (
          <div className="px-4 pt-4 space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Novedades</p>
            {(publicaciones as Publicacion[]).map(publi => {
              const cfg = TIPO_CONFIG[publi.tipo]
              return (
                <div key={publi.id} className={`rounded-xl border p-4 ${cfg.bg}`}>
                  <div className="flex items-start gap-3">
                    <div className="flex-1 min-w-0">
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${cfg.badge}`}>
                        {cfg.label}
                      </span>
                      <p className="font-semibold text-sm mt-1.5">{publi.titulo}</p>
                      <p className="text-sm text-muted-foreground mt-0.5 leading-relaxed">{publi.contenido}</p>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Apartado ¿Qué servicio necesitas? */}
        <div className="px-4 pt-5 pb-10">
          <BookingFlow
            comercioId={comercio.id}
            comercioNombre={comercio.nombre}
            servicios={servicios ?? []}
            horarios={horarios ?? []}
            empleados={comercio.empleados ?? 1}
            autoConfirm={!(comercio.confirmacion_manual ?? false)}
            diasAnticipacion={comercio.dias_anticipacion ?? 14}
            // Información del negocio
            businessFooter={
              <footer className="mt-8 rounded-2xl border bg-white shadow-sm overflow-hidden">
                <div className="px-5 py-3 bg-muted/40 border-b">
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Información del negocio
                  </p>
                </div>

                <div className="divide-y">
                  
                  {comercio.telefono && (
                    <a
                      href={`tel:${comercio.telefono}`}
                      className="flex items-center gap-4 px-5 py-4 hover:bg-muted/30 transition-colors group"
                    >
                      <div className="p-2 bg-primary/10 rounded-lg shrink-0">
                        <Phone className="h-4 w-4 text-primary" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs text-muted-foreground">Teléfono</p>
                        <p className="text-sm font-medium group-hover:text-primary transition-colors">
                          {comercio.telefono}
                        </p>
                      </div>
                    </a>
                  )}

                  {comercio.direccion && (
                    <div className="flex items-start gap-4 px-5 py-4">
                      <div className="p-2 bg-primary/10 rounded-lg shrink-0 mt-0.5">
                        <MapPin className="h-4 w-4 text-primary" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs text-muted-foreground">Dirección</p>
                        <p className="text-sm font-medium">{comercio.direccion}</p>
                        {mapsUrl && (
                          <a
                            href={mapsUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="mt-1 inline-flex items-center gap-1 text-xs text-primary hover:underline"
                          >
                            Ver en Google Maps
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        )}
                      </div>
                    </div>
                  )}

                  {horarios && horarios.length > 0 && (
                    <div className="flex items-start gap-4 px-5 py-4">
                      <div className="p-2 bg-primary/10 rounded-lg shrink-0 mt-0.5">
                        <Clock className="h-4 w-4 text-primary" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs text-muted-foreground mb-3">Horario semanal</p>
                        <HorarioSemana horarios={horarios} />
                      </div>
                    </div>
                  )}
                </div>

                <div className="px-5 py-3 border-t bg-muted/20 text-center">
                  <p className="text-xs text-muted-foreground">
                    Reservas gestionadas con{' '}
                    <span className="font-semibold text-primary">TuCitaClick</span>
                  </p>
                </div>
              </footer>
            }
          />
        </div>
      </div>
    </div>
  )
}

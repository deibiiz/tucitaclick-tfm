import Link from 'next/link'
import BookingFlow from '@/components/booking/booking-flow'
import { CalendarCheck, Phone, MapPin, Clock, Info } from 'lucide-react'
import { DIAS_CORTO, DIA_ORDER } from '@/lib/constants'
import type { Servicio, Horario } from '@/lib/type'

const SERVICIOS: Servicio[] = [
  { id: 'd1', comercio_id: 'demo', nombre: 'Corte de pelo', duracion: 30, precio: 15 },
  { id: 'd2', comercio_id: 'demo', nombre: 'Corte + Lavado', duracion: 45, precio: 22 },
  { id: 'd3', comercio_id: 'demo', nombre: 'Tinte completo', duracion: 90, precio: 50 },
  { id: 'd4', comercio_id: 'demo', nombre: 'Arreglo de barba', duracion: 20, precio: 10 },
]

const HORARIOS: Horario[] = [
  { id: 'h1', comercio_id: 'demo', dia_semana: 1, hora_inicio: '09:00', hora_fin: '19:00', activo: true },
  { id: 'h2', comercio_id: 'demo', dia_semana: 2, hora_inicio: '09:00', hora_fin: '19:00', activo: true },
  { id: 'h3', comercio_id: 'demo', dia_semana: 3, hora_inicio: '09:00', hora_fin: '19:00', activo: true },
  { id: 'h4', comercio_id: 'demo', dia_semana: 4, hora_inicio: '09:00', hora_fin: '19:00', activo: true },
  { id: 'h5', comercio_id: 'demo', dia_semana: 5, hora_inicio: '09:00', hora_fin: '19:00', activo: true },
  { id: 'h6', comercio_id: 'demo', dia_semana: 6, hora_inicio: '09:00', hora_fin: '14:00', activo: true },
  { id: 'h7', comercio_id: 'demo', dia_semana: 0, hora_inicio: '09:00', hora_fin: '14:00', activo: false },
]

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

export default function DemoPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-accent/30 to-background">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-lg mx-auto px-4 h-14 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 min-w-0">
            <CalendarCheck className="h-5 w-5 text-primary shrink-0" />
            <span className="font-semibold text-sm truncate">Peluquería Estilo</span>
          </div>
          <a
            href="tel:+34600000000"
            className="flex items-center gap-1.5 text-xs text-primary font-medium shrink-0 hover:underline"
          >
            <Phone className="h-3.5 w-3.5" />
            600 000 000
          </a>
        </div>
      </header>

      {/* Banner demo */}
      <div className="bg-amber-50 border-b border-amber-200">
        <div className="max-w-lg mx-auto px-4 py-2.5 flex items-center gap-2">
          <Info className="h-4 w-4 text-amber-600 shrink-0" />
          <p className="text-xs text-amber-700">
            Modo demo — puedes probar el flujo completo, pero las reservas no se guardarán.{' '}
            <Link href="/login?tab=register" className="font-semibold underline underline-offset-2">
              Crea tu cuenta gratis →
            </Link>
          </p>
        </div>
      </div>

      <div className="max-w-lg mx-auto">
        <div className="bg-muted/40 flex items-center justify-center overflow-hidden">
          <img
            src="https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?w=800&q=80"
            alt="Peluquería Estilo"
            className="w-full max-h-80 object-contain"
          />
        </div>

        {/* Nombre y descripción */}
        <div className="px-4 pt-6 pb-1">
          <h1 className="text-xl font-bold">Peluquería Estilo</h1>
          <p className="text-sm text-muted-foreground mt-1.5 leading-relaxed">
            Tu peluquería de confianza en el centro. Cortes modernos, tintes y mucho más. Reserva tu cita en segundos.
          </p>
        </div>

        {/* Reserva */}
        <div className="px-4 pt-5 pb-10">
          <BookingFlow
            comercioId="demo"
            comercioNombre="Peluquería Estilo"
            servicios={SERVICIOS}
            horarios={HORARIOS}
            demoMode
            businessFooter={
              <footer className="mt-8 rounded-2xl border bg-white shadow-sm overflow-hidden">
                <div className="px-5 py-3 bg-muted/40 border-b">
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Información del negocio
                  </p>
                </div>

                <div className="divide-y">
                  <a
                    href="tel:+34600000000"
                    className="flex items-center gap-4 px-5 py-4 hover:bg-muted/30 transition-colors group"
                  >
                    <div className="p-2 bg-primary/10 rounded-lg shrink-0">
                      <Phone className="h-4 w-4 text-primary" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs text-muted-foreground">Teléfono</p>
                      <p className="text-sm font-medium group-hover:text-primary transition-colors">600 000 000</p>
                    </div>
                  </a>

                  <div className="flex items-start gap-4 px-5 py-4">
                    <div className="p-2 bg-primary/10 rounded-lg shrink-0 mt-0.5">
                      <MapPin className="h-4 w-4 text-primary" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs text-muted-foreground">Dirección</p>
                      <p className="text-sm font-medium">Calle Mayor 12, Madrid</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4 px-5 py-4">
                    <div className="p-2 bg-primary/10 rounded-lg shrink-0 mt-0.5">
                      <Clock className="h-4 w-4 text-primary" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs text-muted-foreground mb-3">Horario semanal</p>
                      <HorarioSemana horarios={HORARIOS} />
                    </div>
                  </div>
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

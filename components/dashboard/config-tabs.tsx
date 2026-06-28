'use client'

import { useState } from 'react'
import { Settings, Clock, Link as LinkIcon, Copy, Check, Calendar, CalendarX2 } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import ConfigForm from './config-form'
import HorarioForm from './horario-form'
import EmpleadosForm from './empleados-form'
import GoogleCalendarConnect from './google-calendar-connect'
import ConfirmacionToggle from './confirmacion-toggle'
import BloqueosForm from './bloqueos-form'
import type { Comercio, Horario, Empleado, EmpleadoHorario, Bloqueo } from '@/lib/type'

interface Props {
  comercio: Comercio | null
  horarios: Horario[]
  empleados: (Empleado & { empleado_horarios: EmpleadoHorario[] })[]
  bloqueos: Bloqueo[]
  userId: string
  initialNombreNegocio?: string
  googleConnected?: boolean
}

const TABS = [
  { id: 'perfil' as const, label: 'Perfil', icon: Settings },
  { id: 'horario' as const, label: 'Horario y empleados', icon: Clock },
  { id: 'disponibilidad' as const, label: 'Disponibilidad', icon: CalendarX2 },
]

export default function ConfigTabs({ comercio, horarios, empleados, bloqueos, userId, initialNombreNegocio, googleConnected = false }: Props) {
  const [tab, setTab] = useState<'perfil' | 'horario' | 'disponibilidad'>('perfil')
  const [copied, setCopied] = useState(false)

  const bookingPath = comercio?.slug ? `/${comercio.slug}` : null

  const copyUrl = async () => {
    if (!bookingPath) return
    await navigator.clipboard.writeText(window.location.origin + bookingPath)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="space-y-5">
      {/* Enlace de reservas (siempre visible) */}
      {bookingPath && (
        <div className="flex items-center gap-2 px-3 py-2.5 bg-primary/5 border border-primary/20 rounded-lg max-w-lg">
          <LinkIcon className="h-3.5 w-3.5 text-primary shrink-0" />
          <a
            href={bookingPath}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline text-sm font-mono truncate flex-1"
          >
            {bookingPath}
          </a>
          <Button type="button" size="sm" variant="ghost" className="h-7 w-7 p-0 shrink-0" onClick={copyUrl}>
            {copied
              ? <Check className="h-3.5 w-3.5 text-emerald-600" />
              : <Copy className="h-3.5 w-3.5" />
            }
          </Button>
        </div>
      )}

      {/* Pestañas */}
      <div className="border-b flex">
        {TABS.map(t => {
          const Icon = t.icon
          const active = tab === t.id
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors ${
                active
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground hover:border-muted-foreground/30'
              }`}
            >
              <Icon className="h-4 w-4" />
              {t.label}
            </button>
          )
        })}
      </div>

      {/* Pestaña: Perfil */}
      {tab === 'perfil' && (
        <div className="max-w-lg space-y-4">
          <Card>
            <CardContent className="pt-5">
              <ConfigForm comercio={comercio} userId={userId} initialNombreNegocio={initialNombreNegocio} />
            </CardContent>
          </Card>

          {comercio && (
            <Card>
              <CardContent className="pt-5 space-y-4">
                <ConfirmacionToggle
                  comercioId={comercio.id}
                  enabled={comercio.confirmacion_manual ?? false}
                />
              </CardContent>
            </Card>
          )}

          {comercio && (
            <Card>
              <CardContent className="pt-5 space-y-3">
                <div>
                  <p className="text-sm font-semibold flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Google Calendar
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Las citas confirmadas se añadirán automáticamente a tu calendario de Google.
                  </p>
                </div>
                <GoogleCalendarConnect comercioId={comercio.id} connected={googleConnected} />
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Pestaña: Disponibilidad */}
      {tab === 'disponibilidad' && !comercio && (
        <p className="text-sm text-muted-foreground">
          Primero crea tu negocio en la pestaña <strong>Perfil</strong>.
        </p>
      )}

      {tab === 'disponibilidad' && comercio && (
        <div className="max-w-lg space-y-4">
          <Card>
            <CardContent className="pt-5 space-y-3">
              <div>
                <p className="text-sm font-semibold">Bloqueos de disponibilidad</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Bloquea días o franjas horarias concretas. Los clientes no podrán reservar durante esos periodos.
                </p>
              </div>
              <BloqueosForm comercioId={comercio.id} bloqueos={bloqueos} />
            </CardContent>
          </Card>
        </div>
      )}
      
      {/* Pestaña: Horario y empleados */}
      {tab === 'horario' && !comercio && (
        <p className="text-sm text-muted-foreground">
          Primero crea tu negocio en la pestaña <strong>Perfil</strong>.
        </p>
      )}

      {tab === 'horario' && comercio && (
        <div className="max-w-lg space-y-4">
          <Card>
            <CardContent className="pt-5 space-y-3">
              <div>
                <p className="text-sm font-semibold">Empleados</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Cada empleado tiene su propio horario. La capacidad por franja se calcula automáticamente según cuántos coincidan.
                </p>
              </div>
              <EmpleadosForm comercioId={comercio.id} empleados={empleados} />
            </CardContent>
          </Card>

          {/* Horario de apertura */}
          <Card>
            <CardContent className="pt-5 space-y-3">
              <div>
                <p className="text-sm font-semibold">Horario de apertura</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Se muestra en tu página pública. También se usa para calcular los huecos disponibles si no hay empleados configurados.
                </p>
              </div>
              <HorarioForm comercioId={comercio.id} horarios={horarios} />
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}

'use client'

import { useState } from 'react'
import type { ReactNode } from 'react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import type { Servicio, Horario } from '@/lib/type'
import StepService from './step-service'
import StepDateTime from './step-datetime'
import StepContact from './step-contact'
import StepConfirmation from './step-confirmation'

interface Props {
  comercioId: string
  comercioNombre: string
  servicios: Servicio[]
  horarios: Horario[]
  empleados?: number
  autoConfirm?: boolean
  businessFooter?: ReactNode
  demoMode?: boolean
  diasAnticipacion?: number
}

export type BookingState = {
  servicio: Servicio | null
  fecha: string
  hora: string
  nombre: string
  tel: string
}

const STEPS = ['Servicio', 'Fecha y hora', 'Tus datos', 'Confirmación'] as const

export default function BookingFlow({ comercioId, comercioNombre, servicios, horarios, empleados = 1, autoConfirm = true, businessFooter, demoMode = false, diasAnticipacion = 14 }: Props) {
  const supabase = createClient()
  const [step, setStep] = useState(0)
  const [loading, setLoading] = useState(false)
  const [booking, setBooking] = useState<BookingState>({
    servicio: null,
    fecha: '',
    hora: '',
    nombre: '',
    tel: '',
  })

  const update = (data: Partial<BookingState>) =>
    setBooking(b => ({ ...b, ...data }))

  const submit = async () => {
    if (demoMode) {
      setStep(3)
      return
    }
    setLoading(true)
    const citaId = crypto.randomUUID()
    const fechaHora = new Date(`${booking.fecha}T${booking.hora}:00`).toISOString()

    const { error } = await supabase.from('citas').insert({
      id: citaId,
      comercio_id: comercioId,
      servicio_id: booking.servicio!.id,
      cliente_nombre: booking.nombre.trim(),
      cliente_tel: booking.tel.trim(),
      fecha_hora: fechaHora,
      estado: autoConfirm ? 'confirmado' : 'pendiente',
    })

    setLoading(false)
    if (error) {
      if (error.message?.includes('phone_limit_exceeded')) {
        toast.error('Este número ya tiene 3 citas pendientes en este negocio.')
      } else {
        toast.error('No se pudo reservar la cita. Inténtalo de nuevo.')
      }
      return
    }

    if (autoConfirm) {
      fetch('/api/google/sync-cita-auto', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ citaId }),
      }).catch(() => {})

      fetch('/api/whatsapp/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ citaId }),
      }).catch(() => {})
    }

    setStep(3)
  }

  return (
    <div className="space-y-6">
      {/* secciones Servicio, Fecha y hora, Tus datos, Confirmación */}
      {step < 3 && (
        <div className="flex items-center gap-1">
          {STEPS.slice(0, 3).map((label, i) => (
            <div key={label} className="flex items-center gap-1 flex-1 last:flex-none">
              <div className="flex flex-col items-center gap-1">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all ${
                  i < step
                    ? 'bg-primary border-primary text-primary-foreground'
                    : i === step
                    ? 'border-primary text-primary bg-white'
                    : 'border-muted-foreground/30 text-muted-foreground/50'
                }`}>
                  {i < step ? '✓' : i + 1}
                </div>
                <span className={`text-xs hidden sm:block ${i === step ? 'text-primary font-medium' : 'text-muted-foreground'}`}>
                  {label}
                </span>
              </div>
              {i < 2 && (
                <div className={`flex-1 h-0.5 mx-1 mb-4 rounded-full transition-all ${i < step ? 'bg-primary' : 'bg-muted'}`} />
              )}
            </div>
          ))}
        </div>
      )}

      {/* Pantalla Servicio */}
      {step === 0 && (
        <StepService
          servicios={servicios}
          selected={booking.servicio}
          onSelect={s => { update({ servicio: s }); setStep(1) }}
        />
      )}
      
      {/* Pantalla Fecha y hora */}
      {step === 1 && (
        <StepDateTime
          comercioId={comercioId}
          empleados={empleados}
          servicio={booking.servicio!}
          fecha={booking.fecha}
          hora={booking.hora}
          horarios={horarios}
          diasAnticipacion={diasAnticipacion}
          onChange={update}
          onBack={() => setStep(0)}
          onNext={() => setStep(2)}
        />
      )}
    
      {/* Pantalla Tus datos */}
      {step === 2 && (
        <StepContact
          nombre={booking.nombre}
          tel={booking.tel}
          onChange={update}
          onBack={() => setStep(1)}
          onSubmit={submit}
          loading={loading}
          booking={booking}
          comercioNombre={comercioNombre}
        />
      )}
      
      {/* Pantalla Confirmación */}
      {step === 3 && (
        <StepConfirmation 
          booking={booking} 
          comercioNombre={comercioNombre} 
        />
      )}

      {step === 0 && businessFooter}
    </div>
  )
}

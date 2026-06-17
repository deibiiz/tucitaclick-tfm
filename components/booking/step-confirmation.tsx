import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { CheckCircle2, CalendarDays, Clock, Euro } from 'lucide-react'
import Link from 'next/link'
import type { BookingState } from './booking-flow'

interface Props {
  booking: BookingState
  comercioNombre: string
}

export default function StepConfirmation({ booking, comercioNombre }: Props) {
  const fechaLegible = booking.fecha
    ? new Date(booking.fecha + 'T12:00:00').toLocaleDateString('es-ES', {
        weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
      })
    : ''

  return (
    <div className="flex flex-col items-center text-center space-y-6 py-4">
      <div className="p-4 bg-emerald-100 rounded-full">
        <CheckCircle2 className="h-12 w-12 text-emerald-600" />
      </div>

      <div className="space-y-1">
        <h2 className="text-2xl font-bold text-emerald-700">¡Reserva confirmada!</h2>
        <p className="text-muted-foreground text-sm">
          Hemos recibido tu solicitud. El negocio se pondrá en contacto contigo para confirmar.
        </p>
      </div>

      <Card className="w-full text-left border-emerald-200 bg-emerald-50/50">
        <CardContent className="pt-4 pb-4 space-y-2">
          <p className="font-semibold text-sm">{comercioNombre}</p>
          <div className="space-y-1.5 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <CalendarDays className="h-4 w-4 text-emerald-600 shrink-0" />
              <span className="capitalize">{fechaLegible} — {booking.hora}</span>
            </div>
            {booking.servicio && (
              <>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-emerald-600 shrink-0" />
                  <span>{booking.servicio.nombre} ({booking.servicio.duracion} min)</span>
                </div>
                <div className="flex items-center gap-2">
                  <Euro className="h-4 w-4 text-emerald-600 shrink-0" />
                  <span>{booking.servicio.precio.toFixed(2)} €</span>
                </div>
              </>
            )}
          </div>
          <div className="mt-2 pt-2 border-t border-emerald-200">
            <p className="text-xs text-muted-foreground">
              Nombre: <span className="font-medium text-foreground">{booking.nombre}</span>
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="flex flex-col gap-3 w-full">
        <Button variant="outline" className="w-full" render={<Link href="/" />}>
          Volver al inicio
        </Button>
      </div>
    </div>
  )
}

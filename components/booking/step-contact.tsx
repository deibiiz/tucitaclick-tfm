import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { ChevronLeft, Loader2, CalendarDays, Clock, Euro } from 'lucide-react'
import type { BookingState } from './booking-flow'

interface Props {
  nombre: string
  tel: string
  onChange: (data: Partial<BookingState>) => void
  onBack: () => void
  onSubmit: () => void
  loading: boolean
  booking: BookingState
  comercioNombre: string
}

function isValidPhone(tel: string): boolean {
  const digits = tel.replace(/[\s\-().+]/g, '')
  return /^\d{9,15}$/.test(digits)
}

export default function StepContact({ nombre, tel, onChange, onBack, onSubmit, loading, booking, comercioNombre }: Props) {
  const fechaLegible = booking.fecha
    ? new Date(booking.fecha + 'T12:00:00').toLocaleDateString('es-ES', {
        weekday: 'long', day: 'numeric', month: 'long'
      })
    : ''

  const nombreError = nombre.trim().length > 0 && nombre.trim().length < 2
    ? 'El nombre debe tener al menos 2 caracteres.'
    : ''

  const telError = tel.trim().length > 0 && !isValidPhone(tel)
    ? 'Formato incorrecto. Ej: 612 345 678 o +34 612 345 678'
    : ''

  const canSubmit = nombre.trim().length >= 2 && isValidPhone(tel) && !loading

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-lg font-semibold">Tus datos de contacto</h2>
        <p className="text-sm text-muted-foreground">Para confirmar tu reserva</p>
      </div>

      {/* Tarjeta resumen */}
      <Card className="bg-primary/5 border-primary/20">
        <CardContent className="pt-4 pb-4 space-y-1.5">
          <p className="text-sm font-medium text-primary">{comercioNombre}</p>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <CalendarDays className="h-3.5 w-3.5 shrink-0" />
            <span className="capitalize">{fechaLegible} a las {booking.hora}</span>
          </div>
          {booking.servicio && (
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <span className="font-medium text-foreground">{booking.servicio.nombre}</span>
              <span className="flex items-center gap-0.5"><Clock className="h-3 w-3" />{booking.servicio.duracion} min</span>
              <span className="flex items-center gap-0.5"><Euro className="h-3 w-3" />{booking.servicio.precio.toFixed(2)}</span>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="nombre">Tu nombre</Label>
          <Input
            id="nombre"
            placeholder="María García"
            required
            value={nombre}
            onChange={e => onChange({ nombre: e.target.value })}
            aria-describedby={nombreError ? 'nombre-error' : undefined}
            className={nombreError ? 'border-destructive' : ''}
          />
          {nombreError && (
            <p id="nombre-error" className="text-xs text-destructive">{nombreError}</p>
          )}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="tel">Número de WhatsApp</Label>
          <Input
            id="tel"
            type="tel"
            placeholder="+34 612 345 678"
            required
            value={tel}
            onChange={e => onChange({ tel: e.target.value })}
            aria-describedby={telError ? 'tel-error' : 'tel-hint'}
            className={telError ? 'border-destructive' : ''}
          />
          {telError
            ? <p id="tel-error" className="text-xs text-destructive">{telError}</p>
            : <p id="tel-hint" className="text-xs text-muted-foreground">Te enviaremos la confirmación por WhatsApp.</p>
          }
        </div>
      </div>

      <div className="flex gap-3 pt-2">
        <Button variant="outline" onClick={onBack} disabled={loading} className="flex items-center gap-1.5">
          <ChevronLeft className="h-4 w-4" /> Atrás
        </Button>
        <Button
          className="flex-1"
          disabled={!canSubmit}
          onClick={onSubmit}
        >
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Confirmar reserva
        </Button>
      </div>
    </div>
  )
}

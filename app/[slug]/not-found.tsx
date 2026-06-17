import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { CalendarX } from 'lucide-react'

export default function BookingNotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center px-4 gap-4">
      <CalendarX className="h-12 w-12 text-muted-foreground" />
      <h1 className="text-2xl font-bold">Negocio no encontrado</h1>
      <p className="text-muted-foreground max-w-xs">
        La página de reservas que buscas no existe o ha cambiado de dirección.
      </p>
      <Button render={<Link href="/" />}>Volver al inicio</Button>
    </div>
  )
}

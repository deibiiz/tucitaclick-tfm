import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { CalendarCheck, Clock, Smartphone, Star } from 'lucide-react'

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-full">
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CalendarCheck className="h-6 w-6 text-primary" />
            <span className="font-bold text-lg tracking-tight">TuCitaClick</span>
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" className="hidden sm:inline-flex" render={<Link href="/login" />}>
              Iniciar sesión
            </Button>
            <Button render={<Link href="/login?tab=register" />}>
              <span className="sm:hidden">Comenzar gratis</span>
              <span className="hidden sm:inline">Crear cuenta gratis</span>
            </Button>
          </div>
        </div>
      </header>

      <section className="flex-1 flex flex-col items-center justify-center text-center px-4 py-24 bg-gradient-to-b from-accent/40 via-background to-background">
        <div className="max-w-3xl mx-auto space-y-6">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary text-sm font-medium px-4 py-1.5 rounded-full">
            <Star className="h-3.5 w-3.5" />
            Reservas online en minutos
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-foreground leading-tight">
            Tu negocio merece{' '}
            <span className="text-primary">citas inteligentes</span>
          </h1>
          <p className="text-lg sm:text-xl text-muted-foreground max-w-xl mx-auto">
            Crea tu página de reservas personalizada, gestiona tus citas desde el móvil y deja que tus clientes reserven 24/7 sin llamadas.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
            <Button size="lg" className="text-base h-12 px-8" render={<Link href="/login?tab=register" />}>
              Empieza gratis →
            </Button>
            <Button size="lg" variant="outline" className="text-base h-12 px-8" render={<Link href="/demo" />}>
              Ver demo
            </Button>
          </div>
        </div>
      </section>

      <section className="py-20 px-4 bg-white border-t">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12 text-foreground">
            Todo lo que necesitas, sin complicaciones
          </h2>
          <div className="grid sm:grid-cols-3 gap-8">
            {[
              {
                icon: CalendarCheck,
                title: 'Reservas automáticas',
                desc: 'Tu cliente elige el servicio, la fecha y listo. Tú recibes la cita confirmada.',
              },
              {
                icon: Smartphone,
                title: 'WhatsApp integrado',
                desc: 'Guarda el teléfono de cada cliente para hacer seguimiento directo por WhatsApp.',
              },
              {
                icon: Clock,
                title: 'Gestión en tiempo real',
                desc: 'Confirma o cancela citas desde tu panel con un solo clic.',
              },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="flex flex-col items-start gap-3 p-6 rounded-xl border bg-background hover:shadow-md transition-shadow">
                <div className="p-2.5 bg-primary/10 rounded-lg">
                  <Icon className="h-5 w-5 text-primary" />
                </div>
                <h3 className="font-semibold text-lg">{title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 px-4 bg-primary text-primary-foreground text-center">
        <div className="max-w-2xl mx-auto space-y-4">
          <h2 className="text-3xl font-bold">¿Listo para empezar?</h2>
          <p className="text-primary-foreground/80">
            Crea tu cuenta gratis y ten tu página de reservas lista en menos de 5 minutos.
          </p>
          <Button size="lg" variant="secondary" className="h-12 px-8 text-base mt-2" render={<Link href="/login?tab=register" />}>
            Crear mi cuenta →
          </Button>
        </div>
      </section>

      <footer className="border-t bg-white">
        <div className="max-w-6xl mx-auto px-4 py-12">
          <div className="grid sm:grid-cols-3 gap-10 mb-10">

            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <CalendarCheck className="h-5 w-5 text-primary" />
                <span className="font-bold text-base">TuCitaClick</span>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                La forma más sencilla de gestionar citas online para tu negocio local.
              </p>
            </div>

            <div className="space-y-3">
              <h4 className="text-sm font-semibold text-foreground">Producto</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link href="/" className="hover:text-primary transition-colors">
                    Inicio
                  </Link>
                </li>
                <li>
                  <Link href="/demo" className="hover:text-primary transition-colors">
                    Ver demo
                  </Link>
                </li>
                <li>
                  <Link href="/login?tab=register" className="hover:text-primary transition-colors">
                    Crear cuenta gratis
                  </Link>
                </li>
                <li>
                  <Link href="/login" className="hover:text-primary transition-colors">
                    Iniciar sesión
                  </Link>
                </li>
              </ul>
            </div>

            <div className="space-y-3">
              <h4 className="text-sm font-semibold text-foreground">Legal</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link href="/privacidad" className="hover:text-primary transition-colors">
                    Política de privacidad
                  </Link>
                </li>
                <li>
                  <Link href="/terminos" className="hover:text-primary transition-colors">
                    Términos de uso
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="pt-6 border-t flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-muted-foreground">
            <p>© {new Date().getFullYear()} TuCitaClick. Hecho con cariño para negocios locales.</p>
            <p>Reservas online · Siempre gratis para empezar</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

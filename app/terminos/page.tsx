import Link from 'next/link'
import { CalendarCheck } from 'lucide-react'

export const metadata = {
  title: 'Términos y Condiciones — TuCitaClick',
}

export default function TerminosPage() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-white sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 h-14 flex items-center gap-2">
          <Link href="/" className="flex items-center gap-2 text-foreground hover:text-primary transition-colors">
            <CalendarCheck className="h-5 w-5 text-primary" />
            <span className="font-bold">TuCitaClick</span>
          </Link>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-10 space-y-8 text-sm leading-relaxed text-foreground">
        <div>
          <h1 className="text-2xl font-bold mb-1">Términos y Condiciones</h1>
          <p className="text-muted-foreground text-xs">Última actualización: abril de 2025</p>
        </div>

        <Section title="1. Descripción del servicio">
          <p>
            TuCitaClick es una plataforma de gestión de citas online que permite a negocios locales (peluquerías,
            clínicas, centros de estética, etc.) publicar su agenda y recibir reservas de sus clientes.
          </p>
        </Section>

        <Section title="2. Registro y cuenta">
          <p>
            Para usar el panel de gestión es necesario crear una cuenta con un email y contraseña válidos.
            Eres responsable de mantener la confidencialidad de tus credenciales y de todas las actividades
            realizadas bajo tu cuenta. Notifícanos de inmediato cualquier uso no autorizado.
          </p>
        </Section>

        <Section title="3. Uso aceptable">
          <p>Te comprometes a:</p>
          <ul className="list-disc pl-5 space-y-1 mt-2">
            <li>Proporcionar información veraz al configurar tu negocio.</li>
            <li>No usar la plataforma para actividades ilegales, fraudulentas o que perjudiquen a terceros.</li>
            <li>No realizar reservas falsas ni manipular la disponibilidad de forma malintencionada.</li>
            <li>No intentar acceder a cuentas ajenas ni realizar ingeniería inversa sobre el servicio.</li>
          </ul>
        </Section>

        <Section title="4. Reservas y responsabilidad del comercio">
          <p>
            TuCitaClick facilita el contacto entre cliente y negocio, pero no es parte del contrato de prestación
            de servicios entre ambos. El Comercio es el único responsable de cumplir las citas confirmadas,
            gestionar cancelaciones y resolver cualquier incidencia con sus clientes.
          </p>
        </Section>

        <Section title="5. Disponibilidad del servicio">
          <p>
            TuCitaClick se ofrece «tal cual» y no garantiza disponibilidad ininterrumpida. Pueden producirse
            interrupciones por mantenimiento, actualizaciones o causas ajenas a nuestro control. No nos
            responsabilizamos de pérdidas derivadas de interrupciones del servicio.
          </p>
        </Section>

        <Section title="6. Propiedad intelectual">
          <p>
            El código, diseño, marca y contenidos de TuCitaClick son propiedad de sus creadores. El Comercio
            conserva la propiedad de los contenidos que suba (logo, fotos, descripción). Al subirlos, nos
            otorga una licencia no exclusiva para mostrarlos dentro de la plataforma.
          </p>
        </Section>

        <Section title="7. Cancelación de cuenta">
          <p>
            Puedes cancelar tu cuenta en cualquier momento. Tras la cancelación, tus datos se eliminarán
            conforme a lo establecido en la Política de Privacidad, salvo las obligaciones legales de
            conservación que apliquen.
          </p>
        </Section>

        <Section title="8. Modificaciones">
          <p>
            Nos reservamos el derecho de modificar estos términos. Si los cambios son sustanciales, lo
            notificaremos por email con al menos 15 días de antelación. El uso continuado del servicio
            tras la notificación implica la aceptación de los nuevos términos.
          </p>
        </Section>

        <Section title="9. Legislación aplicable">
          <p>
            Estos términos se rigen por la legislación española. Para cualquier controversia, las partes
            se someten a los juzgados y tribunales del domicilio del usuario, salvo que la ley establezca
            otro fuero imperativo.
          </p>
        </Section>

        <div className="pt-4 border-t text-muted-foreground text-xs">
          <Link href="/" className="hover:text-primary transition-colors">← Volver al inicio</Link>
        </div>
      </main>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-2">
      <h2 className="text-base font-semibold">{title}</h2>
      <div className="text-muted-foreground space-y-2">{children}</div>
    </section>
  )
}

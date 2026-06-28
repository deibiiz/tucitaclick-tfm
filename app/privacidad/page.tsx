import Link from 'next/link'
import { CalendarCheck } from 'lucide-react'

export const metadata = {
  title: 'Política de Privacidad — TuCitaClick',
}

export default function PrivacidadPage() {
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
          <h1 className="text-2xl font-bold mb-1">Política de Privacidad</h1>
          <p className="text-muted-foreground text-xs">Última actualización: abril de 2025</p>
        </div>

        <Section title="1. Responsable del tratamiento">
          <p>
            El responsable del tratamiento de los datos personales recabados a través de TuCitaClick es el titular
            de la cuenta de comercio correspondiente. TuCitaClick actúa como encargado
            del tratamiento, procesando los datos en nombre y por cuenta del Comercio.
          </p>
        </Section>

        <Section title="2. Datos que recogemos">
          <p>Recogemos los siguientes datos según el rol del usuario:</p>
          <ul className="list-disc pl-5 space-y-1 mt-2">
            <li><strong>Clientes que realizan una reserva:</strong> nombre, número de teléfono (WhatsApp), servicio elegido, fecha y hora de la cita.</li>
            <li><strong>Dueños de comercio:</strong> dirección de email, contraseña (cifrada), nombre del negocio, slug (URL personalizada), descripción, teléfono, dirección, foto de portada y horarios de atención.</li>
          </ul>
        </Section>

        <Section title="3. Finalidad del tratamiento">
          <ul className="list-disc pl-5 space-y-1">
            <li>Gestionar y confirmar las reservas realizadas en la plataforma.</li>
            <li>Permitir al Comercio gestionar su agenda, citas y configuración.</li>
            <li>Enviar confirmaciones o recordatorios de cita (si el Comercio así lo configura).</li>
            <li>Mantener la seguridad y el correcto funcionamiento del servicio.</li>
          </ul>
        </Section>

        <Section title="4. Base legal">
          <p>
            El tratamiento se basa en la ejecución de un contrato o relación precontractual (art. 6.1.b RGPD)
            para la gestión de reservas, y en el interés legítimo del Comercio para administrar su negocio.
            Los datos de dueños de comercio se tratan con base en el consentimiento otorgado al registrarse.
          </p>
        </Section>

        <Section title="5. Conservación de los datos">
          <p>
            Los datos de reservas se conservan mientras el Comercio mantenga su cuenta activa. Los datos de
            los dueños de comercio se conservan durante la vigencia de la cuenta y, una vez cancelada, durante
            el plazo legalmente establecido para cumplir obligaciones fiscales o legales.
          </p>
        </Section>

        <Section title="6. Destinatarios y transferencias">
          <p>
            Los datos se almacenan en servidores de <strong>Supabase</strong> (proveedor de base de datos en la nube
            con sede en EE. UU., cubierto por mecanismos de transferencia adecuados conforme al RGPD). No se
            ceden datos a terceros salvo obligación legal.
          </p>
        </Section>

        <Section title="7. Derechos del usuario">
          <p>Puedes ejercer en cualquier momento los siguientes derechos:</p>
          <ul className="list-disc pl-5 space-y-1 mt-2">
            <li><strong>Acceso:</strong> conocer qué datos tenemos sobre ti.</li>
            <li><strong>Rectificación:</strong> corregir datos inexactos o incompletos.</li>
            <li><strong>Supresión:</strong> solicitar la eliminación de tus datos («derecho al olvido»).</li>
            <li><strong>Oposición y limitación:</strong> oponerte al tratamiento o limitarlo en determinados casos.</li>
            <li><strong>Portabilidad:</strong> recibir tus datos en formato estructurado y de uso común.</li>
          </ul>
          <p className="mt-2">
            Para ejercer estos derechos, contacta con el Comercio que gestionó tu reserva o escríbenos a través
            del canal de contacto disponible en la plataforma. Tienes derecho a presentar una reclamación ante
            la <a href="https://www.aepd.es" target="_blank" rel="noopener noreferrer" className="text-primary underline">Agencia Española de Protección de Datos (AEPD)</a>.
          </p>
        </Section>

        <Section title="8. Cookies">
          <p>
            TuCitaClick utiliza únicamente cookies técnicas de sesión necesarias para el funcionamiento de la
            autenticación. No se utilizan cookies de seguimiento ni publicidad.
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

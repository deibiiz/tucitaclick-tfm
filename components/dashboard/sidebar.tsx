'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { CalendarCheck, CalendarDays, Settings, Wrench, LogOut, Menu, X, Megaphone, BarChart2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'
import { useState } from 'react'
import { toast } from 'sonner'

const navItems = [
  { href: '/citas', label: 'Citas', icon: CalendarDays },
  { href: '/servicios', label: 'Servicios', icon: Wrench },
  { href: '/publicaciones', label: 'Publicaciones', icon: Megaphone },
  { href: '/analitica', label: 'Analítica', icon: BarChart2 },
  { href: '/configuracion', label: 'Configuración', icon: Settings },
]

export default function DashboardSidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()
  const [mobileOpen, setMobileOpen] = useState(false)

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut()
    if (error) { toast.error(error.message); return }
    router.push('/')
    router.refresh()
  }

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      <div className="px-4 py-5 border-b">
        <Link href="/citas" className="flex items-center gap-2.5 font-bold text-lg text-foreground" onClick={() => setMobileOpen(false)}>
          <CalendarCheck className="h-5 w-5 text-primary" />
          TuCitaClick
        </Link>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            onClick={() => setMobileOpen(false)}
            className={cn(
              'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
              pathname.startsWith(href)
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
            )}
          >
            <Icon className="h-4 w-4 shrink-0" />
            {label}
          </Link>
        ))}
      </nav>

      <div className="px-3 py-4 border-t">
        <button
          className="flex w-full items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
          onClick={handleLogout}
        >
          <LogOut className="h-4 w-4 shrink-0" />
          Cerrar sesión
        </button>
      </div>
    </div>
  )

  return (
    <>
      {/* barra lateral para ordenador */}
      <aside className="hidden md:flex md:w-60 shrink-0 flex-col border-r bg-card">
        <SidebarContent />
      </aside>

      {/* barra superior móvil */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-40 bg-card border-b px-4 h-14 flex items-center justify-between">
        <Link href="/citas" className="flex items-center gap-2 font-bold text-base">
          <CalendarCheck className="h-5 w-5 text-primary" />
          TuCitaClick
        </Link>
        <button onClick={() => setMobileOpen(!mobileOpen)} className="p-1.5 rounded-lg hover:bg-accent transition-colors">
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* barra desplegable móvil */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-30 flex">
          <div className="w-64 bg-card border-r flex flex-col pt-14">
            <SidebarContent />
          </div>
          <div className="flex-1 bg-black/40" onClick={() => setMobileOpen(false)} />
        </div>
      )}
      <div className="md:hidden h-14 shrink-0" />
    </>
  )
}

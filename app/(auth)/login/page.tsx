import { Suspense } from 'react'
import LoginForm from './login-form'
import { CalendarCheck } from 'lucide-react'
import Link from 'next/link'

export default function LoginPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-muted/40 px-4">
      <Link href="/" className="flex items-center gap-2 mb-8 text-foreground hover:text-primary transition-colors">
        <CalendarCheck className="h-6 w-6 text-primary" />
        <span className="font-bold text-xl tracking-tight">TuCitaClick</span>
      </Link>
      <Suspense fallback={<div className="w-full max-w-sm h-80 bg-card rounded-xl animate-pulse" />}>
        <LoginForm />
      </Suspense>
    </div>
  )
}

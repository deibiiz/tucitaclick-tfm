'use client'

import {
  ResponsiveContainer, ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, BarChart, PieChart, Pie, Cell,
} from 'recharts'

// Tipos

export type MonthlyPoint   = { mes: string; citas: number; confirmadas: number; ingresos: number }
export type DiaPoint       = { dia: string; citas: number }
export type HoraPoint      = { hora: string; citas: number }
export type EstadoPoint    = { name: string; value: number; color: string }
export type ServicioPoint  = { nombre: string; citas: number; ingresos: number }

// Paleta colores

const C = {
  primary:  '#3b82f6',
  green:    '#22c55e',
  amber:    '#f59e0b',
  red:      '#ef4444',
  slate:    '#94a3b8',
  indigo:   '#6366f1',
}

// Formatear

const fmtEur = (v: number) => `${v.toFixed(0)} €`

const TooltipBox = ({ active, payload, label }: { active?: boolean; payload?: { name: string; value: number; color: string }[]; label?: string }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-lg border bg-popover px-3 py-2 text-sm shadow-md">
      {label && <p className="font-medium mb-1">{label}</p>}
      {payload.map(p => (
        <p key={p.name} style={{ color: p.color }}>
          {p.name}: <span className="font-semibold">{typeof p.value === 'number' && p.name.toLowerCase().includes('ingreso') ? fmtEur(p.value) : p.value}</span>
        </p>
      ))}
    </div>
  )
}

// Gráfico: evolución mensual

export function EvolucionMensual({ data }: { data: MonthlyPoint[] }) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <ComposedChart data={data} margin={{ top: 4, right: 20, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
        <XAxis dataKey="mes" tick={{ fontSize: 11 }} />
        <YAxis yAxisId="left" tick={{ fontSize: 11 }} allowDecimals={false} />
        <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11 }} tickFormatter={fmtEur} />
        <Tooltip content={<TooltipBox />} />
        <Legend wrapperStyle={{ fontSize: 12 }} />
        <Bar yAxisId="left" dataKey="citas" name="Citas totales" fill={C.primary} opacity={0.7} radius={[3, 3, 0, 0]} />
        <Bar yAxisId="left" dataKey="confirmadas" name="Confirmadas" fill={C.green} opacity={0.8} radius={[3, 3, 0, 0]} />
        <Line yAxisId="right" type="monotone" dataKey="ingresos" name="Ingresos (€)" stroke={C.amber} strokeWidth={2} dot={false} />
      </ComposedChart>
    </ResponsiveContainer>
  )
}

// Gráfico: citas por día de la semana

export function CitasPorDia({ data }: { data: DiaPoint[] }) {
  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={data} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
        <XAxis dataKey="dia" tick={{ fontSize: 11 }} />
        <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
        <Tooltip content={<TooltipBox />} />
        <Bar dataKey="citas" name="Citas" fill={C.indigo} radius={[3, 3, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}

// Gráfico: citas por hora del día 

export function CitasPorHora({ data }: { data: HoraPoint[] }) {
  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={data} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
        <XAxis dataKey="hora" tick={{ fontSize: 10 }} interval={1} />
        <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
        <Tooltip content={<TooltipBox />} />
        <Bar dataKey="citas" name="Citas" fill={C.primary} radius={[3, 3, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}

// Gráfico: distribución de estados 

export function DistribucionEstados({ data }: { data: EstadoPoint[] }) {
  const RADIAN = Math.PI / 180
  const renderLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: { cx: number; cy: number; midAngle: number; innerRadius: number; outerRadius: number; percent: number }) => {
    if (percent < 0.05) return null
    const r = innerRadius + (outerRadius - innerRadius) * 0.5
    const x = cx + r * Math.cos(-midAngle * RADIAN)
    const y = cy + r * Math.sin(-midAngle * RADIAN)
    return <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize={12} fontWeight="600">{`${(percent * 100).toFixed(0)}%`}</text>
  }

  return (
    <ResponsiveContainer width="100%" height={220}>
      <PieChart>
        <Pie data={data} cx="50%" cy="50%" innerRadius={55} outerRadius={90} dataKey="value" nameKey="name" labelLine={false} label={{ position: 'right', fontSize: 11 }}>
          {data.map((entry, i) => <Cell key={i} fill={entry.color} />)}
        </Pie>
        <Tooltip formatter={(value, name) => [value, name]} />
        <Legend wrapperStyle={{ fontSize: 12 }} />
      </PieChart>
    </ResponsiveContainer>
  )
}

// Gráfico: top servicios

export function TopServicios({ data }: { data: ServicioPoint[] }) {
  return (
    <ResponsiveContainer width="100%" height={Math.max(180, data.length * 40)}>
      <BarChart data={data} layout="vertical" margin={{ top: 4, right: 60, left: 8, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
        <XAxis type="number" tick={{ fontSize: 11 }} allowDecimals={false} />
        <YAxis type="category" dataKey="nombre" tick={{ fontSize: 11 }} width={100} />
        <Tooltip content={<TooltipBox />} />
        <Bar dataKey="citas" name="Citas" fill={C.green} radius={[0, 3, 3, 0]} label={{ position: 'right', fontSize: 11 }} />
      </BarChart>
    </ResponsiveContainer>
  )
}

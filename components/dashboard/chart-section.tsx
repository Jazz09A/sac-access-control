'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts'
import { HourlyData } from '@/types'

interface ChartSectionProps {
  data: HourlyData[]
  title?: string
}

export function ChartSection({ data, title = 'Visitantes por Hora' }: ChartSectionProps) {
  return (
    <Card className="bg-white/[0.03] py-5">
      <CardHeader className="pb-0">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
              Flujo operativo
            </p>
            <CardTitle className="mt-2 text-xl font-medium tracking-tight">{title}</CardTitle>
          </div>
          <div className="rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-[10px] font-medium uppercase tracking-[0.18em] text-primary">
            Hoy
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" vertical={false} />
            <XAxis
              dataKey="hour"
              stroke="rgba(212,214,222,0.65)"
              style={{ fontSize: '12px' }}
            />
            <YAxis
              stroke="rgba(212,214,222,0.65)"
              style={{ fontSize: '12px' }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'rgba(22, 23, 27, 0.96)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: '14px',
                color: 'white'
              }}
            />
            <Legend wrapperStyle={{ fontSize: '12px' }} />
            <Line
              type="monotone"
              dataKey="visits"
              stroke="var(--primary)"
              strokeWidth={3}
              dot={{ fill: 'var(--primary)', r: 0 }}
              activeDot={{ r: 6, fill: 'var(--primary)', stroke: '#0f1114', strokeWidth: 2 }}
              name="Visitas"
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}

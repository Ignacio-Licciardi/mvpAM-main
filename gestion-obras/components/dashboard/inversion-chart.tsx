"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip } from "@/components/ui/chart"
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts"
import { useEffect, useState } from "react"
import { dashboardApi } from "@/lib/api"
import type { InversionPorRubro } from "@/types"

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#aa66cc", "#6699cc"]

const chartConfig = {
  inversion: {
    label: "Inversión",
  },
}

export function InversionChart() {
  const [data, setData] = useState<InversionPorRubro[]>([])

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await dashboardApi.getInversionPorRubro()
        if (res.data.success) {
          setData(res.data.data)
        }
      } catch (e) {
        console.error("Error fetching inversion por rubro", e)
      }
    }
    fetchData()
  }, [])

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: "ARS",
      minimumFractionDigits: 0,
    }).format(value)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Inversión por Rubro</CardTitle>
        <CardDescription>Distribución de la inversión total por rubro</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ rubro, percent }) =>
                  `${rubro} ${((percent ?? 0) * 100).toFixed(0)}%`
                }
                outerRadius={80}
                fill="#8884d8"
                dataKey="inversion"
              >
                {data.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <ChartTooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload
                    return (
                      <div className="rounded-lg border bg-background p-2 shadow-sm">
                        <div className="grid grid-cols-2 gap-2">
                          <div className="flex flex-col">
                            <span className="text-[0.70rem] uppercase text-muted-foreground">Rubro</span>
                            <span className="font-bold text-muted-foreground">{data.rubro}</span>
                          </div>
                          <div className="flex flex-col">
                            <span className="text-[0.70rem] uppercase text-muted-foreground">Inversión</span>
                            <span className="font-bold">{formatCurrency(data.inversion)}</span>
                          </div>
                        </div>
                      </div>
                    )
                  }
                  return null
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}

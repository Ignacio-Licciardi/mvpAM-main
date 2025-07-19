"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer } from "recharts"
import { useEffect, useState } from "react"
import { dashboardApi } from "@/lib/api"
import type { ObrasPorEstado } from "@/types"

const chartConfig = {
  cantidad: {
    label: "Cantidad de Obras",
    color: "hsl(var(--chart-1))",
  },
}

export function ObrasChart() {
  const [data, setData] = useState<ObrasPorEstado[]>([])

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await dashboardApi.getObrasPorEstado()
        if (res.data.success) {
          setData(res.data.data)
        }
      } catch (e) {
        console.error("Error fetching obras por estado", e)
      }
    }
    fetchData()
  }, [])
  return (
    <Card>
      <CardHeader>
        <CardTitle>Obras por Estado</CardTitle>
        <CardDescription>Distribución actual de obras según su estado</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data}>
              <XAxis dataKey="estado" tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
              <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
              <Bar dataKey="cantidad" fill="var(--color-cantidad)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}

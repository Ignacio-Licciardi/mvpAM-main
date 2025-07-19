"use client"

import { useState, useEffect } from "react"
import { MainLayout } from "@/components/layout/main-layout"
import { StatCard } from "@/components/dashboard/stat-card"
import { ObrasChart } from "@/components/dashboard/obras-chart"
import { InversionChart } from "@/components/dashboard/inversion-chart"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Building2, FileText, DollarSign, AlertTriangle, Eye, Edit } from "lucide-react"
import Link from "next/link"
import { dashboardApi, obrasApi, riesgosApi } from "@/lib/api"
import type { DashboardStats, Obra, RiesgoTecnico } from "@/types"

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalObras: 0,
    planesActivos: 0,
    inversionTotal: 0,
    riesgosPendientes: 0
  })
  const [obrasRecientes, setObrasRecientes] = useState<Obra[]>([])
  const [riesgosPendientes, setRiesgosPendientes] = useState<RiesgoTecnico[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true)

        // Obtener estadísticas del dashboard
        const statsResponse = await dashboardApi.getStats()
        if (statsResponse.data.success) {
          setStats(statsResponse.data.data)
        }

        // Obtener obras recientes (primeras 2)
        const obrasResponse = await obrasApi.getAll()
        if (obrasResponse.data.content) {
          setObrasRecientes(obrasResponse.data.content.slice(0, 2))
        }

        // Obtener riesgos pendientes (primeros 2)
        const riesgosResponse = await riesgosApi.getAll()
        if (riesgosResponse.data.content) {
          setRiesgosPendientes(riesgosResponse.data.content.slice(0, 2))
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [])

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: "ARS",
      minimumFractionDigits: 0,
    }).format(value)
  }

  if (loading) {
    return (
      <MainLayout>
        <div className="space-y-6">
          <div className="text-center">
            <p>Cargando datos del dashboard...</p>
          </div>
        </div>
      </MainLayout>
    )
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">Resumen general del sistema de gestión de obras</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Total de Obras"
            value={stats.totalObras}
            description="Obras registradas en el sistema"
            icon={Building2}
            trend={{ value: 12, isPositive: true }}
          />
          <StatCard
            title="Planes Activos"
            value={stats.planesActivos}
            description="Planes en ejecución"
            icon={FileText}
            trend={{ value: 8, isPositive: true }}
          />
          <StatCard
            title="Inversión Total"
            value={formatCurrency(stats.inversionTotal)}
            description="Inversión total acumulada"
            icon={DollarSign}
            trend={{ value: 15, isPositive: true }}
          />
          <StatCard
            title="Riesgos Pendientes"
            value={stats.riesgosPendientes}
            description="Riesgos que requieren atención"
            icon={AlertTriangle}
            trend={{ value: 5, isPositive: false }}
          />
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <ObrasChart />
          <InversionChart />
        </div>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Obras Recientes */}
          <Card>
            <CardHeader>
              <CardTitle>Obras Recientes</CardTitle>
              <CardDescription>Últimas obras registradas en el sistema</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {obrasRecientes.map((obra) => (
                  <div key={obra.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <h4 className="font-medium">{obra.nombreObra}</h4>
                      <p className="text-sm text-gray-500">
                        Obra N° {obra.nroObra} - {obra.localidad.nombreLocalidad}
                      </p>
                      <p className="text-sm font-medium text-green-600">
                        {formatCurrency(obra.inversionFinal)}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" asChild>
                        <Link href={`/obras/${obra.id}`}>
                          <Eye className="h-4 w-4" />
                        </Link>
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Riesgos Pendientes */}
          <Card>
            <CardHeader>
              <CardTitle>Riesgos Pendientes</CardTitle>
              <CardDescription>Riesgos que requieren atención inmediata</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {riesgosPendientes.map((riesgo) => (
                  <div key={riesgo.id} className="p-4 border rounded-lg">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <Badge variant="destructive">Riesgo #{riesgo.nroRiesgo}</Badge>
                        </div>
                        <h4 className="font-medium mt-2">{riesgo.naturalezaRiesgo}</h4>
                        <p className="text-sm text-gray-500 mt-1">
                          Obra: {riesgo.obra?.nombreObra || "Sin obra asignada"}
                        </p>
                      </div>
                      <Button size="sm" variant="outline" asChild>
                        <Link href={`/riesgos`}>
                          <Eye className="h-4 w-4" />
                        </Link>
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  )
}

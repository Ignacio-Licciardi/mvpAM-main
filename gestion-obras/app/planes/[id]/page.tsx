"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { MainLayout } from "@/components/layout/main-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Edit } from "lucide-react"
import Link from "next/link"
import { planesApi } from "@/lib/api"
import type { PlanProyecto } from "@/types"

export default function PlanDetailPage() {
  const params = useParams()
  const id = Number.parseInt(params.id as string)

  const [plan, setPlan] = useState<PlanProyecto | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchPlan = async () => {
      try {
        setLoading(true)
        const res = await planesApi.getById(id)
        if (res.data.success) setPlan(res.data.data)
      } catch (error) {
        console.error("Error fetching plan:", error)
      } finally {
        setLoading(false)
      }
    }

    if (id) fetchPlan()
  }, [id])

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS", minimumFractionDigits: 0 }).format(value)
  }

  if (loading) {
    return (
      <MainLayout>
        <div className="text-center py-12">
          <p>Cargando datos del plan...</p>
        </div>
      </MainLayout>
    )
  }

  if (!plan) {
    return (
      <MainLayout>
        <div className="text-center py-12">
          <p>Plan no encontrado</p>
          <Button asChild className="mt-4">
            <Link href="/planes">Volver a Planes</Link>
          </Button>
        </div>
      </MainLayout>
    )
  }

  const prioridadText = {
    UNO: "Alta",
    DOS: "Media-Alta",
    TRES: "Media",
    CUATRO: "Baja"
  }[plan.prioridad]

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/planes">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Volver
              </Link>
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{plan.nombrePlanProyecto}</h1>
              <p className="text-gray-600">Plan de proyecto</p>
            </div>
          </div>
          <Button asChild>
            <Link href={`/planes/${id}/editar`}>
              <Edit className="mr-2 h-4 w-4" />
              Editar
            </Link>
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Información General</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p>{plan.descripcionPlanProyecto}</p>
              <div className="flex gap-2">
                <Badge>{prioridadText}</Badge>
                <Badge variant={plan.seEjecuta ? "default" : "secondary"}>{plan.seEjecuta ? "Activo" : "Inactivo"}</Badge>
              </div>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                <div>
                  <span className="text-sm text-gray-500">Rubro</span>
                  <p className="font-medium">{plan.rubro.nombreRubro}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-500">Inversión Estimada</span>
                  <p className="font-medium text-green-600">{formatCurrency(plan.inversionEstimada)}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-500">Tiempo Estimado</span>
                  <p className="font-medium">{plan.tiempoEstimado} meses</p>
                </div>
                <div>
                  <span className="text-sm text-gray-500">Meses de Estudio</span>
                  <p className="font-medium">{plan.mesesEstudio} meses</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  )
}


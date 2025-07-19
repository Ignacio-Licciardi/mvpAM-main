"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { MainLayout } from "@/components/layout/main-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Edit, ArrowLeft, Eye, AlertTriangle } from "lucide-react"
import Link from "next/link"
import { obrasApi } from "@/lib/api"
import type { Obra, PlanProyecto, RiesgoTecnico, ObraEstadoObra } from "@/types"

export default function ObraDetailPage() {
  const params = useParams()
  const id = Number.parseInt(params.id as string)

  const [obra, setObra] = useState<Obra | null>(null)
  const [plan, setPlan] = useState<PlanProyecto | null>(null)
  const [riesgos, setRiesgos] = useState<RiesgoTecnico[]>([])
  const [estadosHistorial, setEstadosHistorial] = useState<ObraEstadoObra[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchObraData = async () => {
      try {
        setLoading(true)

        // Obtener datos de la obra junto con sus relaciones
        const obraResponse = await obrasApi.getById(id)
        if (obraResponse.data.success) {
          const data = obraResponse.data.data
          setObra(data)
          setPlan(data.planProyecto || null)
          setRiesgos(
            data.obraRiesgos && data.obraRiesgos.length > 0
              ? data.obraRiesgos.map(or => or.riesgoTecnico)
              : []
          )
          // el backend expone la lista como "obraEstadoObras"
          setEstadosHistorial(data.obraEstadoObras || data.obraEstadoObra || [])
        }

      } catch (error) {
        console.error('Error fetching obra data:', error)
      } finally {
        setLoading(false)
      }
    }

    if (id) {
      fetchObraData()
    }
  }, [id])

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: "ARS",
      minimumFractionDigits: 0,
    }).format(value)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("es-AR")
  }

  if (loading) {
    return (
      <MainLayout>
        <div className="text-center py-12">
          <p>Cargando datos de la obra...</p>
        </div>
      </MainLayout>
    )
  }

  if (!obra) {
    return (
      <MainLayout>
        <div className="text-center py-12">
          <p>Obra no encontrada</p>
          <Button asChild className="mt-4">
            <Link href="/obras">Volver a Obras</Link>
          </Button>
        </div>
      </MainLayout>
    )
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/obras">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Volver
              </Link>
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{obra.nombreObra}</h1>
              <p className="text-gray-600">
                Obra N° {obra.nroObra} - {obra.localidad.nombreLocalidad}
              </p>
            </div>
          </div>
          <Button asChild>
            <Link href={`/obras/${id}/editar`}>
              <Edit className="mr-2 h-4 w-4" />
              Editar
            </Link>
          </Button>
        </div>

        {/* Información General */}
        <Card>
          <CardHeader>
            <CardTitle>Información General</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              <div>
                <span className="text-sm font-medium text-gray-500">Número de Obra</span>
                <p className="text-lg font-semibold">{obra.nroObra}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-500">Año de Ejecución</span>
                <p className="text-lg font-semibold">{obra.anioEjecucion}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-500">Tiempo de Ejecución</span>
                <p className="text-lg font-semibold">{obra.tiempoEjecucion} meses</p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-500">Fecha de Inicio</span>
                <p className="text-lg font-semibold">{formatDate(obra.fechaInicioObra)}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-500">Localidad</span>
                <p className="text-lg font-semibold">{obra.localidad.nombreLocalidad}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-500">Departamento</span>
                <p className="text-lg font-semibold">{obra.localidad.departamento.nombreDepartamento}</p>
              </div>
              <div className="md:col-span-2 lg:col-span-3">
                <span className="text-sm font-medium text-gray-500">Inversión Final</span>
                <p className="text-2xl font-bold text-green-600">{formatCurrency(obra.inversionFinal)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Plan de Proyecto */}
        <Card>
          <CardHeader>
            <CardTitle>Plan de Proyecto</CardTitle>
          </CardHeader>
          <CardContent>
            {plan ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">{plan.nombrePlanProyecto}</h3>
                  <div className="flex items-center gap-2">
                    <Badge variant={plan.seEjecuta ? "default" : "secondary"}>
                      {plan.seEjecuta ? "Activo" : "Inactivo"}
                    </Badge>
                    <Button size="sm" variant="outline" asChild>
                      <Link href={`/planes/${plan.id}`}>
                        <Eye className="h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                </div>
                <p className="text-gray-600">{plan.descripcionPlanProyecto}</p>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
                  <div>
                    <span className="text-sm font-medium text-gray-500">Rubro</span>
                    <p className="font-semibold">{plan.rubro.nombreRubro}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-500">Inversión Estimada</span>
                    <p className="font-semibold text-green-600">{formatCurrency(plan.inversionEstimada)}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-500">Tiempo Estimado</span>
                    <p className="font-semibold">{plan.tiempoEstimado} meses</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-500">Meses de Estudio</span>
                    <p className="font-semibold">{plan.mesesEstudio} meses</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500">No hay plan de proyecto asociado a esta obra</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Riesgos Técnicos */}
        <Card>
          <CardHeader>
            <CardTitle>Riesgos Técnicos</CardTitle>
          </CardHeader>
          <CardContent>
            {riesgos.length > 0 ? (
              <div className="space-y-4">
                {riesgos.map((riesgo) => (
                  <div key={riesgo.id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="h-5 w-5 text-yellow-600" />
                        <h4 className="font-semibold">Riesgo #{riesgo.nroRiesgo}</h4>
                      </div>
                      <Button size="sm" variant="outline" asChild>
                        <Link href={`/riesgos/${riesgo.id}`}>
                          <Eye className="h-4 w-4" />
                        </Link>
                      </Button>
                    </div>
                    <p className="text-gray-600 mt-2">{riesgo.naturalezaRiesgo}</p>
                    <Separator className="my-3" />
                    <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                      <div>
                        <span className="text-sm font-medium text-gray-500">Propuesta de Solución</span>
                        <p className="text-sm">{riesgo.propuestaSolucion}</p>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-500">Medidas de Mitigación</span>
                        <p className="text-sm">{riesgo.medidasMitigacion}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <AlertTriangle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No hay riesgos técnicos registrados para esta obra</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Historial de Estados */}
        <Card>
          <CardHeader>
            <CardTitle>Historial de Estados</CardTitle>
          </CardHeader>
          <CardContent>
            {estadosHistorial.length > 0 ? (
              <div className="space-y-4">
                {estadosHistorial.map((estado) => (
                  <div key={estado.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-semibold">{estado.estadoObra.nombreEstadoObra}</h4>
                        <p className="text-sm text-gray-600">
                          Inicio: {formatDate(estado.fechaHoraInicio)}
                          {estado.fechaHoraFin && ` - Fin: ${formatDate(estado.fechaHoraFin)}`}
                        </p>
                      </div>
                      <Badge variant="secondary">
                        {estado.fechaHoraFin ? "Finalizado" : "Activo"}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500">No hay historial de estados disponible</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  )
}

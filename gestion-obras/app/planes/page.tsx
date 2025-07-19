"use client"

import { useState, useEffect } from "react"
import { MainLayout } from "@/components/layout/main-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Search, Eye, Edit, Trash2, FileText } from "lucide-react"
import Link from "next/link"
import { planesApi, rubrosApi } from "@/lib/api"
import type { PlanProyecto, Prioridad, Rubro } from "@/types"

export default function PlanesPage() {
  const [planes, setPlanes] = useState<PlanProyecto[]>([])
  const [rubros, setRubros] = useState<Rubro[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedRubro, setSelectedRubro] = useState<string>("all")
  const [selectedPrioridad, setSelectedPrioridad] = useState<string>("all")
  const [selectedEjecucion, setSelectedEjecucion] = useState<string>("all")

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)

        // Obtener planes
        const planesResponse = await planesApi.getAll()
        if (planesResponse.data.content) {
          setPlanes(planesResponse.data.content)
        }

        // Obtener rubros
        const rubrosResponse = await rubrosApi.getAll()
        if (rubrosResponse.data.success) {
          setRubros(rubrosResponse.data.data)
        }
      } catch (error) {
        console.error('Error fetching data:', error)
      } finally {
        setLoading(false)
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

  const getPrioridadColor = (prioridad: Prioridad) => {
    switch (prioridad) {
      case "UNO":
        return "destructive"
      case "DOS":
        return "default"
      case "TRES":
        return "secondary"
      case "CUATRO":
        return "outline"
      default:
        return "secondary"
    }
  }

  const getPrioridadText = (prioridad: Prioridad) => {
    switch (prioridad) {
      case "UNO":
        return "Alta"
      case "DOS":
        return "Media-Alta"
      case "TRES":
        return "Media"
      case "CUATRO":
        return "Baja"
      default:
        return "No definida"
    }
  }

  const filteredPlanes = planes.filter((plan) => {
    const matchesSearch = plan.nombrePlanProyecto.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         plan.descripcionPlanProyecto.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesRubro = selectedRubro === "all" || plan.rubro.id?.toString() === selectedRubro
    const matchesPrioridad = selectedPrioridad === "all" || plan.prioridad === selectedPrioridad
    const matchesEjecucion = selectedEjecucion === "all" ||
                           (selectedEjecucion === "true" && plan.seEjecuta) ||
                           (selectedEjecucion === "false" && !plan.seEjecuta)

    return matchesSearch && matchesRubro && matchesPrioridad && matchesEjecucion
  })

  const handleDeletePlan = async (id: number) => {
    if (window.confirm("¿Está seguro que desea eliminar este plan?")) {
      try {
        await planesApi.delete(id)
        setPlanes(
          planes.map(plan =>
            plan.id === id ? { ...plan, fechaBaja: new Date().toISOString() } : plan
          )
        )
      } catch (error: any) {
        console.error('Error deleting plan:', error)
        const msg = error?.response?.data?.message || 'Error al eliminar el plan'
        alert(msg)
      }
    }
  }

  if (loading) {
    return (
      <MainLayout>
        <div className="space-y-6">
          <div className="text-center">
            <p>Cargando datos de planes...</p>
          </div>
        </div>
      </MainLayout>
    )
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Planes de Proyecto</h1>
            <p className="text-gray-600">Gestión de planes y proyectos</p>
          </div>
          <Button asChild>
            <Link href="/planes/nuevo">
              <Plus className="mr-2 h-4 w-4" />
              Nuevo Plan
            </Link>
          </Button>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle>Filtros</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Buscar planes..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={selectedRubro} onValueChange={setSelectedRubro}>
                <SelectTrigger>
                  <SelectValue placeholder="Filtrar por rubro" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los rubros</SelectItem>
                  {rubros.map((rubro) => (
                    <SelectItem key={rubro.id} value={rubro.id?.toString() || ""}>
                      {rubro.nombreRubro}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={selectedPrioridad} onValueChange={setSelectedPrioridad}>
                <SelectTrigger>
                  <SelectValue placeholder="Filtrar por prioridad" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas las prioridades</SelectItem>
                  <SelectItem value="UNO">Alta</SelectItem>
                  <SelectItem value="DOS">Media-Alta</SelectItem>
                  <SelectItem value="TRES">Media</SelectItem>
                  <SelectItem value="CUATRO">Baja</SelectItem>
                </SelectContent>
              </Select>
              <Select value={selectedEjecucion} onValueChange={setSelectedEjecucion}>
                <SelectTrigger>
                  <SelectValue placeholder="Estado de ejecución" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="true">En ejecución</SelectItem>
                  <SelectItem value="false">No ejecutándose</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Plans Grid */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredPlanes.map((plan) => (
            <Card
              key={plan.id}
              className={`hover:shadow-lg transition-shadow ${plan.fechaBaja ? 'opacity-50 pointer-events-none' : ''}`}
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{plan.nombrePlanProyecto}</CardTitle>
                    <CardDescription className="mt-2">
                      {plan.descripcionPlanProyecto}
                    </CardDescription>
                  </div>
                <div className="flex flex-col gap-2">
                  <Badge variant={getPrioridadColor(plan.prioridad)}>
                    {getPrioridadText(plan.prioridad)}
                  </Badge>
                  <Badge variant={plan.seEjecuta ? "default" : "secondary"}>
                    {plan.seEjecuta ? "Activo" : "Inactivo"}
                  </Badge>
                  {plan.fechaBaja && (
                    <Badge variant="destructive">Baja</Badge>
                  )}
                </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Rubro:</span>
                    <span className="font-medium">{plan.rubro.nombreRubro}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Inversión Estimada:</span>
                    <span className="font-medium text-green-600">
                      {formatCurrency(plan.inversionEstimada)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Tiempo Estimado:</span>
                    <span className="font-medium">{plan.tiempoEstimado} meses</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Meses de Estudio:</span>
                    <span className="font-medium">{plan.mesesEstudio} meses</span>
                  </div>
                </div>
                <div className="mt-4 flex gap-2">
                  <Button size="sm" variant="outline" asChild disabled={!!plan.fechaBaja}>
                    <Link href={`/planes/${plan.id}`}> 
                      <Eye className="h-4 w-4" />
                    </Link>
                  </Button>
                  <Button size="sm" variant="outline" asChild disabled={plan.seEjecuta || !!plan.fechaBaja}>
                    <Link href={`/planes/${plan.id}/editar`}>
                      <Edit className="h-4 w-4" />
                    </Link>
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDeletePlan(plan.id!)}
                    disabled={plan.seEjecuta || !!plan.fechaBaja}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredPlanes.length === 0 && (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <FileText className="h-12 w-12 text-gray-400 mb-4" />
              <div className="text-center">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  No se encontraron planes
                </h3>
                <p className="text-gray-500 mb-4">
                  {searchTerm || selectedRubro !== "all" || selectedPrioridad !== "all" || selectedEjecucion !== "all"
                    ? "No hay planes que coincidan con los filtros aplicados."
                    : "Aún no hay planes registrados en el sistema."}
                </p>
                <Button asChild>
                  <Link href="/planes/nuevo">
                    <Plus className="mr-2 h-4 w-4" />
                    Crear primer plan
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </MainLayout>
  )
}

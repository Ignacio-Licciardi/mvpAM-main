"use client"

import { useState, useEffect } from "react"
import { MainLayout } from "@/components/layout/main-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Search, Eye, Edit, Trash2, RefreshCcw } from "lucide-react"
import Link from "next/link"
import { obrasApi, departamentosApi, estadosObraApi } from "@/lib/api"
import type { Obra, Departamento, EstadoObra } from "@/types"

export default function ObrasPage() {
  const [obras, setObras] = useState<Obra[]>([])
  const [departamentos, setDepartamentos] = useState<Departamento[]>([])
  const [estados, setEstados] = useState<EstadoObra[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedDepartamento, setSelectedDepartamento] = useState<string>("all")
  const [selectedEstado, setSelectedEstado] = useState<string>("all")

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)

        // Obtener obras (incluyendo bajas)
        const obrasResponse = await obrasApi.getAllWithBajas()
        if (obrasResponse.data.content) {
          setObras(obrasResponse.data.content)
        }

        // Obtener departamentos
        const departamentosResponse = await departamentosApi.getAll()
        if (departamentosResponse.data.success) {
          setDepartamentos(departamentosResponse.data.data)
        }

        // Obtener estados de obra
        const estadosResponse = await estadosObraApi.getAll()
        if (estadosResponse.data.success) {
          setEstados(estadosResponse.data.data)
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

  const filteredObras = obras.filter((obra) => {
    const matchesSearch =
      obra.nombreObra.toLowerCase().includes(searchTerm.toLowerCase()) ||
      obra.nroObra.toString().includes(searchTerm)

    const matchesDepartamento =
      selectedDepartamento === "" ||
      selectedDepartamento === "all" ||
      obra.localidad.departamento.id?.toString() === selectedDepartamento

    const currentEstado = obra.obraEstadoObras?.find((e) => !e.fechaHoraFin)
    const currentEstadoId = currentEstado?.estadoObra.id?.toString()
    const matchesEstado =
      selectedEstado === "" ||
      selectedEstado === "all" ||
      currentEstadoId === selectedEstado

    return matchesSearch && matchesDepartamento && matchesEstado
  })

  const handleDeleteObra = async (id: number) => {
    if (window.confirm("¿Está seguro que desea eliminar esta obra?")) {
      try {
        await obrasApi.delete(id)
        setObras(
          obras.map(obra =>
            obra.id === id ? { ...obra, fechaBaja: new Date().toISOString() } : obra
          )
        )
      } catch (error: any) {
        console.error('Error deleting obra:', error)
        const msg = error?.response?.data?.message || 'Error al eliminar la obra'
        alert(msg)
      }
    }
  }

  if (loading) {
    return (
      <MainLayout>
        <div className="space-y-6">
          <div className="text-center">
            <p>Cargando datos de obras...</p>
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
            <h1 className="text-2xl font-bold text-gray-900">Obras</h1>
            <p className="text-gray-600">Gestión de obras públicas</p>
          </div>
          <Button asChild>
            <Link href="/obras/nueva">
              <Plus className="mr-2 h-4 w-4" />
              Nueva Obra
            </Link>
          </Button>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle>Filtros</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Buscar por nombre o número de obra..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={selectedDepartamento} onValueChange={setSelectedDepartamento}>
                <SelectTrigger>
                  <SelectValue placeholder="Filtrar por departamento" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los departamentos</SelectItem>
                  {departamentos.map((departamento) => (
                    <SelectItem key={departamento.id} value={String(departamento.id)}>
                      {departamento.nombreDepartamento}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={selectedEstado} onValueChange={setSelectedEstado}>
                <SelectTrigger>
                  <SelectValue placeholder="Filtrar por estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los estados</SelectItem>
                  {estados.map((estado) => (
                    <SelectItem key={estado.id} value={String(estado.id)}>
                      {estado.nombreEstadoObra}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Obras Grid */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredObras.map((obra) => (
            <Card
              key={obra.id}
              className={`hover:shadow-lg transition-shadow ${
                obra.fechaBaja ? "opacity-50" : ""
              }`}
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{obra.nombreObra}</CardTitle>
                    <CardDescription>
                      Obra N° {obra.nroObra} - {obra.localidad.nombreLocalidad}
                    </CardDescription>
                  </div>
                  <div className="flex flex-col gap-1 items-end">
                    <Badge variant="secondary">{obra.anioEjecucion}</Badge>
                    {obra.fechaBaja && (
                      <Badge variant="destructive">Baja</Badge>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Departamento:</span>
                    <span className="font-medium">{obra.localidad.departamento.nombreDepartamento}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Duración:</span>
                    <span className="font-medium">{obra.tiempoEjecucion} meses</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Inversión:</span>
                    <span className="font-medium text-green-600">
                      {formatCurrency(obra.inversionFinal)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Inicio:</span>
                    <span className="font-medium">
                      {new Date(obra.fechaInicioObra).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <div className="mt-4 flex gap-2">
                  {!obra.fechaBaja && (
                    <Button size="sm" variant="outline" asChild>
                      <Link href={`/obras/${obra.id}`}>
                        <Eye className="h-4 w-4" />
                      </Link>
                    </Button>
                  )}
                  {!obra.fechaBaja && (
                    <>
                      <Button size="sm" variant="outline" asChild>
                        <Link href={`/obras/${obra.id}/editar`}>
                          <Edit className="h-4 w-4" />
                        </Link>
                      </Button>
                      <Button size="sm" variant="outline" asChild>
                        <Link href={`/obras/${obra.id}/estado`}>
                          <RefreshCcw className="h-4 w-4" />
                        </Link>
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDeleteObra(obra.id!)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredObras.length === 0 && (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <div className="text-center">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  No se encontraron obras
                </h3>
                <p className="text-gray-500 mb-4">
                  {searchTerm || selectedDepartamento
                    ? "No hay obras que coincidan con los filtros aplicados."
                    : "Aún no hay obras registradas en el sistema."}
                </p>
                <Button asChild>
                  <Link href="/obras/nueva">
                    <Plus className="mr-2 h-4 w-4" />
                    Crear primera obra
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

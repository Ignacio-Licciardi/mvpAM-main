"use client"

import { useState, useEffect } from "react"
import { MainLayout } from "@/components/layout/main-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Search, Eye, Edit, Trash2, AlertTriangle } from "lucide-react"
import Link from "next/link"
import { riesgosApi, obrasApi } from "@/lib/api"
import type { RiesgoTecnico, Obra } from "@/types"

export default function RiesgosPage() {
  const [riesgos, setRiesgos] = useState<RiesgoTecnico[]>([])
  const [obras, setObras] = useState<Obra[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedObra, setSelectedObra] = useState<string>("all")

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)

        // Obtener riesgos
        const riesgosResponse = await riesgosApi.getAll()
        if (riesgosResponse.data.content) {
          setRiesgos(riesgosResponse.data.content)
        }

        // Obtener obras
        const obrasResponse = await obrasApi.getAll()
        if (obrasResponse.data.content) {
          setObras(obrasResponse.data.content)
        }
      } catch (error) {
        console.error('Error fetching data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const filteredRiesgos = riesgos.filter((riesgo) => {
    const matchesSearch = riesgo.naturalezaRiesgo.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         riesgo.nroRiesgo.toString().includes(searchTerm) ||
                         riesgo.propuestaSolucion.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesObra =
      selectedObra === "all" ||
      (riesgo.obraRiesgos &&
        riesgo.obraRiesgos.some(or => or.obra.id?.toString() === selectedObra))

    return matchesSearch && matchesObra
  })

  const handleDeleteRiesgo = async (id: number) => {
    if (window.confirm("¿Está seguro que desea eliminar este riesgo?")) {
      try {
        await riesgosApi.delete(id)
        setRiesgos(
          riesgos.map(riesgo =>
            riesgo.id === id ? { ...riesgo, fechaBaja: new Date().toISOString() } : riesgo
          )
        )
      } catch (error: any) {
        console.error('Error deleting riesgo:', error)
        const msg = error?.response?.data?.message || 'Error al eliminar el riesgo'
        alert(msg)
      }
    }
  }

  if (loading) {
    return (
      <MainLayout>
        <div className="space-y-6">
          <div className="text-center">
            <p>Cargando datos de riesgos...</p>
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
            <h1 className="text-2xl font-bold text-gray-900">Riesgos Técnicos</h1>
            <p className="text-gray-600">Gestión de riesgos y medidas de mitigación</p>
          </div>
          <Button asChild>
            <Link href="/riesgos/nuevo">
              <Plus className="mr-2 h-4 w-4" />
              Nuevo Riesgo
            </Link>
          </Button>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle>Filtros</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Buscar riesgos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={selectedObra} onValueChange={setSelectedObra}>
                <SelectTrigger>
                  <SelectValue placeholder="Filtrar por obra" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas las obras</SelectItem>
                  {obras.map((obra) => (
                    <SelectItem key={obra.id} value={obra.id?.toString() || ""}>
                      {obra.nombreObra}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Riesgos Grid */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredRiesgos.map((riesgo) => (
            <Card
              key={riesgo.id}
              className={`hover:shadow-lg transition-shadow ${
                riesgo.fechaBaja ? "opacity-50 pointer-events-none" : ""
              }`}
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="h-5 w-5 text-yellow-600" />
                      <CardTitle className="text-lg">Riesgo #{riesgo.nroRiesgo}</CardTitle>
                    </div>
                    <CardDescription className="mt-2">
                      {riesgo.naturalezaRiesgo}
                    </CardDescription>
                  </div>
                  {riesgo.fechaBaja ? (
                    <Badge variant="destructive">Baja</Badge>
                  ) : (
                    <Badge variant="destructive">Activo</Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <span className="text-sm font-medium text-gray-500">Obras asociadas:</span>
                    <p className="text-sm">
                      {riesgo.obraRiesgos && riesgo.obraRiesgos.length > 0
                        ? `${riesgo.obraRiesgos.length} obra${riesgo.obraRiesgos.length !== 1 ? 's' : ''}`
                        : 'Sin obras'}
                    </p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-500">Propuesta de Solución:</span>
                    <p className="text-sm">{riesgo.propuestaSolucion}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-500">Medidas de Mitigación:</span>
                    <p className="text-sm">{riesgo.medidasMitigacion}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-500">Acciones Ejecutadas:</span>
                    <p className="text-sm">{riesgo.accionesEjecutadas}</p>
                  </div>
                </div>
                <div className="mt-4 flex gap-2">
                  <Button size="sm" variant="outline" asChild disabled={!!riesgo.fechaBaja}>
                    <Link href={`/riesgos/${riesgo.id}`}>
                      <Eye className="h-4 w-4" />
                    </Link>
                  </Button>
                  <Button size="sm" variant="outline" asChild disabled={!!riesgo.fechaBaja}>
                    <Link href={`/riesgos/${riesgo.id}/editar`}>
                      <Edit className="h-4 w-4" />
                    </Link>
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDeleteRiesgo(riesgo.id!)}
                    disabled={!!riesgo.fechaBaja}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredRiesgos.length === 0 && (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <AlertTriangle className="h-12 w-12 text-gray-400 mb-4" />
              <div className="text-center">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  No se encontraron riesgos
                </h3>
                <p className="text-gray-500 mb-4">
                  {searchTerm || selectedObra !== "all"
                    ? "No hay riesgos que coincidan con los filtros aplicados."
                    : "Aún no hay riesgos registrados en el sistema."}
                </p>
                <Button asChild>
                  <Link href="/riesgos/nuevo">
                    <Plus className="mr-2 h-4 w-4" />
                    Registrar primer riesgo
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

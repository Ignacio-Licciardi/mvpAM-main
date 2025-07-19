"use client"

import { useState, useEffect } from "react"
import { MainLayout } from "@/components/layout/main-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Search, Eye, Edit, Trash2, MapPin } from "lucide-react"
import Link from "next/link"
import { localidadesApi, departamentosApi } from "@/lib/api"
import type { Localidad, Departamento } from "@/types"

export default function LocalidadesPage() {
  const [localidades, setLocalidades] = useState<Localidad[]>([])
  const [departamentos, setDepartamentos] = useState<Departamento[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedDepartamento, setSelectedDepartamento] = useState<string>("all")

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const locRes = await localidadesApi.getAllWithBajas()
        if (locRes.data.success) setLocalidades(locRes.data.data)

        const depRes = await departamentosApi.getAll()
        if (depRes.data.success) setDepartamentos(depRes.data.data)
      } catch (error) {
        console.error('Error fetching localidades:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const filteredLocalidades = localidades.filter(loc => {
    const matchesSearch = loc.nombreLocalidad.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          loc.id?.toString().includes(searchTerm)
    const matchesDep = selectedDepartamento === "all" || loc.departamento.id?.toString() === selectedDepartamento
    return matchesSearch && matchesDep
  })

  const handleDelete = async (id: number) => {
    if (window.confirm("¿Está seguro que desea eliminar esta localidad?")) {
      try {
        const res = await localidadesApi.delete(id)
        if (res.data.success) {
          setLocalidades(
            localidades.map(l =>
              l.id === id ? { ...l, fechaBaja: new Date().toISOString() } : l
            )
          )
        } else {
          alert(res.data.message || 'Error al eliminar la localidad')
        }
      } catch (error: any) {
        console.error('Error deleting localidad:', error)
        const msg = error?.response?.data?.message || 'Error al eliminar la localidad'
        alert(msg)
      }
    }
  }

  if (loading) {
    return (
      <MainLayout>
        <div className="space-y-6">
          <div className="text-center">
            <p>Cargando datos de localidades...</p>
          </div>
        </div>
      </MainLayout>
    )
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Localidades</h1>
            <p className="text-gray-600">Gestión de localidades</p>
          </div>
          <Button asChild>
            <Link href="/administracion/localidades/nueva">
              <Plus className="mr-2 h-4 w-4" />
              Nueva Localidad
            </Link>
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Filtros</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Buscar por nombre o ID..."
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
                  {departamentos.map(dep => (
                    <SelectItem key={dep.id} value={dep.id?.toString() || ""}>
                      {dep.nombreDepartamento}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Listado de Localidades</CardTitle>
            <CardDescription>Localidades registradas</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredLocalidades.map(localidad => (
                <div
                  key={localidad.id}
                  className={`flex items-center justify-between p-4 border rounded-lg ${localidad.fechaBaja ? 'opacity-50' : ''}`}
                >
                  <div className="flex items-center gap-3">
                    <MapPin className="h-4 w-4 text-gray-400" />
                    <div>
                      <h4 className="font-medium">{localidad.nombreLocalidad}</h4>
                      <p className="text-sm text-gray-500">{localidad.departamento.nombreDepartamento}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" asChild disabled={!!localidad.fechaBaja}>
                      <Link href={`/administracion/localidades/${localidad.id}`}>
                        <Eye className="h-4 w-4" />
                      </Link>
                    </Button>
                    <Button size="sm" variant="outline" asChild disabled={!!localidad.fechaBaja}>
                      <Link href={`/administracion/localidades/${localidad.id}/editar`}>
                        <Edit className="h-4 w-4" />
                      </Link>
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => handleDelete(localidad.id!)} disabled={!!localidad.fechaBaja}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
              {filteredLocalidades.length === 0 && (
                <div className="text-center py-8">
                  <p className="text-gray-500">No se encontraron localidades</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  )
}

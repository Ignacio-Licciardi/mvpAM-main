"use client"

import { useState, useEffect } from "react"
import { MainLayout } from "@/components/layout/main-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, Search, Eye, Edit, Trash2, MapPin } from "lucide-react"
import Link from "next/link"
import { departamentosApi, localidadesApi } from "@/lib/api"
import type { Departamento, Localidad } from "@/types"

export default function DepartamentosPage() {
  const [departamentos, setDepartamentos] = useState<Departamento[]>([])
  const [localidades, setLocalidades] = useState<Localidad[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)

        // Obtener departamentos
        const departamentosResponse = await departamentosApi.getAllWithBajas()
        if (departamentosResponse.data.success) {
          setDepartamentos(departamentosResponse.data.data)
        }

        // Obtener localidades
        const localidadesResponse = await localidadesApi.getAllWithBajas()
        if (localidadesResponse.data.success) {
          setLocalidades(localidadesResponse.data.data)
        }
      } catch (error) {
        console.error('Error fetching data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const filteredDepartamentos = departamentos.filter((departamento) => {
    const matchesName = departamento.nombreDepartamento
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
    const matchesId = departamento.id?.toString().includes(searchTerm)
    return matchesName || matchesId
  })


  const handleDeleteDepartamento = async (id: number) => {
    if (window.confirm("¿Está seguro que desea eliminar este departamento?")) {
      try {
        const res = await departamentosApi.delete(id)
        if (res.data.success) {
          setDepartamentos(
            departamentos.map(dept =>
              dept.id === id ? { ...dept, fechaBaja: new Date().toISOString() } : dept
            )
          )
        } else {
          alert(res.data.message || 'Error al eliminar el departamento')
        }
      } catch (error: any) {
        console.error('Error deleting departamento:', error)
        const msg = error?.response?.data?.message || 'Error al eliminar el departamento'
        alert(msg)
      }
    }
  }


  if (loading) {
    return (
      <MainLayout>
        <div className="space-y-6">
          <div className="text-center">
            <p>Cargando datos de departamentos...</p>
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
            <h1 className="text-2xl font-bold text-gray-900">Departamentos</h1>
            <p className="text-gray-600">Gestión de departamentos provinciales</p>
          </div>
          <div className="flex gap-2">
            <Button asChild>
              <Link href="/administracion/departamentos/nuevo">
                <Plus className="mr-2 h-4 w-4" />
                Nuevo Departamento
              </Link>
            </Button>
          </div>
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
                  placeholder="Buscar departamentos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Departamentos */}
        <Card>
            <CardHeader>
              <CardTitle>Departamentos</CardTitle>
              <CardDescription>Gestión de departamentos provinciales</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredDepartamentos.map((departamento) => (
                  <div
                    key={departamento.id}
                    className={`flex items-center justify-between p-4 border rounded-lg ${departamento.fechaBaja ? "opacity-50" : ""}`}
                  >
                    <div className="flex items-center gap-3">
                      <MapPin className="h-5 w-5 text-gray-500" />
                      <div>
                        <h4 className="font-medium">{departamento.nombreDepartamento}</h4>
                        <p className="text-sm text-gray-500">
                          {localidades.filter(loc => loc.departamento.id === departamento.id && !loc.fechaBaja).length} localidades
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" asChild disabled={!!departamento.fechaBaja}>
                        <Link href={`/administracion/departamentos/${departamento.id}`}>
                          <Eye className="h-4 w-4" />
                        </Link>
                      </Button>
                      <Button size="sm" variant="outline" asChild disabled={!!departamento.fechaBaja}>
                        <Link href={`/administracion/departamentos/${departamento.id}/editar`}>
                          <Edit className="h-4 w-4" />
                        </Link>
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDeleteDepartamento(departamento.id!)}
                        disabled={!!departamento.fechaBaja}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
                {filteredDepartamentos.length === 0 && (
                  <div className="text-center py-8">
                    <p className="text-gray-500">No se encontraron departamentos</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
      </div>
    </MainLayout>
  )
}

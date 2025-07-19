"use client"

import { useState, useEffect } from "react"
import { MainLayout } from "@/components/layout/main-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Plus, Search, Eye, Edit, Trash2 } from "lucide-react"
import Link from "next/link"
import { estadosObraApi } from "@/lib/api"
import type { EstadoObra } from "@/types"

export default function EstadosObraPage() {
  const [estados, setEstados] = useState<EstadoObra[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const response = await estadosObraApi.getAllWithBajas()
        if (response.data.success) {
          setEstados(response.data.data)
        }
      } catch (error) {
        console.error('Error fetching estados de obra:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const filteredEstados = estados.filter((estado) => {
    const matchesName = estado.nombreEstadoObra.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesId = estado.id?.toString().includes(searchTerm)
    return matchesName || matchesId
  })

  const handleDelete = async (id: number) => {
    if (window.confirm("¿Está seguro que desea eliminar este estado de obra?")) {
      try {
        const res = await estadosObraApi.delete(id)
        if (res.data.success) {
          setEstados(estados.map(e =>
            e.id === id ? { ...e, fechaBaja: new Date().toISOString() } : e
          ))
        } else {
          alert(res.data.message || 'Error al eliminar el estado de obra')
        }
      } catch (error: any) {
        console.error('Error deleting estado:', error)
        const msg = error?.response?.data?.message || 'Error al eliminar el estado de obra'
        alert(msg)
      }
    }
  }

  if (loading) {
    return (
      <MainLayout>
        <div className="space-y-6">
          <div className="text-center">
            <p>Cargando datos de estados de obra...</p>
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
            <h1 className="text-2xl font-bold text-gray-900">Estados de Obra</h1>
            <p className="text-gray-600">Gestión de estados de obra</p>
          </div>
          <div className="flex gap-2">
            <Button asChild>
              <Link href="/administracion/estados-obra/nuevo">
                <Plus className="mr-2 h-4 w-4" />
                Nuevo Estado
              </Link>
            </Button>
          </div>
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
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Estados de Obra</CardTitle>
            <CardDescription>Gestión de estados de obra</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredEstados.map(estado => (
                <div
                  key={estado.id}
                  className={`flex items-center justify-between p-4 border rounded-lg ${estado.fechaBaja ? 'opacity-50' : ''}`}
                >
                  <div className="flex items-center gap-3">
                    <div>
                      <h4 className="font-medium">{estado.nombreEstadoObra}</h4>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" asChild disabled={!!estado.fechaBaja}>
                      <Link href={`/administracion/estados-obra/${estado.id}`}> <Eye className="h-4 w-4" /> </Link>
                    </Button>
                    <Button size="sm" variant="outline" asChild disabled={!!estado.fechaBaja}>
                      <Link href={`/administracion/estados-obra/${estado.id}/editar`}> <Edit className="h-4 w-4" /> </Link>
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => handleDelete(estado.id!)} disabled={!!estado.fechaBaja}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
              {filteredEstados.length === 0 && (
                <div className="text-center py-8">
                  <p className="text-gray-500">No se encontraron estados de obra</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  )
}

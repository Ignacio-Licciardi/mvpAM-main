"use client"

import { useState, useEffect } from "react"
import { MainLayout } from "@/components/layout/main-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Plus, Search, Eye, Edit, Trash2 } from "lucide-react"
import Link from "next/link"
import { rubrosApi } from "@/lib/api"
import type { Rubro } from "@/types"

export default function RubrosPage() {
  const [rubros, setRubros] = useState<Rubro[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const res = await rubrosApi.getAllWithBajas()
        if (res.data.success) {
          setRubros(res.data.data)
        }
      } catch (error) {
        console.error('Error fetching rubros:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const filteredRubros = rubros.filter(rubro => {
    const matchesName = rubro.nombreRubro.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesId = rubro.id?.toString().includes(searchTerm)
    return matchesName || matchesId
  })

  const handleDelete = async (id: number) => {
    if (window.confirm("¿Está seguro que desea eliminar este rubro?")) {
      try {
        const res = await rubrosApi.delete(id)
        if (res.data.success) {
          setRubros(rubros.map(r =>
            r.id === id ? { ...r, fechaBaja: new Date().toISOString() } : r
          ))
        } else {
          alert(res.data.message || 'Error al eliminar el rubro')
        }
      } catch (error: any) {
        console.error('Error deleting rubro:', error)
        const msg = error?.response?.data?.message || 'Error al eliminar el rubro'
        alert(msg)
      }
    }
  }

  if (loading) {
    return (
      <MainLayout>
        <div className="space-y-6">
          <div className="text-center">
            <p>Cargando datos de rubros...</p>
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
            <h1 className="text-2xl font-bold text-gray-900">Rubros</h1>
            <p className="text-gray-600">Gestión de rubros</p>
          </div>
          <div className="flex gap-2">
            <Button asChild>
              <Link href="/administracion/rubros/nuevo">
                <Plus className="mr-2 h-4 w-4" />
                Nuevo Rubro
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
                  onChange={e => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Rubros</CardTitle>
            <CardDescription>Gestión de rubros</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredRubros.map(rubro => (
                <div
                  key={rubro.id}
                  className={`flex items-center justify-between p-4 border rounded-lg ${rubro.fechaBaja ? 'opacity-50' : ''}`}
                >
                  <div className="flex items-center gap-3">
                    <div>
                      <h4 className="font-medium">{rubro.nombreRubro}</h4>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" asChild disabled={!!rubro.fechaBaja}>
                      <Link href={`/administracion/rubros/${rubro.id}`}>
                        <Eye className="h-4 w-4" />
                      </Link>
                    </Button>
                    <Button size="sm" variant="outline" asChild disabled={!!rubro.fechaBaja}>
                      <Link href={`/administracion/rubros/${rubro.id}/editar`}>
                        <Edit className="h-4 w-4" />
                      </Link>
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => handleDelete(rubro.id!)} disabled={!!rubro.fechaBaja}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
              {filteredRubros.length === 0 && (
                <div className="text-center py-8">
                  <p className="text-gray-500">No se encontraron rubros</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  )
}

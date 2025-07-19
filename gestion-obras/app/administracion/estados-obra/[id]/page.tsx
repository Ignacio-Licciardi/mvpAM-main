"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { MainLayout } from "@/components/layout/main-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Edit } from "lucide-react"
import Link from "next/link"
import { estadosObraApi } from "@/lib/api"
import type { EstadoObra } from "@/types"

export default function EstadoObraDetailPage() {
  const params = useParams()
  const id = Number.parseInt(params.id as string)

  const [estado, setEstado] = useState<EstadoObra | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const res = await estadosObraApi.getById(id)
        if (res.data.success) setEstado(res.data.data)
      } catch (error) {
        console.error('Error fetching estado:', error)
      } finally {
        setLoading(false)
      }
    }

    if (id) fetchData()
  }, [id])

  if (loading) {
    return (
      <MainLayout>
        <div className="text-center py-12">
          <p>Cargando datos del estado de obra...</p>
        </div>
      </MainLayout>
    )
  }

  if (!estado) {
    return (
      <MainLayout>
        <div className="text-center py-12">
          <p>Estado de obra no encontrado</p>
          <Button asChild className="mt-4">
            <Link href="/administracion/estados-obra">Volver a Estados</Link>
          </Button>
        </div>
      </MainLayout>
    )
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/administracion/estados-obra">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Volver
              </Link>
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{estado.nombreEstadoObra}</h1>
              <p className="text-gray-600">Estado de Obra</p>
            </div>
          </div>
          <Button asChild>
            <Link href={`/administracion/estados-obra/${id}/editar`}>
              <Edit className="mr-2 h-4 w-4" />
              Editar
            </Link>
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Información</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg font-medium">{estado.nombreEstadoObra}</p>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  )
}

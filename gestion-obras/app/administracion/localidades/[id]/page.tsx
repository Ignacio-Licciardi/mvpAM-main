"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { MainLayout } from "@/components/layout/main-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { ArrowLeft, Edit } from "lucide-react"
import Link from "next/link"
import { localidadesApi } from "@/lib/api"
import type { Localidad } from "@/types"

export default function LocalidadDetailPage() {
  const params = useParams()
  const id = Number.parseInt(params.id as string)

  const [localidad, setLocalidad] = useState<Localidad | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const res = await localidadesApi.getById(id)
        if (res.data.success) setLocalidad(res.data.data)
      } catch (error) {
        console.error('Error fetching localidad:', error)
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
          <p>Cargando datos de la localidad...</p>
        </div>
      </MainLayout>
    )
  }

  if (!localidad) {
    return (
      <MainLayout>
        <div className="text-center py-12">
          <p>Localidad no encontrada</p>
          <Button asChild className="mt-4">
            <Link href="/administracion/localidades">Volver a Localidades</Link>
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
              <Link href="/administracion/localidades">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Volver
              </Link>
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{localidad.nombreLocalidad}</h1>
              <p className="text-gray-600">Localidad</p>
            </div>
          </div>
          <Button asChild>
            <Link href={`/administracion/localidades/${id}/editar`}>
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
            <p className="text-lg font-medium">{localidad.nombreLocalidad}</p>
            <p className="text-gray-500">Departamento: {localidad.departamento.nombreDepartamento}</p>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  )
}

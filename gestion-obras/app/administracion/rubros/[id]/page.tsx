"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { MainLayout } from "@/components/layout/main-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Edit } from "lucide-react"
import Link from "next/link"
import { rubrosApi } from "@/lib/api"
import type { Rubro } from "@/types"

export default function RubroDetailPage() {
  const params = useParams()
  const id = Number.parseInt(params.id as string)

  const [rubro, setRubro] = useState<Rubro | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const res = await rubrosApi.getById(id)
        if (res.data.success) setRubro(res.data.data)
      } catch (error) {
        console.error('Error fetching rubro:', error)
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
          <p>Cargando datos del rubro...</p>
        </div>
      </MainLayout>
    )
  }

  if (!rubro) {
    return (
      <MainLayout>
        <div className="text-center py-12">
          <p>Rubro no encontrado</p>
          <Button asChild className="mt-4">
            <Link href="/administracion/rubros">Volver a Rubros</Link>
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
              <Link href="/administracion/rubros">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Volver
              </Link>
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{rubro.nombreRubro}</h1>
              <p className="text-gray-600">Rubro</p>
            </div>
          </div>
          <Button asChild>
            <Link href={`/administracion/rubros/${id}/editar`}>
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
            <p className="text-lg font-medium">{rubro.nombreRubro}</p>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  )
}

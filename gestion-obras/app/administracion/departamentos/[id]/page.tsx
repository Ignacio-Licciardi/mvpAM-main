"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { MainLayout } from "@/components/layout/main-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { ArrowLeft, Edit } from "lucide-react"
import Link from "next/link"
import { departamentosApi, localidadesApi } from "@/lib/api"
import type { Departamento, Localidad } from "@/types"

export default function DepartamentoDetailPage() {
  const params = useParams()
  const id = Number.parseInt(params.id as string)

  const [departamento, setDepartamento] = useState<Departamento | null>(null)
  const [localidades, setLocalidades] = useState<Localidad[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const res = await departamentosApi.getById(id)
        if (res.data.success) setDepartamento(res.data.data)

        const locRes = await localidadesApi.getByDepartamento(id)
        if (locRes.data.success) setLocalidades(locRes.data.data)
      } catch (error) {
        console.error('Error fetching departamento:', error)
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
          <p>Cargando datos del departamento...</p>
        </div>
      </MainLayout>
    )
  }

  if (!departamento) {
    return (
      <MainLayout>
        <div className="text-center py-12">
          <p>Departamento no encontrado</p>
          <Button asChild className="mt-4">
            <Link href="/administracion/departamentos">Volver a Departamentos</Link>
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
              <Link href="/administracion/departamentos">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Volver
              </Link>
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{departamento.nombreDepartamento}</h1>
              <p className="text-gray-600">Departamento</p>
            </div>
          </div>
          <Button asChild>
            <Link href={`/administracion/departamentos/${id}/editar`}>
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
            <p className="text-lg font-medium">{departamento.nombreDepartamento}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Localidades</CardTitle>
            <CardDescription>Localidades asociadas al departamento</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="list-disc pl-5 space-y-1">
              {localidades.map(loc => (
                <li key={loc.id}>{loc.nombreLocalidad}</li>
              ))}
              {localidades.length === 0 && (
                <li className="list-none text-gray-500">No hay localidades</li>
              )}
            </ul>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  )
}

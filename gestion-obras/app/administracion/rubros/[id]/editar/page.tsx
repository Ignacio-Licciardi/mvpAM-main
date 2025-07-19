"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { MainLayout } from "@/components/layout/main-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { ArrowLeft, Save, X } from "lucide-react"
import Link from "next/link"
import { rubrosApi } from "@/lib/api"
import type { Rubro } from "@/types"

export default function EditarRubroPage() {
  const router = useRouter()
  const params = useParams()
  const id = Number.parseInt(params.id as string)

  const [rubro, setRubro] = useState<Rubro | null>(null)
  const [nombre, setNombre] = useState("")
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const res = await rubrosApi.getById(id)
        if (res.data.success) {
          setRubro(res.data.data)
          setNombre(res.data.data.nombreRubro)
        }
      } catch (error) {
        console.error("Error fetching rubro:", error)
      } finally {
        setLoading(false)
      }
    }

    if (id) fetchData()
  }, [id])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      setSaving(true)
      await rubrosApi.update(id, { nombreRubro: nombre })
      router.push("/administracion/rubros")
    } catch (error) {
      console.error("Error updating rubro:", error)
      alert("Error al actualizar el rubro")
    } finally {
      setSaving(false)
    }
  }

  const handleCancel = () => router.push("/administracion/rubros")

  if (loading) {
    return (
      <MainLayout>
        <div className="text-center py-12">
          <p>Cargando datos...</p>
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
              <h1 className="text-2xl font-bold text-gray-900">Editar Rubro</h1>
              <p className="text-gray-600">Modifique los datos del rubro</p>
            </div>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Datos</CardTitle>
            <CardDescription>Actualice los datos del rubro</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <Label htmlFor="nombre">Nombre *</Label>
                <Input id="nombre" value={nombre} onChange={e => setNombre(e.target.value)} required />
              </div>
              <div className="flex gap-4 justify-end">
                <Button type="button" variant="outline" onClick={handleCancel} disabled={saving}>
                  <X className="mr-2 h-4 w-4" />
                  Cancelar
                </Button>
                <Button type="submit" disabled={saving}>
                  <Save className="mr-2 h-4 w-4" />
                  {saving ? "Guardando..." : "Guardar"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  )
}

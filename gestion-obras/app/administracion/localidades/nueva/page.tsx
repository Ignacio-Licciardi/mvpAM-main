"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { MainLayout } from "@/components/layout/main-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Save, X } from "lucide-react"
import Link from "next/link"
import { localidadesApi, departamentosApi } from "@/lib/api"
import type { Departamento } from "@/types"

export default function NuevaLocalidadPage() {
  const router = useRouter()
  const [departamentos, setDepartamentos] = useState<Departamento[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [nombre, setNombre] = useState("")
  const [departamentoId, setDepartamentoId] = useState<string>("")

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const res = await departamentosApi.getAll()
        if (res.data.success) setDepartamentos(res.data.data)
      } catch (error) {
        console.error('Error fetching departamentos:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!departamentoId) {
      alert('Seleccione un departamento')
      return
    }
    try {
      setSaving(true)
      await localidadesApi.create({
        nombreLocalidad: nombre,
        departamento: { id: parseInt(departamentoId) }
      })
      router.push('/administracion/localidades')
    } catch (error) {
      console.error('Error creating localidad:', error)
      alert('Error al crear la localidad')
    } finally {
      setSaving(false)
    }
  }

  const handleCancel = () => router.push('/administracion/localidades')

  if (loading) {
    return (
      <MainLayout>
        <div className="text-center py-12">
          <p>Cargando datos...</p>
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
              <h1 className="text-2xl font-bold text-gray-900">Nueva Localidad</h1>
              <p className="text-gray-600">Crear una localidad</p>
            </div>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Datos</CardTitle>
            <CardDescription>Complete los datos de la localidad</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div>
                  <Label htmlFor="nombre">Nombre *</Label>
                  <Input id="nombre" value={nombre} onChange={e => setNombre(e.target.value)} required />
                </div>
                <div>
                  <Label>Departamento *</Label>
                  <Select value={departamentoId} onValueChange={setDepartamentoId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccione" />
                    </SelectTrigger>
                    <SelectContent>
                      {departamentos.map(dep => (
                        <SelectItem key={dep.id} value={dep.id?.toString() || ""}>
                          {dep.nombreDepartamento}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex gap-4 justify-end">
                <Button type="button" variant="outline" onClick={handleCancel} disabled={saving}>
                  <X className="mr-2 h-4 w-4" />
                  Cancelar
                </Button>
                <Button type="submit" disabled={saving}>
                  <Save className="mr-2 h-4 w-4" />
                  {saving ? "Guardando..." : "Crear"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  )
}

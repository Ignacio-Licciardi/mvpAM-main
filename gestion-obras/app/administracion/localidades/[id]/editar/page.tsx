"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { MainLayout } from "@/components/layout/main-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Save, X } from "lucide-react"
import Link from "next/link"
import { localidadesApi, departamentosApi } from "@/lib/api"
import type { Localidad, Departamento } from "@/types"

export default function EditarLocalidadPage() {
  const router = useRouter()
  const params = useParams()
  const id = Number.parseInt(params.id as string)

  const [localidad, setLocalidad] = useState<Localidad | null>(null)
  const [departamentos, setDepartamentos] = useState<Departamento[]>([])
  const [nombre, setNombre] = useState("")
  const [departamentoId, setDepartamentoId] = useState<string>("")
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const resLoc = await localidadesApi.getById(id)
        if (resLoc.data.success) {
          setLocalidad(resLoc.data.data)
          setNombre(resLoc.data.data.nombreLocalidad)
          setDepartamentoId(resLoc.data.data.departamento.id?.toString() || "")
        }
        const resDep = await departamentosApi.getAll()
        if (resDep.data.success) setDepartamentos(resDep.data.data)
      } catch (error) {
        console.error('Error fetching localidad:', error)
      } finally {
        setLoading(false)
      }
    }

    if (id) fetchData()
  }, [id])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!departamentoId) {
      alert('Seleccione un departamento')
      return
    }
    try {
      setSaving(true)
      await localidadesApi.update(id, {
        nombreLocalidad: nombre,
        departamento: { id: parseInt(departamentoId) }
      })
      router.push('/administracion/localidades')
    } catch (error) {
      console.error('Error updating localidad:', error)
      alert('Error al actualizar la localidad')
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
              <h1 className="text-2xl font-bold text-gray-900">Editar Localidad</h1>
              <p className="text-gray-600">Modifique los datos de la localidad</p>
            </div>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Datos</CardTitle>
            <CardDescription>Actualice los datos de la localidad</CardDescription>
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

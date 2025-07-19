"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { MainLayout } from "@/components/layout/main-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, Save, X } from "lucide-react"
import Link from "next/link"
import { riesgosApi } from "@/lib/api"
import type { RiesgoTecnico } from "@/types"

export default function EditarRiesgoPage() {
  const router = useRouter()
  const params = useParams()
  const id = Number.parseInt(params.id as string)

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [riesgo, setRiesgo] = useState<RiesgoTecnico | null>(null)

  const [formData, setFormData] = useState({
    nroRiesgo: "",
    naturalezaRiesgo: "",
    propuestaSolucion: "",
    medidasMitigacion: "",
    accionesEjecutadas: "",
  })

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const riesgoRes = await riesgosApi.getById(id)
        if (riesgoRes.data.success) {
          const r = riesgoRes.data.data
          setRiesgo(r)
          setFormData({
            nroRiesgo: r.nroRiesgo.toString(),
            naturalezaRiesgo: r.naturalezaRiesgo,
            propuestaSolucion: r.propuestaSolucion,
            medidasMitigacion: r.medidasMitigacion,
            accionesEjecutadas: r.accionesEjecutadas,
          })
        }

      } catch (error) {
        console.error("Error fetching data:", error)
      } finally {
        setLoading(false)
      }
    }

    if (id) {
      fetchData()
    }
  }, [id])

  const handleInputChange = (field: string, value: string | string[]) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      setSaving(true)
      const payload: any = {
        nroRiesgo: parseInt(formData.nroRiesgo),
        naturalezaRiesgo: formData.naturalezaRiesgo,
        propuestaSolucion: formData.propuestaSolucion,
        medidasMitigacion: formData.medidasMitigacion,
        accionesEjecutadas: formData.accionesEjecutadas,
      }
      await riesgosApi.update(id, payload)
      router.push("/riesgos")
    } catch (error) {
      console.error("Error updating riesgo:", error)
      alert("Error al actualizar el riesgo")
    } finally {
      setSaving(false)
    }
  }

  const handleCancel = () => {
    router.push("/riesgos")
  }

  if (loading) {
    return (
      <MainLayout>
        <div className="space-y-6">
          <div className="text-center">
            <p>Cargando datos del riesgo...</p>
          </div>
        </div>
      </MainLayout>
    )
  }

  if (!riesgo) {
    return (
      <MainLayout>
        <div className="space-y-6">
          <div className="text-center">
            <p>Riesgo no encontrado</p>
            <Button asChild className="mt-4">
              <Link href="/riesgos">Volver a Riesgos</Link>
            </Button>
          </div>
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
              <Link href="/riesgos">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Volver
              </Link>
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Editar Riesgo</h1>
              <p className="text-gray-600">Modificar el riesgo seleccionado</p>
            </div>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Información del Riesgo</CardTitle>
            <CardDescription>Modifique los datos del riesgo</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div>
                  <Label htmlFor="nro">Número de Riesgo *</Label>
                  <Input id="nro" type="number" value={formData.nroRiesgo} onChange={e => handleInputChange("nroRiesgo", e.target.value)} required />
                </div>
                <div className="md:col-span-2">
                  <Label htmlFor="naturaleza">Naturaleza del Riesgo *</Label>
                  <Input id="naturaleza" value={formData.naturalezaRiesgo} onChange={e => handleInputChange("naturalezaRiesgo", e.target.value)} required />
                </div>
                <div className="md:col-span-2">
                  <Label htmlFor="propuesta">Propuesta de Solución *</Label>
                  <Textarea id="propuesta" value={formData.propuestaSolucion} onChange={e => handleInputChange("propuestaSolucion", e.target.value)} required />
                </div>
                <div className="md:col-span-2">
                  <Label htmlFor="medidas">Medidas de Mitigación *</Label>
                  <Textarea id="medidas" value={formData.medidasMitigacion} onChange={e => handleInputChange("medidasMitigacion", e.target.value)} required />
                </div>
                <div className="md:col-span-2">
                  <Label htmlFor="acciones">Acciones Ejecutadas *</Label>
                  <Textarea id="acciones" value={formData.accionesEjecutadas} onChange={e => handleInputChange("accionesEjecutadas", e.target.value)} required />
                </div>
              </div>
              <div className="flex gap-4 justify-end">
                <Button type="button" variant="outline" onClick={handleCancel} disabled={saving}>
                  <X className="mr-2 h-4 w-4" />
                  Cancelar
                </Button>
                <Button type="submit" disabled={saving}>
                  <Save className="mr-2 h-4 w-4" />
                  {saving ? "Guardando..." : "Actualizar Riesgo"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  )
}

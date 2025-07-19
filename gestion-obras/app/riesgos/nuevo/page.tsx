"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { MainLayout } from "@/components/layout/main-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, Save, X } from "lucide-react"
import Link from "next/link"
import { riesgosApi } from "@/lib/api"

export default function NuevoRiesgoPage() {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [nroExists, setNroExists] = useState(false)
  const [formData, setFormData] = useState({
    nroRiesgo: "",
    naturalezaRiesgo: "",
    propuestaSolucion: "",
    medidasMitigacion: "",
    accionesEjecutadas: "",
  })



  const handleInputChange = (field: string, value: string | string[]) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  useEffect(() => {
    const check = async () => {
      if (!formData.nroRiesgo) {
        setNroExists(false)
        return
      }
      try {
        const res = await riesgosApi.exists(parseInt(formData.nroRiesgo))
        if (res.data.success) {
          setNroExists(res.data.data)
        } else {
          setNroExists(false)
        }
      } catch {
        setNroExists(false)
      }
    }
    check()
  }, [formData.nroRiesgo])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (nroExists) {
      alert('Ya existe un riesgo con ese número')
      return
    }

    try {
      setSaving(true)
      const payload: any = {
        nroRiesgo: parseInt(formData.nroRiesgo),
        naturalezaRiesgo: formData.naturalezaRiesgo,
        propuestaSolucion: formData.propuestaSolucion,
        medidasMitigacion: formData.medidasMitigacion,
        accionesEjecutadas: formData.accionesEjecutadas,
      }
      await riesgosApi.create(payload)
      router.push("/riesgos")
    } catch (error: any) {
      console.error("Error creating riesgo:", error)
      const msg = error?.response?.data?.message || "Error al crear el riesgo"
      alert(msg)
    } finally {
      setSaving(false)
    }
  }

  const handleCancel = () => {
    router.push("/riesgos")
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
              <h1 className="text-2xl font-bold text-gray-900">Nuevo Riesgo</h1>
              <p className="text-gray-600">Registrar un nuevo riesgo técnico</p>
            </div>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Información del Riesgo</CardTitle>
            <CardDescription>Complete los datos para crear un riesgo</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div>
                  <Label htmlFor="nro">Número de Riesgo *</Label>
                  <Input id="nro" type="number" value={formData.nroRiesgo} onChange={e => handleInputChange("nroRiesgo", e.target.value)} required />
                  {nroExists && (
                    <p className="text-sm text-red-600">Ya existe un riesgo con ese número</p>
                  )}
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
                <Button type="submit" disabled={saving || nroExists}>
                  <Save className="mr-2 h-4 w-4" />
                  {saving ? "Guardando..." : "Crear Riesgo"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  )
}

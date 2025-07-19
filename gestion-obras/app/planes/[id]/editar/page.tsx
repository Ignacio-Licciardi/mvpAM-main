"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { MainLayout } from "@/components/layout/main-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, Save, X } from "lucide-react"
import Link from "next/link"
import { planesApi, rubrosApi } from "@/lib/api"
import type { PlanProyecto, Rubro } from "@/types"

export default function EditarPlanPage() {
  const router = useRouter()
  const params = useParams()
  const id = Number.parseInt(params.id as string)

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [plan, setPlan] = useState<PlanProyecto | null>(null)
  const [rubros, setRubros] = useState<Rubro[]>([])

  const [formData, setFormData] = useState({
    nombrePlanProyecto: "",
    descripcionPlanProyecto: "",
    mesesEstudio: "",
    inversionEstimada: "",
    tiempoEstimado: "",
    prioridad: "UNO",
    rubroId: ""
  })

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const planRes = await planesApi.getById(id)
        if (planRes.data.success) {
          const p = planRes.data.data
          setPlan(p)
          setFormData({
            nombrePlanProyecto: p.nombrePlanProyecto,
            descripcionPlanProyecto: p.descripcionPlanProyecto,
            mesesEstudio: p.mesesEstudio.toString(),
            inversionEstimada: p.inversionEstimada.toString(),
            tiempoEstimado: p.tiempoEstimado.toString(),
            prioridad: p.prioridad,
            rubroId: p.rubro.id?.toString() || ""
          })
        }

        const rubrosRes = await rubrosApi.getAll()
        if (rubrosRes.data.success) setRubros(rubrosRes.data.data)

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

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.rubroId) {
      alert("Por favor seleccione un rubro")
      return
    }

    if (parseInt(formData.mesesEstudio) <= 0 || parseInt(formData.tiempoEstimado) <= 0 || parseFloat(formData.inversionEstimada) <= 0) {
      alert("Los valores numéricos deben ser mayores a 0")
      return
    }

    try {
      setSaving(true)
      const payload: any = {
        nombrePlanProyecto: formData.nombrePlanProyecto,
        descripcionPlanProyecto: formData.descripcionPlanProyecto,
        mesesEstudio: parseInt(formData.mesesEstudio),
        inversionEstimada: parseFloat(formData.inversionEstimada),
        tiempoEstimado: parseInt(formData.tiempoEstimado),
        prioridad: formData.prioridad,
        rubro: { id: parseInt(formData.rubroId) }
      }

      await planesApi.update(id, payload)
      router.push("/planes")
    } catch (error: any) {
      console.error("Error updating plan:", error)
      const msg = error?.response?.data?.message || "Error al actualizar el plan"
      alert(msg)
    } finally {
      setSaving(false)
    }
  }

  const handleCancel = () => {
    router.push("/planes")
  }

  if (loading) {
    return (
      <MainLayout>
        <div className="space-y-6">
          <div className="text-center">
            <p>Cargando datos del plan...</p>
          </div>
        </div>
      </MainLayout>
    )
  }

  if (!plan) {
    return (
      <MainLayout>
        <div className="space-y-6">
          <div className="text-center">
            <p>Plan no encontrado</p>
            <Button asChild className="mt-4">
              <Link href="/planes">Volver a Planes</Link>
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
              <Link href="/planes">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Volver
              </Link>
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Editar Plan</h1>
              <p className="text-gray-600">Modificar el plan seleccionado</p>
            </div>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Información del Plan</CardTitle>
            <CardDescription>Modifique los datos del plan</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div className="md:col-span-2">
                  <Label htmlFor="nombre">Nombre *</Label>
                  <Input
                    id="nombre"
                    value={formData.nombrePlanProyecto}
                    onChange={e => handleInputChange("nombrePlanProyecto", e.target.value)}
                    required
                  />
                </div>
                <div className="md:col-span-2">
                  <Label htmlFor="descripcion">Descripción *</Label>
                  <Textarea
                    id="descripcion"
                    value={formData.descripcionPlanProyecto}
                    onChange={e => handleInputChange("descripcionPlanProyecto", e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="mesesEstudio">Meses de Estudio *</Label>
                  <Input
                    id="mesesEstudio"
                    type="number"
                    min="1"
                    value={formData.mesesEstudio}
                    onChange={e => handleInputChange("mesesEstudio", e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="tiempoEstimado">Tiempo Estimado (meses) *</Label>
                  <Input
                    id="tiempoEstimado"
                    type="number"
                    min="1"
                    value={formData.tiempoEstimado}
                    onChange={e => handleInputChange("tiempoEstimado", e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="inversion">Inversión Estimada *</Label>
                  <Input
                    id="inversion"
                    type="number"
                    step="0.01"
                    min="0.01"
                    value={formData.inversionEstimada}
                    onChange={e => handleInputChange("inversionEstimada", e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="rubro">Rubro *</Label>
                  <Select value={formData.rubroId} onValueChange={v => handleInputChange("rubroId", v)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccione un rubro" />
                    </SelectTrigger>
                    <SelectContent>
                      {rubros.map(r => (
                        <SelectItem key={r.id} value={r.id?.toString() || ""}>
                          {r.nombreRubro}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="prioridad">Prioridad *</Label>
                  <Select value={formData.prioridad} onValueChange={v => handleInputChange("prioridad", v)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccione prioridad" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="UNO">Alta</SelectItem>
                      <SelectItem value="DOS">Media-Alta</SelectItem>
                      <SelectItem value="TRES">Media</SelectItem>
                      <SelectItem value="CUATRO">Baja</SelectItem>
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
                  {saving ? "Guardando..." : "Actualizar Plan"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  )
}


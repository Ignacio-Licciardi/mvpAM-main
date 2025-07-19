"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { MainLayout } from "@/components/layout/main-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Save, X } from "lucide-react"
import Link from "next/link"
import { MultiSelect } from "@/components/ui/multi-select"
import { obrasApi, departamentosApi, localidadesApi, planesApi, riesgosApi } from "@/lib/api"
import type { Departamento, Localidad, ObraPayload, PlanProyecto, RiesgoTecnico } from "@/types"

export default function NuevaObraPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [departamentos, setDepartamentos] = useState<Departamento[]>([])
  const [localidades, setLocalidades] = useState<Localidad[]>([])
  const [planes, setPlanes] = useState<PlanProyecto[]>([])
  const [riesgos, setRiesgos] = useState<RiesgoTecnico[]>([])
  const [selectedDepartamento, setSelectedDepartamento] = useState<string>("")

  // Datos del formulario
  const [formData, setFormData] = useState({
    nroObra: "",
    nombreObra: "",
    tiempoEjecucion: "",
    anioEjecucion: new Date().getFullYear().toString(),
    fechaInicioObra: "",
    inversionFinal: "",
    localidadId: "",
    planId: "",
    riesgoIds: [] as string[]
  })

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)

        // Obtener departamentos
        const departamentosResponse = await departamentosApi.getAll()
        if (departamentosResponse.data.success) {
          setDepartamentos(departamentosResponse.data.data)
        }

        // Obtener localidades
        const localidadesResponse = await localidadesApi.getAll()
        if (localidadesResponse.data.success) {
          setLocalidades(localidadesResponse.data.data)
        }

        const planesResponse = await planesApi.getAll()
        if (planesResponse.data.content) {
          setPlanes(planesResponse.data.content)
        }

        const riesgosResponse = await riesgosApi.getAll()
        if (riesgosResponse.data.content) {
          setRiesgos(riesgosResponse.data.content)
        }
      } catch (error) {
        console.error('Error fetching data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const handleInputChange = (field: string, value: string | string[]) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleDepartamentoChange = (departamentoId: string) => {
    setSelectedDepartamento(departamentoId)
    // Limpiar localidad seleccionada cuando cambia el departamento
    setFormData(prev => ({
      ...prev,
      localidadId: ""
    }))
  }

  const filteredLocalidades = localidades.filter(
    localidad => localidad.departamento.id?.toString() === selectedDepartamento
  )

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validaciones básicas del frontend
    if (!formData.nroObra || formData.nroObra.trim() === '') {
      alert('Por favor ingrese el número de obra')
      return
    }

    if (!formData.nombreObra || formData.nombreObra.trim() === '') {
      alert('Por favor ingrese el nombre de la obra')
      return
    }

    if (!formData.tiempoEjecucion || parseInt(formData.tiempoEjecucion) <= 0) {
      alert('Por favor ingrese un tiempo de ejecución válido')
      return
    }

    if (!formData.anioEjecucion || parseInt(formData.anioEjecucion) < 2000) {
      alert('Por favor ingrese un año de ejecución válido')
      return
    }

    if (!formData.fechaInicioObra) {
      alert('Por favor seleccione la fecha de inicio')
      return
    }

    if (!formData.inversionFinal || parseFloat(formData.inversionFinal) <= 0) {
      alert('Por favor ingrese una inversión final válida')
      return
    }

    if (!formData.localidadId) {
      alert('Por favor seleccione una localidad')
      return
    }

    try {
      setSaving(true)

      const obraPayload: ObraPayload = {
        nroObra: parseInt(formData.nroObra),
        nombreObra: formData.nombreObra.trim(),
        tiempoEjecucion: parseInt(formData.tiempoEjecucion),
        anioEjecucion: parseInt(formData.anioEjecucion),
        fechaInicioObra: formData.fechaInicioObra,
        inversionFinal: parseFloat(formData.inversionFinal),
        localidad: {
          id: parseInt(formData.localidadId)
        }
      }

      // Solo agregar planProyecto si hay uno seleccionado
      if (formData.planId && formData.planId.trim() !== '') {
        obraPayload.planProyecto = { id: parseInt(formData.planId) }
      }

      // Solo agregar riesgos si hay alguno seleccionado
      if (formData.riesgoIds.length > 0) {
        obraPayload.obraRiesgos = formData.riesgoIds.map(id => ({
          riesgoTecnico: { id: parseInt(id) }
        }))
      }

      console.log('Enviando payload:', obraPayload) // Para debugging

      const response = await obrasApi.create(obraPayload)

      if (response.data.success) {
        alert('Obra creada exitosamente')
        router.push('/obras')
      } else {
        alert(response.data.message || 'Error al crear la obra')
      }
    } catch (error: any) {
      console.error('Error creating obra:', error)

      // Manejo mejorado de errores
      if (error.response?.data?.message) {
        alert(error.response.data.message)
      } else if (error.response?.status === 400) {
        alert('Error de validación. Por favor revise los datos ingresados.')
      } else {
        alert('Error al crear la obra. Por favor intente nuevamente.')
      }
    } finally {
      setSaving(false)
    }
  }

  const handleCancel = () => {
    router.push('/obras')
  }

  if (loading) {
    return (
      <MainLayout>
        <div className="space-y-6">
          <div className="text-center">
            <p>Cargando datos...</p>
          </div>
        </div>
      </MainLayout>
    )
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/obras">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Volver
              </Link>
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Nueva Obra</h1>
              <p className="text-gray-600">Crear una nueva obra pública</p>
            </div>
          </div>
        </div>

        {/* Formulario */}
        <Card>
          <CardHeader>
            <CardTitle>Información de la Obra</CardTitle>
            <CardDescription>Complete los datos para crear una nueva obra</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div>
                  <Label htmlFor="nroObra">Número de Obra *</Label>
                  <Input
                    id="nroObra"
                    type="number"
                    value={formData.nroObra}
                    onChange={(e) => handleInputChange('nroObra', e.target.value)}
                    placeholder="Ej: 1001"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="anioEjecucion">Año de Ejecución *</Label>
                  <Input
                    id="anioEjecucion"
                    type="number"
                    value={formData.anioEjecucion}
                    onChange={(e) => handleInputChange('anioEjecucion', e.target.value)}
                    placeholder="Ej: 2025"
                    required
                  />
                </div>

                <div className="md:col-span-2">
                  <Label htmlFor="nombreObra">Nombre de la Obra *</Label>
                  <Input
                    id="nombreObra"
                    value={formData.nombreObra}
                    onChange={(e) => handleInputChange('nombreObra', e.target.value)}
                    placeholder="Ej: Construcción Hospital Regional"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="tiempoEjecucion">Tiempo de Ejecución (meses) *</Label>
                  <Input
                    id="tiempoEjecucion"
                    type="number"
                    value={formData.tiempoEjecucion}
                    onChange={(e) => handleInputChange('tiempoEjecucion', e.target.value)}
                    placeholder="Ej: 12"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="fechaInicioObra">Fecha de Inicio *</Label>
                  <Input
                    id="fechaInicioObra"
                    type="date"
                    value={formData.fechaInicioObra}
                    onChange={(e) => handleInputChange('fechaInicioObra', e.target.value)}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="inversionFinal">Inversión Final *</Label>
                  <Input
                    id="inversionFinal"
                    type="number"
                    step="0.01"
                    value={formData.inversionFinal}
                    onChange={(e) => handleInputChange('inversionFinal', e.target.value)}
                    placeholder="Ej: 1000000"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="departamento">Departamento *</Label>
                  <Select value={selectedDepartamento} onValueChange={handleDepartamentoChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccione un departamento" />
                    </SelectTrigger>
                    <SelectContent>
                      {departamentos.map((departamento) => (
                        <SelectItem key={departamento.id} value={String(departamento.id)}>
                          {departamento.nombreDepartamento}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="localidad">Localidad *</Label>
                  <Select
                    value={formData.localidadId}
                    onValueChange={(value) => handleInputChange('localidadId', value)}
                    disabled={!selectedDepartamento}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccione una localidad" />
                    </SelectTrigger>
                    <SelectContent>
                      {filteredLocalidades.map((localidad) => (
                        <SelectItem key={localidad.id} value={String(localidad.id)}>
                          {localidad.nombreLocalidad}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="plan">Plan de Proyecto</Label>
                  <Select
                    value={formData.planId}
                    onValueChange={(v) => handleInputChange('planId', v)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccione un plan (opcional)" />
                    </SelectTrigger>
                    <SelectContent>
                      {planes.map((plan) => (
                        <SelectItem key={plan.id} value={String(plan.id)} disabled={!!plan.fechaBaja}>
                          {plan.nombrePlanProyecto}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="md:col-span-2">
                  <Label>Riesgos Técnicos</Label>
                  <MultiSelect
                    options={riesgos.map(r => ({
                      value: String(r.id),
                      label: `#${r.nroRiesgo} - ${r.naturalezaRiesgo}`,
                      disabled: !!r.fechaBaja,
                    }))}
                    selected={formData.riesgoIds}
                    onChange={values => handleInputChange('riesgoIds', values)}
                    placeholder="Seleccione riesgos"
                  />
                </div>
              </div>

              <div className="flex gap-4 justify-end">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCancel}
                  disabled={saving}
                >
                  <X className="mr-2 h-4 w-4" />
                  Cancelar
                </Button>
                <Button type="submit" disabled={saving}>
                  <Save className="mr-2 h-4 w-4" />
                  {saving ? 'Guardando...' : 'Crear Obra'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  )
}

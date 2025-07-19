"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
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
import type { Obra, Departamento, Localidad, ObraUpdatePayload, PlanProyecto, RiesgoTecnico } from "@/types"

export default function EditarObraPage() {
  const router = useRouter()
  const params = useParams()
  const id = Number.parseInt(params.id as string)

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [obra, setObra] = useState<Obra | null>(null)
  const [editable, setEditable] = useState(true)
  const [departamentos, setDepartamentos] = useState<Departamento[]>([])
  const [localidades, setLocalidades] = useState<Localidad[]>([])
  const [selectedDepartamento, setSelectedDepartamento] = useState<string>("")
  // Plan y Riesgos
  const [planes, setPlanes] = useState<PlanProyecto[]>([])
  const [riesgos, setRiesgos] = useState<RiesgoTecnico[]>([])
  const [selectedPlanId, setSelectedPlanId] = useState<string>("")
  const [selectedRiesgoIds, setSelectedRiesgoIds] = useState<string[]>([])

  // Datos del formulario
  const [formData, setFormData] = useState({
    nroObra: "",
    nombreObra: "",
    tiempoEjecucion: "",
    anioEjecucion: "",
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

        // Obtener la obra específica
        const obraResponse = await obrasApi.getById(id)
        if (obraResponse.data.success) {
          const obraData = obraResponse.data.data
          setObra(obraData)

          const estadoActual = obraData.obraEstadoObras?.find((e) => !e.fechaHoraFin)
          const esFinalizada =
            estadoActual?.estadoObra.nombreEstadoObra.toLowerCase() === 'finalizada'
          // estadoActual se utiliza solo para habilitar o no la edición
          if (obraData.fechaBaja || esFinalizada) {
            setEditable(false)
          }

          // Llenar el formulario con los datos existentes
          setFormData({
            nroObra: obraData.nroObra.toString(),
            nombreObra: obraData.nombreObra,
            tiempoEjecucion: obraData.tiempoEjecucion.toString(),
            anioEjecucion: obraData.anioEjecucion.toString(),
            fechaInicioObra: obraData.fechaInicioObra,
            inversionFinal: obraData.inversionFinal.toString(),
            localidadId: obraData.localidad.id?.toString() || "",
            planId: obraData.planProyecto?.id?.toString() || "",
            riesgoIds: obraData.obraRiesgos?.map(r => String(r.riesgoTecnico.id)) || []
          })

          setSelectedPlanId(obraData.planProyecto?.id?.toString() || "")
          setSelectedRiesgoIds(
            obraData.obraRiesgos?.map(r => String(r.riesgoTecnico.id)) || []
          )

          // Establecer el departamento seleccionado
          setSelectedDepartamento(obraData.localidad.departamento.id?.toString() || "")
        }

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

    if (id) {
      fetchData()
    }
  }, [id])

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

    if (!editable) {
      return
    }

    if (!formData.localidadId) {
      alert('Por favor seleccione una localidad')
      return
    }

    try {
      setSaving(true)

      // Buscar la localidad completa para enviar al backend
      const localidadSeleccionada = localidades.find(l => l.id?.toString() === formData.localidadId)

      if (!localidadSeleccionada) {
        alert('Localidad no encontrada')
        return
      }

      const obraActualizada: ObraUpdatePayload = {
        nroObra: parseInt(formData.nroObra),
        nombreObra: formData.nombreObra,
        tiempoEjecucion: parseInt(formData.tiempoEjecucion),
        anioEjecucion: parseInt(formData.anioEjecucion),
        fechaInicioObra: formData.fechaInicioObra,
        inversionFinal: parseFloat(formData.inversionFinal),
        localidad: {
          id: localidadSeleccionada.id
        },
        planProyecto: formData.planId ? { id: parseInt(formData.planId) } : undefined,
        obraRiesgos:
          selectedRiesgoIds.length > 0
            ? selectedRiesgoIds.map((id) => ({ riesgoTecnico: { id: parseInt(id) } }))
            : undefined
      }

      await obrasApi.update(id, obraActualizada)
      router.push('/obras')
    } catch (error: any) {
      console.error('Error updating obra:', error)
      if (error.response?.data?.message) {
        alert(error.response.data.message)
      } else if (error.response?.status === 400) {
        alert('Error de validación. Revise los datos ingresados.')
      } else {
        alert('Error al actualizar la obra')
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
            <p>Cargando datos de la obra...</p>
          </div>
        </div>
      </MainLayout>
    )
  }

  if (!obra) {
    return (
      <MainLayout>
        <div className="space-y-6">
          <div className="text-center">
            <p>Obra no encontrada</p>
            <Button asChild className="mt-4">
              <Link href="/obras">Volver a Obras</Link>
            </Button>
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
              <h1 className="text-2xl font-bold text-gray-900">Editar Obra</h1>
              <p className="text-gray-600">Modificar los datos de la obra: {obra.nombreObra}</p>
            </div>
            <Button variant="secondary" size="sm" asChild className="ml-auto">
              <Link href={`/obras/${id}/estado`}>Cambiar Estado</Link>
            </Button>
          </div>
        </div>

        {/* Formulario */}
        <Card>
          <CardHeader>
            <CardTitle>Información de la Obra</CardTitle>
            <CardDescription>Modifique los datos de la obra</CardDescription>
          </CardHeader>
          <CardContent>
            {!editable && (
              <p className="text-sm text-red-500 mb-4">
                La obra está finalizada o dada de baja y no puede modificarse.
              </p>
            )}
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
                    disabled={!editable}
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
                    disabled={!editable}
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
                    disabled={!editable}
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
                    disabled={!editable}
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
                    disabled={!editable}
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
                    disabled={!editable}
                  />
                </div>

                <div>
                  <Label htmlFor="departamento">Departamento *</Label>
                  <Select value={selectedDepartamento} onValueChange={handleDepartamentoChange} disabled={!editable}>
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
                    disabled={!selectedDepartamento || !editable}
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
                    value={selectedPlanId}
                    onValueChange={(v) => {
                      setSelectedPlanId(v)
                      handleInputChange('planId', v)
                    }}
                    disabled={!editable}
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
                    selected={selectedRiesgoIds}
                    onChange={values => {
                      setSelectedRiesgoIds(values)
                      handleInputChange('riesgoIds', values)
                    }}
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
                <Button type="submit" disabled={saving || !editable}>
                  <Save className="mr-2 h-4 w-4" />
                  {saving ? 'Guardando...' : 'Actualizar Obra'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  )
}

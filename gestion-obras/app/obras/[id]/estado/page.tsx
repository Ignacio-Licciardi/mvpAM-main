"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { MainLayout } from "@/components/layout/main-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { ArrowLeft, Save, X } from "lucide-react"
import Link from "next/link"
import { obrasApi, estadosObraApi } from "@/lib/api"
import type { EstadoObra, Obra } from "@/types"

export default function CambiarEstadoPage() {
  const params = useParams()
  const id = Number.parseInt(params.id as string)
  const router = useRouter()

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [obra, setObra] = useState<Obra | null>(null)
  const [estados, setEstados] = useState<EstadoObra[]>([])
  const [selectedEstado, setSelectedEstado] = useState<string>("")
  const [currentEstadoId, setCurrentEstadoId] = useState<string>("")
  const [editable, setEditable] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const obraResponse = await obrasApi.getById(id)
        if (obraResponse.data.success) {
          const data = obraResponse.data.data
          setObra(data)
          const estadoActual = data.obraEstadoObras?.find((e) => !e.fechaHoraFin)
          if (estadoActual?.estadoObra.id) {
            const idStr = estadoActual.estadoObra.id.toString()
            setSelectedEstado(idStr)
            setCurrentEstadoId(idStr)
            const esFinalizada =
              estadoActual.estadoObra.nombreEstadoObra.toLowerCase() === "finalizada"
            if (data.fechaBaja || esFinalizada) {
              setEditable(false)
            }
          }
        }
        const estadosResponse = await estadosObraApi.getAll()
        if (estadosResponse.data.success) {
          setEstados(estadosResponse.data.data)
        }
      } catch (error) {
        console.error("Error fetching estado data:", error)
      } finally {
        setLoading(false)
      }
    }
    if (id) {
      fetchData()
    }
  }, [id])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editable) return
    if (!selectedEstado) {
      alert("Seleccione un estado")
      return
    }
    if (selectedEstado === currentEstadoId) {
      router.push(`/obras/${id}`)
      return
    }
    try {
      setSaving(true)
      await obrasApi.updateEstado(id, parseInt(selectedEstado))
      router.push(`/obras/${id}`)
    } catch (error) {
      console.error("Error cambiando estado:", error)
      alert("Error al cambiar el estado")
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <MainLayout>
        <div className="p-4">Cargando...</div>
      </MainLayout>
    )
  }

  if (!obra) {
    return (
      <MainLayout>
        <div className="p-4">Obra no encontrada</div>
      </MainLayout>
    )
  }

  const estadoActualNombre = estados.find((e) => e.id?.toString() === currentEstadoId)?.nombreEstadoObra

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href={`/obras/${id}`}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver
            </Link>
          </Button>
          <h1 className="text-2xl font-bold">Cambiar Estado</h1>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>{obra.nombreObra}</CardTitle>
            {estadoActualNombre && (
              <CardDescription>Estado actual: {estadoActualNombre}</CardDescription>
            )}
          </CardHeader>
          <CardContent>
            {!editable && (
              <p className="text-sm text-red-500 mb-4">
                La obra está finalizada o dada de baja y no puede cambiar de estado.
              </p>
            )}
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <Label htmlFor="estado">Nuevo Estado</Label>
                <Select
                  value={selectedEstado}
                  onValueChange={setSelectedEstado}
                  disabled={!editable}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccione un estado" />
                  </SelectTrigger>
                  <SelectContent>
                    {estados.map((estado) => (
                      <SelectItem key={estado.id} value={String(estado.id)}>
                        {estado.nombreEstadoObra}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex gap-4 justify-end">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push(`/obras/${id}`)}
                  disabled={saving}
                >
                  <X className="mr-2 h-4 w-4" />
                  Cancelar
                </Button>
                <Button type="submit" disabled={saving || !editable}>
                  <Save className="mr-2 h-4 w-4" />
                  {saving ? "Guardando..." : "Cambiar"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  )
}

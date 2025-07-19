"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { MainLayout } from "@/components/layout/main-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { ScrollArea } from "@/components/ui/scroll-area"
import { ArrowLeft, Edit } from "lucide-react"
import Link from "next/link"
import { riesgosApi } from "@/lib/api"
import type { RiesgoTecnico } from "@/types"

export default function RiesgoDetailPage() {
  const params = useParams()
  const id = Number.parseInt(params.id as string)

  const [riesgo, setRiesgo] = useState<RiesgoTecnico | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchRiesgo = async () => {
      try {
        setLoading(true)
        const res = await riesgosApi.getById(id)
        if (res.data.success) setRiesgo(res.data.data)
      } catch (error) {
        console.error("Error fetching riesgo:", error)
      } finally {
        setLoading(false)
      }
    }

    if (id) fetchRiesgo()
  }, [id])

  if (loading) {
    return (
      <MainLayout>
        <div className="text-center py-12">
          <p>Cargando datos del riesgo...</p>
        </div>
      </MainLayout>
    )
  }

  if (!riesgo) {
    return (
      <MainLayout>
        <div className="text-center py-12">
          <p>Riesgo no encontrado</p>
          <Button asChild className="mt-4">
            <Link href="/riesgos">Volver a Riesgos</Link>
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
              <Link href="/riesgos">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Volver
              </Link>
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Riesgo #{riesgo.nroRiesgo}</h1>
              <p className="text-gray-600">Riesgo técnico</p>
            </div>
          </div>
          <Button asChild disabled={!!riesgo.fechaBaja}>
            <Link href={`/riesgos/${id}/editar`}>
              <Edit className="mr-2 h-4 w-4" />
              Editar
            </Link>
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Información General</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p>{riesgo.naturalezaRiesgo}</p>
              {riesgo.fechaBaja && <Badge variant="destructive">Baja</Badge>}
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <span className="text-sm text-gray-500">Obras</span>
                  {riesgo.obraRiesgos && riesgo.obraRiesgos.length > 0 ? (
                    <Accordion type="single" collapsible className="w-full">
                      <AccordionItem value="obras">
                        <AccordionTrigger>
                          Ver obras asociadas ({riesgo.obraRiesgos.length})
                        </AccordionTrigger>
                        <AccordionContent>
                          <ScrollArea className="h-40">
                            <ul className="list-disc list-inside space-y-1">
                              {riesgo.obraRiesgos.map(or => (
                                <li key={or.id}>
                                  {or.obra?.nombreObra || "Obra sin nombre"}
                                </li>
                              ))}
                            </ul>
                          </ScrollArea>
                        </AccordionContent>
                      </AccordionItem>
                    </Accordion>
                  ) : (
                    <p className="font-medium">Sin obras</p>
                  )}
                </div>
                <div>
                  <span className="text-sm text-gray-500">Propuesta de Solución</span>
                  <p className="font-medium">{riesgo.propuestaSolucion}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-500">Medidas de Mitigación</span>
                  <p className="font-medium">{riesgo.medidasMitigacion}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-500">Acciones Ejecutadas</span>
                  <p className="font-medium">{riesgo.accionesEjecutadas}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  )
}

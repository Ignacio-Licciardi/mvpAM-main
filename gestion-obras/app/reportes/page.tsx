"use client"

import { MainLayout } from "@/components/layout/main-layout"
import { Card, CardContent } from "@/components/ui/card"

export default function ReportesPage() {
  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reportes</h1>
          <p className="text-gray-600">Sección de reportes del sistema</p>
        </div>
        <Card>
          <CardContent className="py-12">
            <div className="text-center text-gray-500">Página en mantenimiento.</div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  )
}

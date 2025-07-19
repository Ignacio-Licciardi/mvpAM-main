import axios from "axios"
import type {
  Obra,
  PlanProyecto,
  RiesgoTecnico,
  ObraEstadoObra,
  Departamento,
  Localidad,
  EstadoObra,
  Rubro,
  ApiResponse,
  PaginatedResponse,
  DashboardStats,
  ObrasPorEstado,
  InversionPorRubro,
  ObraPayload,
  ObraUpdatePayload,
} from "@/types"

// Configuración de la URL base según el entorno
const getBaseURL = () => {
  if (typeof window !== 'undefined') {
    // En el cliente, usar variable de entorno o localhost por defecto
    return process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api"
  }
  // En el servidor (SSR), usar localhost por defecto
  return process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api"
}

const api = axios.create({
  baseURL: getBaseURL(),
  headers: {
    "Content-Type": "application/json",
  },
})

// Obras
export const obrasApi = {
  getAll: () => api.get<PaginatedResponse<Obra>>("/obras"),
  getAllWithBajas: () => api.get<PaginatedResponse<Obra>>("/obras/all"),
  getById: (id: number) => api.get<ApiResponse<Obra>>(`/obras/${id}`),
  create: (obra: ObraPayload) => api.post<ApiResponse<Obra>>("/obras", obra),
  update: (id: number, obra: ObraUpdatePayload) =>
    api.put<ApiResponse<Obra>>(`/obras/${id}`, obra),
  delete: (id: number) => api.delete<ApiResponse<void>>(`/obras/${id}`),
  updateEstado: (id: number, estadoId: number) =>
    api.post<ApiResponse<ObraEstadoObra>>(`/obras/${id}/estado`, { estadoId }),
}

// Planes
export const planesApi = {
  getAll: () => api.get<PaginatedResponse<PlanProyecto>>("/planes"),
  getById: (id: number) => api.get<ApiResponse<PlanProyecto>>(`/planes/${id}`),
  create: (plan: Omit<PlanProyecto, "id">) => api.post<ApiResponse<PlanProyecto>>("/planes", plan),
  update: (id: number, plan: Partial<PlanProyecto>) => api.put<ApiResponse<PlanProyecto>>(`/planes/${id}`, plan),
  delete: (id: number) => api.delete<ApiResponse<void>>(`/planes/${id}`),
}

// Riesgos
export const riesgosApi = {
  getAll: () => api.get<PaginatedResponse<RiesgoTecnico>>("/riesgos"),
  getById: (id: number) => api.get<ApiResponse<RiesgoTecnico>>(`/riesgos/${id}`),
  exists: (nro: number) => api.get<ApiResponse<boolean>>(`/riesgos/exists/${nro}`),
  create: (riesgo: Omit<RiesgoTecnico, "id">) => api.post<ApiResponse<RiesgoTecnico>>("/riesgos", riesgo),
  update: (id: number, riesgo: Partial<RiesgoTecnico>) => api.put<ApiResponse<RiesgoTecnico>>(`/riesgos/${id}`, riesgo),
  delete: (id: number) => api.delete<ApiResponse<void>>(`/riesgos/${id}`),
}

// Departamentos
export const departamentosApi = {
  getAll: () => api.get<ApiResponse<Departamento[]>>("/departamentos"),
  getAllWithBajas: () => api.get<ApiResponse<Departamento[]>>("/departamentos/all"),
  getById: (id: number) => api.get<ApiResponse<Departamento>>(`/departamentos/${id}`),
  create: (departamento: Omit<Departamento, "id">) =>
    api.post<ApiResponse<Departamento>>("/departamentos", departamento),
  update: (id: number, departamento: Partial<Departamento>) =>
    api.put<ApiResponse<Departamento>>(`/departamentos/${id}`, departamento),
  delete: (id: number) => api.delete<ApiResponse<void>>(`/departamentos/${id}`),
}

// Localidades
export const localidadesApi = {
  getAll: () => api.get<ApiResponse<Localidad[]>>("/localidades"),
  getAllWithBajas: () => api.get<ApiResponse<Localidad[]>>("/localidades/all"),
  getById: (id: number) => api.get<ApiResponse<Localidad>>(`/localidades/${id}`),
  getByDepartamento: (departamentoId: number) =>
    api.get<ApiResponse<Localidad[]>>(`/localidades/departamento/${departamentoId}`),
  create: (localidad: Omit<Localidad, "id">) => api.post<ApiResponse<Localidad>>("/localidades", localidad),
  update: (id: number, localidad: Partial<Localidad>) =>
    api.put<ApiResponse<Localidad>>(`/localidades/${id}`, localidad),
  delete: (id: number) => api.delete<ApiResponse<void>>(`/localidades/${id}`),
}

// Estados de Obra
export const estadosObraApi = {
  getAll: () => api.get<ApiResponse<EstadoObra[]>>("/estados-obra"),
  getAllWithBajas: () => api.get<ApiResponse<EstadoObra[]>>("/estados-obra/all"),
  getById: (id: number) => api.get<ApiResponse<EstadoObra>>(`/estados-obra/${id}`),
  create: (estado: Omit<EstadoObra, "id">) => api.post<ApiResponse<EstadoObra>>("/estados-obra", estado),
  update: (id: number, estado: Partial<EstadoObra>) => api.put<ApiResponse<EstadoObra>>(`/estados-obra/${id}`, estado),
  delete: (id: number) => api.delete<ApiResponse<void>>(`/estados-obra/${id}`),
}

// Rubros
export const rubrosApi = {
  getAll: () => api.get<ApiResponse<Rubro[]>>("/rubros"),
  getAllWithBajas: () => api.get<ApiResponse<Rubro[]>>("/rubros/all"),
  getById: (id: number) => api.get<ApiResponse<Rubro>>(`/rubros/${id}`),
  create: (rubro: Omit<Rubro, "id">) => api.post<ApiResponse<Rubro>>("/rubros", rubro),
  update: (id: number, rubro: Partial<Rubro>) => api.put<ApiResponse<Rubro>>(`/rubros/${id}`, rubro),
  delete: (id: number) => api.delete<ApiResponse<void>>(`/rubros/${id}`),
}

// Dashboard
export const dashboardApi = {
  getStats: () => api.get<ApiResponse<DashboardStats>>("/dashboard/stats"),
  getObrasPorEstado: () =>
    api.get<ApiResponse<ObrasPorEstado[]>>("/dashboard/obras-por-estado"),
  getInversionPorRubro: () =>
    api.get<ApiResponse<InversionPorRubro[]>>("/dashboard/inversion-por-rubro"),
}

export default api

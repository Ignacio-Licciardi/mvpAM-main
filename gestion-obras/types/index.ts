export enum Prioridad {
  UNO = "UNO",
  DOS = "DOS",
  TRES = "TRES",
  CUATRO = "CUATRO",
}

export interface Departamento {
  id?: number
  nombreDepartamento: string
  localidades?: Localidad[]
  fechaBaja?: string | null
}

export interface Localidad {
  id?: number
  nombreLocalidad: string
  departamento: Departamento
  fechaBaja?: string | null
}

export interface EstadoObra {
  id?: number
  nombreEstadoObra: string
  fechaBaja?: string | null
}

export interface Rubro {
  id?: number
  nombreRubro: string
  fechaBaja?: string | null
}

export interface Obra {
  id?: number
  nroObra: number
  nombreObra: string
  tiempoEjecucion: number
  anioEjecucion: number
  fechaInicioObra: string
  inversionFinal: number
  localidad: Localidad
  planProyecto?: PlanProyecto
  obraRiesgos?: ObraRiesgo[]
  /**
   * Historial de estados de la obra
   */
  obraEstadoObras?: ObraEstadoObra[]
  obraRubros?: ObraRubro[]
  fechaAlta?: string
  fechaBaja?: string | null
}

export interface PlanProyecto {
  id?: number
  nombrePlanProyecto: string
  descripcionPlanProyecto: string
  mesesEstudio: number
  inversionEstimada: number
  tiempoEstimado: number
  seEjecuta: boolean
  prioridad: Prioridad
  rubro: Rubro
  obras?: Obra[]
  fechaAlta?: string
  fechaBaja?: string | null
}

export interface RiesgoTecnico {
  id?: number
  nroRiesgo: number
  naturalezaRiesgo: string
  propuestaSolucion: string
  medidasMitigacion: string
  accionesEjecutadas: string
  obraRiesgos?: ObraRiesgo[]
  fechaAlta?: string
  fechaBaja?: string | null
}

export interface ObraEstadoObra {
  id?: number
  obra: Obra
  estadoObra: EstadoObra
  fechaHoraInicio: string
  fechaHoraFin?: string
}

export interface ObraRubro {
  id?: number
  obra: Obra
  rubro: Rubro
}

export interface ObraRiesgo {
  id?: number
  obra: Obra
  riesgoTecnico: RiesgoTecnico
}

export interface ObraPayload extends Omit<Obra, "id" | "localidad"> {
  localidad: Pick<Localidad, "id">
  planProyecto?: Pick<PlanProyecto, "id">
  obraRiesgos?: { riesgoTecnico: Pick<RiesgoTecnico, "id"> }[]
}

export interface ObraUpdatePayload extends Partial<Omit<Obra, "localidad">> {
  localidad?: Pick<Localidad, "id">
  planProyecto?: Pick<PlanProyecto, "id">
  obraRiesgos?: { riesgoTecnico: Pick<RiesgoTecnico, "id"> }[]
}

export interface ApiResponse<T> {
  data: T
  message?: string
  success: boolean
}

export interface PaginatedResponse<T> {
  content: T[]
  page: number
  size: number
  totalElements: number
  totalPages: number
}

export interface DashboardStats {
  totalObras: number
  planesActivos: number
  inversionTotal: number
  riesgosPendientes: number
}

export interface ObrasPorEstado {
  estado: string
  cantidad: number
}

export interface InversionPorRubro {
  rubro: string
  inversion: number
}

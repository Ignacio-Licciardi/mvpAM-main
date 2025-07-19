package com.AM.mvpAM.controllers;

import com.AM.mvpAM.dto.ApiResponse;
import com.AM.mvpAM.dto.PaginatedResponse;
import com.AM.mvpAM.entities.Obra;
import com.AM.mvpAM.entities.PlanProyecto;
import com.AM.mvpAM.entities.RiesgoTecnico;
import com.AM.mvpAM.entities.ObraRiesgo;
import com.AM.mvpAM.entities.EstadoObra;
import com.AM.mvpAM.entities.ObraEstadoObra;
import com.AM.mvpAM.entities.Localidad;
import com.AM.mvpAM.repositories.ObraRepository;
import com.AM.mvpAM.repositories.PlanProyectoRepository;
import com.AM.mvpAM.repositories.RiesgoTecnicoRepository;
import com.AM.mvpAM.repositories.ObraRiesgoRepository;
import com.AM.mvpAM.repositories.EstadoObraRepository;
import com.AM.mvpAM.repositories.ObraEstadoObraRepository;
import com.AM.mvpAM.repositories.LocalidadRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;
import java.util.ArrayList;

@RestController
@RequestMapping("/api/obras")
public class ObraController {

    private final ObraRepository obraRepository;
    private final PlanProyectoRepository planProyectoRepository;
    private final RiesgoTecnicoRepository riesgoTecnicoRepository;
    private final ObraRiesgoRepository obraRiesgoRepository;
    private final EstadoObraRepository estadoObraRepository;
    private final ObraEstadoObraRepository obraEstadoObraRepository;
    private final LocalidadRepository localidadRepository;

    public ObraController(ObraRepository obraRepository,
                          PlanProyectoRepository planProyectoRepository,
                          RiesgoTecnicoRepository riesgoTecnicoRepository,
                          ObraRiesgoRepository obraRiesgoRepository,
                          EstadoObraRepository estadoObraRepository,
                          ObraEstadoObraRepository obraEstadoObraRepository,
                          LocalidadRepository localidadRepository) {
        this.obraRepository = obraRepository;
        this.planProyectoRepository = planProyectoRepository;
        this.riesgoTecnicoRepository = riesgoTecnicoRepository;
        this.obraRiesgoRepository = obraRiesgoRepository;
        this.estadoObraRepository = estadoObraRepository;
        this.obraEstadoObraRepository = obraEstadoObraRepository;
        this.localidadRepository = localidadRepository;
    }

    @GetMapping
    public PaginatedResponse<Obra> getAll(Pageable pageable) {
        Page<Obra> page = obraRepository.findByFechaBajaIsNull(pageable);
        return new PaginatedResponse<>(
                page.getContent(),
                page.getNumber(),
                page.getSize(),
                page.getTotalElements(),
                page.getTotalPages()
        );
    }

    @GetMapping("/all")
    public PaginatedResponse<Obra> getAllIncludingBajas(Pageable pageable) {
        Page<Obra> page = obraRepository.findAll(pageable);
        return new PaginatedResponse<>(
                page.getContent(),
                page.getNumber(),
                page.getSize(),
                page.getTotalElements(),
                page.getTotalPages()
        );
    }

    @GetMapping("/{id}")
    public ApiResponse<Obra> getById(@PathVariable Long id) {
        return obraRepository.findByIdAndFechaBajaIsNull(id)
                .map(o -> new ApiResponse<>(true, o))
                .orElseGet(() -> new ApiResponse<>(false, null, "Not found"));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<Obra>> create(@RequestBody Obra obra) {
        try {
            // Validaciones básicas
            if (obra.getNroObra() == null) {
                return ResponseEntity.badRequest()
                        .body(ApiResponse.error("El número de obra es requerido"));
            }

            if (obra.getNombreObra() == null || obra.getNombreObra().trim().isEmpty()) {
                return ResponseEntity.badRequest()
                        .body(ApiResponse.error("El nombre de la obra es requerido"));
            }

            if (obra.getTiempoEjecucion() == null || obra.getTiempoEjecucion() <= 0) {
                return ResponseEntity.badRequest()
                        .body(ApiResponse.error("El tiempo de ejecución debe ser mayor a 0"));
            }

            if (obra.getAnioEjecucion() == null || obra.getAnioEjecucion() < 2000) {
                return ResponseEntity.badRequest()
                        .body(ApiResponse.error("El año de ejecución debe ser válido"));
            }

            if (obra.getLocalidad() == null || obra.getLocalidad().getId() == null) {
                return ResponseEntity.badRequest()
                        .body(ApiResponse.error("La localidad es requerida"));
            }

            if (obra.getInversionFinal() == null || obra.getInversionFinal().doubleValue() <= 0) {
                return ResponseEntity.badRequest()
                        .body(ApiResponse.error("La inversión final debe ser mayor a 0"));
            }

            if (obra.getFechaInicioObra() == null) {
                return ResponseEntity.badRequest()
                        .body(ApiResponse.error("La fecha de inicio es requerida"));
            }

            // Verificar que no exista otra obra con el mismo número
            boolean existeObra = obraRepository.existsByNroObraAndFechaBajaIsNull(obra.getNroObra());
            if (existeObra) {
                return ResponseEntity.badRequest()
                        .body(ApiResponse.error("Ya existe una obra activa con el número " + obra.getNroObra()));
            }

            // Verificar que la localidad existe
            Optional<Localidad> localidadOpt = localidadRepository.findByIdAndFechaBajaIsNull(obra.getLocalidad().getId());
            if (localidadOpt.isEmpty()) {
                return ResponseEntity.badRequest()
                        .body(ApiResponse.error("La localidad seleccionada no existe"));
            }

            // Conservar ids de plan y riesgos enviados
            Long planId = obra.getPlanProyecto() != null ?
                    obra.getPlanProyecto().getId() : null;
            java.util.List<Long> riesgoIds = new java.util.ArrayList<>();
            if (obra.getObraRiesgos() != null) {
                for (ObraRiesgo or : obra.getObraRiesgos()) {
                    if (or.getRiesgoTecnico() != null && or.getRiesgoTecnico().getId() != null) {
                        riesgoIds.add(or.getRiesgoTecnico().getId());
                    }
                }
            }

            for (Long rid : riesgoIds) {
                if (riesgoTecnicoRepository.findByIdAndFechaBajaIsNull(rid).isEmpty()) {
                    return ResponseEntity.badRequest()
                            .body(ApiResponse.error("Riesgo técnico inválido o dado de baja"));
                }
            }

            // Asignar la localidad completa
            obra.setLocalidad(localidadOpt.get());

            // Limpiar referencias que pueden causar problemas de persistencia
            obra.setPlanProyecto(null);
            obra.setObraRiesgos(new ArrayList<>());
            obra.setObraEstadoObras(new ArrayList<>());
            obra.setObraRubros(new ArrayList<>());

            // Guardar la obra PRIMERO sin relaciones
            Obra savedObra = obraRepository.save(obra);

            // Crear estado inicial "Planificacion"
            Optional<EstadoObra> estadoPlanificacion = estadoObraRepository
                    .findFirstByNombreEstadoObraIgnoreCaseAndFechaBajaIsNull("Planificacion");

            if (estadoPlanificacion.isPresent()) {
                ObraEstadoObra registro = new ObraEstadoObra();
                registro.setObra(savedObra);
                registro.setEstadoObra(estadoPlanificacion.get());
                registro.setFechaHoraInicio(java.time.LocalDateTime.now());
                obraEstadoObraRepository.save(registro);
            }

            // Asignar plan de proyecto si se envió uno
            if (planId != null) {
                Optional<PlanProyecto> planOpt = planProyectoRepository.findByIdAndFechaBajaIsNull(planId);
                if (planOpt.isPresent()) {
                    PlanProyecto plan = planOpt.get();
                    plan.setSeEjecuta(true);
                    planProyectoRepository.save(plan);
                    savedObra.setPlanProyecto(plan);
                    obraRepository.save(savedObra);
                } else {
                    return ResponseEntity.badRequest().body(ApiResponse.error("El plan seleccionado no existe"));
                }
            }

            // Manejar riesgos técnicos del request original
            java.util.List<ObraRiesgo> relaciones = new ArrayList<>();
            final Obra obraRef = savedObra;
            for (Long rid : riesgoIds) {
                riesgoTecnicoRepository.findByIdAndFechaBajaIsNull(rid).ifPresent(rt -> {
                    ObraRiesgo link = new ObraRiesgo();
                    link.setObra(obraRef);
                    link.setRiesgoTecnico(rt);
                    relaciones.add(obraRiesgoRepository.save(link));
                });
            }
            savedObra.getObraRiesgos().clear();
            savedObra.getObraRiesgos().addAll(relaciones);
            obraRepository.save(savedObra);

            // Recargar la obra con todas las relaciones actualizadas
            savedObra = obraRepository.findByIdAndFechaBajaIsNull(savedObra.getId()).orElse(savedObra);

            return ResponseEntity.ok(ApiResponse.success(savedObra, "Obra creada exitosamente"));
        } catch (Exception e) {
            System.err.println("Error al crear obra: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.internalServerError()
                    .body(ApiResponse.error("Error interno del servidor: " + e.getMessage()));
        }
    }

    @PutMapping(value = "/{id}")
    public ResponseEntity<ApiResponse<Obra>> update(@PathVariable Long id, @RequestBody Obra obra) {
        try {
            Optional<Obra> existingObra = obraRepository.findByIdAndFechaBajaIsNull(id);
            if (existingObra.isPresent()) {
                Obra o = existingObra.get();

                if (o.getFechaBaja() != null) {
                    return ResponseEntity.badRequest()
                            .body(ApiResponse.error("La obra está dada de baja y no puede modificarse"));
                }

                boolean finalizada = o.getObraEstadoObras().stream()
                        .anyMatch(e -> e.getFechaHoraFin() == null &&
                                e.getEstadoObra().getNombreEstadoObra().equalsIgnoreCase("finalizada"));
                if (finalizada) {
                    return ResponseEntity.badRequest()
                            .body(ApiResponse.error("La obra está finalizada y no puede modificarse"));
                }
                o.setNroObra(obra.getNroObra());
                o.setNombreObra(obra.getNombreObra());
                o.setTiempoEjecucion(obra.getTiempoEjecucion());
                o.setAnioEjecucion(obra.getAnioEjecucion());
                o.setFechaInicioObra(obra.getFechaInicioObra());
                o.setFechaFinObra(obra.getFechaFinObra());
                o.setInversionFinal(obra.getInversionFinal());

                if (obra.getLocalidad() == null || obra.getLocalidad().getId() == null) {
                    return ResponseEntity.badRequest()
                            .body(ApiResponse.error("La localidad es requerida"));
                }
                Optional<Localidad> locOpt = localidadRepository.findByIdAndFechaBajaIsNull(obra.getLocalidad().getId());
                if (locOpt.isEmpty()) {
                    return ResponseEntity.badRequest()
                            .body(ApiResponse.error("La localidad seleccionada no existe"));
                }
                o.setLocalidad(locOpt.get());

                // Actualizar plan de proyecto
                if (obra.getPlanProyecto() != null && obra.getPlanProyecto().getId() != null) {
                    Long nuevoId = obra.getPlanProyecto().getId();
                    Optional<PlanProyecto> planOpt = planProyectoRepository.findByIdAndFechaBajaIsNull(nuevoId);
                    if (planOpt.isEmpty()) {
                        return ResponseEntity.badRequest()
                                .body(ApiResponse.error("El plan seleccionado no existe"));
                    }
                    PlanProyecto plan = planOpt.get();
                    if (o.getPlanProyecto() != null && !o.getPlanProyecto().getId().equals(nuevoId)) {
                        PlanProyecto actual = o.getPlanProyecto();
                        o.setPlanProyecto(null);
                        obraRepository.save(o);
                        long usos = obraRepository.countByPlanProyectoIdAndFechaBajaIsNull(actual.getId());
                        if (usos == 0) {
                            actual.setSeEjecuta(false);
                        }
                        planProyectoRepository.save(actual);
                    }
                    o.setPlanProyecto(plan);
                    plan.setSeEjecuta(true);
                    planProyectoRepository.save(plan);
                } else if (o.getPlanProyecto() != null && obra.getPlanProyecto() == null) {
                    PlanProyecto actual = o.getPlanProyecto();
                    o.setPlanProyecto(null);
                    obraRepository.save(o);
                    long usos = obraRepository.countByPlanProyectoIdAndFechaBajaIsNull(actual.getId());
                    if (usos == 0) {
                        actual.setSeEjecuta(false);
                    }
                    planProyectoRepository.save(actual);
                }

                // Actualizar riesgos técnicos
                if (obra.getObraRiesgos() != null) {
                    java.util.Set<Long> nuevosIds = new java.util.HashSet<>();
                    for (ObraRiesgo or : obra.getObraRiesgos()) {
                        if (or.getRiesgoTecnico() != null && or.getRiesgoTecnico().getId() != null) {
                            nuevosIds.add(or.getRiesgoTecnico().getId());
                        }
                    }

                    for (Long rid : nuevosIds) {
                        if (riesgoTecnicoRepository.findByIdAndFechaBajaIsNull(rid).isEmpty()) {
                            return ResponseEntity.badRequest()
                                    .body(ApiResponse.error("Riesgo técnico inválido o dado de baja"));
                        }
                    }

                    // Eliminar relaciones que ya no están
                    java.util.Iterator<ObraRiesgo> it = o.getObraRiesgos().iterator();
                    while (it.hasNext()) {
                        ObraRiesgo link = it.next();
                        if (!nuevosIds.contains(link.getRiesgoTecnico().getId())) {
                            it.remove();
                            obraRiesgoRepository.delete(link);
                        }
                    }

                    // Agregar nuevas relaciones
                    for (Long rid : nuevosIds) {
                        boolean exists = o.getObraRiesgos().stream()
                                .anyMatch(l -> l.getRiesgoTecnico().getId().equals(rid));
                        if (!exists) {
                            riesgoTecnicoRepository.findByIdAndFechaBajaIsNull(rid).ifPresent(rt -> {
                                ObraRiesgo link = new ObraRiesgo();
                                link.setObra(o);
                                link.setRiesgoTecnico(rt);
                                o.getObraRiesgos().add(obraRiesgoRepository.save(link));
                            });
                        }
                    }
                }

                Obra updatedObra = obraRepository.save(o);
                return ResponseEntity.ok(ApiResponse.success(updatedObra, "Obra actualizada exitosamente"));
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body(ApiResponse.error("Error al actualizar la obra"));
        }
    }

    @PostMapping("/{id}/estado")
    public ResponseEntity<ApiResponse<ObraEstadoObra>> cambiarEstado(@PathVariable Long id, @RequestBody java.util.Map<String, Long> body) {
        Long estadoId = body.get("estadoId");
        if (estadoId == null) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Estado requerido"));
        }
        Optional<Obra> obraOpt = obraRepository.findByIdAndFechaBajaIsNull(id);
        Optional<EstadoObra> estadoOpt = estadoObraRepository.findByIdAndFechaBajaIsNull(estadoId);
        if (obraOpt.isPresent() && estadoOpt.isPresent()) {
            Obra obra = obraOpt.get();
            EstadoObra nuevoEstado = estadoOpt.get();

            if (obra.getFechaBaja() != null) {
                return ResponseEntity.badRequest()
                        .body(ApiResponse.error("La obra está dada de baja"));
            }

            boolean finalizada = obra.getObraEstadoObras().stream()
                    .anyMatch(e -> e.getFechaHoraFin() == null &&
                            e.getEstadoObra().getNombreEstadoObra().equalsIgnoreCase("finalizada"));
            if (finalizada) {
                return ResponseEntity.badRequest()
                        .body(ApiResponse.error("La obra está finalizada"));
            }

            obra.getObraEstadoObras().stream()
                    .filter(e -> e.getFechaHoraFin() == null)
                    .forEach(e -> e.setFechaHoraFin(java.time.LocalDateTime.now()));

            ObraEstadoObra registro = new ObraEstadoObra();
            registro.setObra(obra);
            registro.setEstadoObra(nuevoEstado);
            registro.setFechaHoraInicio(java.time.LocalDateTime.now());
            obraEstadoObraRepository.save(registro);
            obra.getObraEstadoObras().add(registro);
            obraRepository.save(obra);
            return ResponseEntity.ok(ApiResponse.success(registro, "Estado actualizado"));
        }
        return ResponseEntity.notFound().build();
    }

    @DeleteMapping("/{id}")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        Optional<Obra> obraOpt = obraRepository.findByIdAndFechaBajaIsNull(id);
        if (obraOpt.isPresent()) {
            Obra obra = obraOpt.get();
            obra.setFechaBaja(java.time.LocalDateTime.now());
            obraRepository.save(obra);

            if (obra.getPlanProyecto() != null) {
                PlanProyecto plan = obra.getPlanProyecto();
                long usos = obraRepository.countByPlanProyectoIdAndFechaBajaIsNull(plan.getId());
                if (usos == 0) {
                    plan.setSeEjecuta(false);
                    planProyectoRepository.save(plan);
                }
            }

            return new ApiResponse<>(true, null);
        }
        return new ApiResponse<>(false, null, "Not found");
    }
}

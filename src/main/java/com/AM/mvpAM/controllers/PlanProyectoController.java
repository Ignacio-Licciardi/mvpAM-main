package com.AM.mvpAM.controllers;

import com.AM.mvpAM.dto.ApiResponse;
import com.AM.mvpAM.dto.PaginatedResponse;
import com.AM.mvpAM.entities.PlanProyecto;
import com.AM.mvpAM.repositories.PlanProyectoRepository;
import com.AM.mvpAM.repositories.ObraRepository;
import com.AM.mvpAM.repositories.RubroRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.web.bind.annotation.*;
import java.util.Optional;

@RestController
@RequestMapping("/api/planes")
@CrossOrigin(origins = "http://localhost:3000")
public class PlanProyectoController {

    private final PlanProyectoRepository planProyectoRepository;
    private final ObraRepository obraRepository;
    private final RubroRepository rubroRepository;

    public PlanProyectoController(PlanProyectoRepository planProyectoRepository,
                                  ObraRepository obraRepository,
                                  RubroRepository rubroRepository) {
        this.planProyectoRepository = planProyectoRepository;
        this.obraRepository = obraRepository;
        this.rubroRepository = rubroRepository;
    }

    @GetMapping
    public PaginatedResponse<PlanProyecto> getAll(Pageable pageable) {
        Page<PlanProyecto> page = planProyectoRepository.findAll(pageable);
        return new PaginatedResponse<>(
                page.getContent(),
                page.getNumber(),
                page.getSize(),
                page.getTotalElements(),
                page.getTotalPages()
        );
    }

    @GetMapping("/{id}")
    public ApiResponse<PlanProyecto> getById(@PathVariable Long id) {
        return planProyectoRepository.findByIdAndFechaBajaIsNull(id)
                .map(p -> new ApiResponse<>(true, p))
                .orElseGet(() -> new ApiResponse<>(false, null, "Not found"));
    }

    @PostMapping
    public ApiResponse<PlanProyecto> create(@RequestBody PlanProyecto plan) {
        if (plan.getRubro() == null || plan.getRubro().getId() == null ||
                rubroRepository.findByIdAndFechaBajaIsNull(plan.getRubro().getId()).isEmpty()) {
            return new ApiResponse<>(false, null, "Rubro inválido o dado de baja");
        }
        plan.setRubro(rubroRepository.findByIdAndFechaBajaIsNull(plan.getRubro().getId()).get());
        plan.setSeEjecuta(false);
        return new ApiResponse<>(true, planProyectoRepository.save(plan));
    }

    @PutMapping("/{id}")
    public ApiResponse<PlanProyecto> update(@PathVariable Long id, @RequestBody PlanProyecto plan) {
        return planProyectoRepository.findByIdAndFechaBajaIsNull(id).map(p -> {
            if (Boolean.TRUE.equals(p.getSeEjecuta())) {
                return new ApiResponse<PlanProyecto>(false, null, "El plan está en ejecución y no puede modificarse");
            }

            if (plan.getRubro() == null || plan.getRubro().getId() == null ||
                    rubroRepository.findByIdAndFechaBajaIsNull(plan.getRubro().getId()).isEmpty()) {
                return new ApiResponse<PlanProyecto>(false, null, "Rubro inválido o dado de baja");
            }

            p.setNombrePlanProyecto(plan.getNombrePlanProyecto());
            p.setDescripcionPlanProyecto(plan.getDescripcionPlanProyecto());
            p.setMesesEstudio(plan.getMesesEstudio());
            p.setInversionEstimada(plan.getInversionEstimada());
            p.setTiempoEstimado(plan.getTiempoEstimado());
            p.setPrioridad(plan.getPrioridad());
            p.setRubro(rubroRepository.findByIdAndFechaBajaIsNull(plan.getRubro().getId()).get());
            return new ApiResponse<>(true, planProyectoRepository.save(p));
        }).orElseGet(() -> new ApiResponse<>(false, null, "Not found"));
    }

    @DeleteMapping("/{id}")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        Optional<PlanProyecto> planOpt = planProyectoRepository.findById(id);
        if (planOpt.isPresent()) {
            PlanProyecto plan = planOpt.get();
            if (plan.getFechaBaja() != null) {
                return new ApiResponse<>(false, null, "El plan ya está dado de baja");
            }
            long obrasActivas = obraRepository.countByPlanProyectoIdAndFechaBajaIsNull(plan.getId());
            if (obrasActivas > 0) {
                return new ApiResponse<>(false, null, "El plan está asociado a una obra activa");
            }
            plan.setFechaBaja(java.time.LocalDateTime.now());
            plan.setSeEjecuta(false);
            planProyectoRepository.save(plan);
            return new ApiResponse<>(true, null);
        }
        return new ApiResponse<>(false, null, "Not found");
    }
}


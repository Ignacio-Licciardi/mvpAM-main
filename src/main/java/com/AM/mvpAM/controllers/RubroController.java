package com.AM.mvpAM.controllers;

import com.AM.mvpAM.dto.ApiResponse;
import com.AM.mvpAM.entities.Rubro;
import com.AM.mvpAM.repositories.RubroRepository;
import com.AM.mvpAM.repositories.PlanProyectoRepository;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/rubros")
public class RubroController {

    private final RubroRepository rubroRepository;
    private final PlanProyectoRepository planProyectoRepository;

    public RubroController(RubroRepository rubroRepository,
                           PlanProyectoRepository planProyectoRepository) {
        this.rubroRepository = rubroRepository;
        this.planProyectoRepository = planProyectoRepository;
    }

    @GetMapping
    public ApiResponse<List<Rubro>> getAll() {
        return new ApiResponse<>(true, rubroRepository.findByFechaBajaIsNull());
    }

    @GetMapping("/all")
    public ApiResponse<List<Rubro>> getAllIncludingBajas() {
        return new ApiResponse<>(true, rubroRepository.findAll());
    }

    @GetMapping("/{id}")
    public ApiResponse<Rubro> getById(@PathVariable Long id) {
        return rubroRepository.findByIdAndFechaBajaIsNull(id)
                .map(r -> new ApiResponse<>(true, r))
                .orElseGet(() -> new ApiResponse<>(false, null, "Not found"));
    }

    @PostMapping
    public ApiResponse<Rubro> create(@RequestBody Rubro rubro) {
        if (rubro.getNombreRubro() == null || rubro.getNombreRubro().trim().isEmpty()) {
            return ApiResponse.error("Nombre de rubro requerido");
        }
        if (rubroRepository.existsByNombreRubroIgnoreCaseAndFechaBajaIsNull(rubro.getNombreRubro())) {
            return ApiResponse.error("Ya existe un rubro con ese nombre");
        }
        return new ApiResponse<>(true, rubroRepository.save(rubro));
    }

    @PutMapping("/{id}")
    public ApiResponse<Rubro> update(@PathVariable Long id, @RequestBody Rubro rubro) {
        return rubroRepository.findByIdAndFechaBajaIsNull(id).map(r -> {
            if (rubro.getNombreRubro() == null || rubro.getNombreRubro().trim().isEmpty()) {
                return ApiResponse.<Rubro>error("Nombre de rubro requerido");
            }
            if (rubroRepository.existsByNombreRubroIgnoreCaseAndFechaBajaIsNullAndIdNot(rubro.getNombreRubro(), id)) {
                return ApiResponse.<Rubro>error("Ya existe un rubro con ese nombre");
            }
            r.setNombreRubro(rubro.getNombreRubro());
            return new ApiResponse<>(true, rubroRepository.save(r));
        }).orElseGet(() -> new ApiResponse<>(false, null, "Not found"));
    }

    @DeleteMapping("/{id}")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        return rubroRepository.findByIdAndFechaBajaIsNull(id).map(r -> {
            long usos = planProyectoRepository.countByRubroIdAndFechaBajaIsNull(id);
            if (usos > 0) {
                return new ApiResponse<Void>(false, null, "El rubro está asociado a un plan activo");
            }
            r.setFechaBaja(LocalDateTime.now());
            rubroRepository.save(r);
            return new ApiResponse<Void>(true, null);
        }).orElseGet(() -> new ApiResponse<>(false, null, "Not found"));
    }
}


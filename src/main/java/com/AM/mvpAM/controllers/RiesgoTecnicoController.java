package com.AM.mvpAM.controllers;

import com.AM.mvpAM.dto.ApiResponse;
import com.AM.mvpAM.dto.PaginatedResponse;
import com.AM.mvpAM.entities.RiesgoTecnico;
import com.AM.mvpAM.repositories.RiesgoTecnicoRepository;
import com.AM.mvpAM.repositories.ObraRiesgoRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDateTime;

@RestController
@RequestMapping("/api/riesgos")
public class RiesgoTecnicoController {

    private final RiesgoTecnicoRepository riesgoTecnicoRepository;
    private final ObraRiesgoRepository obraRiesgoRepository;

    public RiesgoTecnicoController(RiesgoTecnicoRepository riesgoTecnicoRepository,
                                   ObraRiesgoRepository obraRiesgoRepository) {
        this.riesgoTecnicoRepository = riesgoTecnicoRepository;
        this.obraRiesgoRepository = obraRiesgoRepository;
    }

    @GetMapping
    public PaginatedResponse<RiesgoTecnico> getAll(Pageable pageable) {
        Page<RiesgoTecnico> page = riesgoTecnicoRepository.findAll(pageable);
        return new PaginatedResponse<>(
                page.getContent(),
                page.getNumber(),
                page.getSize(),
                page.getTotalElements(),
                page.getTotalPages()
        );
    }

    @GetMapping("/{id}")
    public ApiResponse<RiesgoTecnico> getById(@PathVariable Long id) {
        return riesgoTecnicoRepository.findByIdAndFechaBajaIsNull(id)
                .map(r -> new ApiResponse<RiesgoTecnico>(true, r))
                .orElseGet(() -> new ApiResponse<RiesgoTecnico>(false, null, "Not found"));
    }

    @GetMapping("/exists/{nro}")
    public ApiResponse<Boolean> existsByNro(@PathVariable("nro") Long nro) {
        boolean exists = riesgoTecnicoRepository.existsByNroRiesgo(nro);
        return new ApiResponse<>(true, exists);
    }

    @PostMapping
    public ApiResponse<RiesgoTecnico> create(@RequestBody RiesgoTecnico riesgo) {
        if (riesgo.getNroRiesgo() == null) {
            return ApiResponse.<RiesgoTecnico>error("Número de riesgo requerido");
        }
        if (riesgoTecnicoRepository.existsByNroRiesgo(riesgo.getNroRiesgo())) {
            return ApiResponse.<RiesgoTecnico>error("Ya existe un riesgo con ese número");
        }
        if (riesgo.getNaturalezaRiesgo() == null || riesgo.getNaturalezaRiesgo().trim().isEmpty()) {
            return ApiResponse.<RiesgoTecnico>error("La naturaleza del riesgo es requerida");
        }
        return new ApiResponse<>(true, riesgoTecnicoRepository.save(riesgo));
    }

    @PutMapping("/{id}")
    public ApiResponse<RiesgoTecnico> update(@PathVariable Long id, @RequestBody RiesgoTecnico riesgo) {
        return riesgoTecnicoRepository.findByIdAndFechaBajaIsNull(id).map(r -> {
            if (riesgo.getNroRiesgo() == null) {
                return ApiResponse.<RiesgoTecnico>error("Número de riesgo requerido");
            }
            if (riesgoTecnicoRepository.existsByNroRiesgoAndIdNot(riesgo.getNroRiesgo(), id)) {
                return ApiResponse.<RiesgoTecnico>error("Ya existe un riesgo con ese número");
            }
            if (riesgo.getNaturalezaRiesgo() == null || riesgo.getNaturalezaRiesgo().trim().isEmpty()) {
                return ApiResponse.<RiesgoTecnico>error("La naturaleza del riesgo es requerida");
            }

            r.setNroRiesgo(riesgo.getNroRiesgo());
            r.setNaturalezaRiesgo(riesgo.getNaturalezaRiesgo());
            r.setPropuestaSolucion(riesgo.getPropuestaSolucion());
            r.setMedidasMitigacion(riesgo.getMedidasMitigacion());
            r.setAccionesEjecutadas(riesgo.getAccionesEjecutadas());
            return new ApiResponse<>(true, riesgoTecnicoRepository.save(r));
        }).orElseGet(() -> new ApiResponse<RiesgoTecnico>(false, null, "Not found"));
    }

    @DeleteMapping("/{id}")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        return riesgoTecnicoRepository.findByIdAndFechaBajaIsNull(id).map(r -> {
            long usos = obraRiesgoRepository.countByRiesgoTecnicoIdAndObraFechaBajaIsNull(id);
            if (usos > 0) {
                return new ApiResponse<Void>(false, null, "El riesgo está asociado a una obra activa");
            }
            r.setFechaBaja(LocalDateTime.now());
            riesgoTecnicoRepository.save(r);
            return new ApiResponse<Void>(true, null);
        }).orElseGet(() -> new ApiResponse<Void>(false, null, "Not found"));
    }
}


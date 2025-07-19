package com.AM.mvpAM.controllers;

import com.AM.mvpAM.dto.ApiResponse;
import com.AM.mvpAM.entities.EstadoObra;
import com.AM.mvpAM.repositories.EstadoObraRepository;
import com.AM.mvpAM.repositories.ObraEstadoObraRepository;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;

import java.util.List;

@RestController
@RequestMapping("/api/estados-obra")
public class EstadoObraController {

    private final EstadoObraRepository estadoObraRepository;
    private final ObraEstadoObraRepository obraEstadoObraRepository;

    public EstadoObraController(EstadoObraRepository estadoObraRepository,
                                ObraEstadoObraRepository obraEstadoObraRepository) {
        this.estadoObraRepository = estadoObraRepository;
        this.obraEstadoObraRepository = obraEstadoObraRepository;
    }

    @GetMapping
    public ApiResponse<List<EstadoObra>> getAll() {
        return new ApiResponse<>(true, estadoObraRepository.findByFechaBajaIsNull());
    }

    @GetMapping("/all")
    public ApiResponse<List<EstadoObra>> getAllIncludingBajas() {
        return new ApiResponse<>(true, estadoObraRepository.findAll());
    }

    @GetMapping("/{id}")
    public ApiResponse<EstadoObra> getById(@PathVariable Long id) {
        return estadoObraRepository.findByIdAndFechaBajaIsNull(id)
                .map(e -> new ApiResponse<>(true, e))
                .orElseGet(() -> new ApiResponse<>(false, null, "Not found"));
    }

    @PostMapping
    public ApiResponse<EstadoObra> create(@RequestBody EstadoObra estado) {
        if (estado.getNombreEstadoObra() == null || estado.getNombreEstadoObra().trim().isEmpty()) {
            return ApiResponse.error("Nombre de estado requerido");
        }
        if (estadoObraRepository.existsByNombreEstadoObraIgnoreCaseAndFechaBajaIsNull(estado.getNombreEstadoObra())) {
            return ApiResponse.error("Ya existe un estado con ese nombre");
        }
        return new ApiResponse<>(true, estadoObraRepository.save(estado));
    }

    @PutMapping("/{id}")
    public ApiResponse<EstadoObra> update(@PathVariable Long id, @RequestBody EstadoObra estado) {
        return estadoObraRepository.findByIdAndFechaBajaIsNull(id).map(e -> {
            if (estado.getNombreEstadoObra() == null || estado.getNombreEstadoObra().trim().isEmpty()) {
                return ApiResponse.<EstadoObra>error("Nombre de estado requerido");
            }
            if (estadoObraRepository.existsByNombreEstadoObraIgnoreCaseAndFechaBajaIsNullAndIdNot(estado.getNombreEstadoObra(), id)) {
                return ApiResponse.<EstadoObra>error("Ya existe un estado con ese nombre");
            }
            e.setNombreEstadoObra(estado.getNombreEstadoObra());
            return new ApiResponse<>(true, estadoObraRepository.save(e));
        }).orElseGet(() -> new ApiResponse<>(false, null, "Not found"));
    }

    @DeleteMapping("/{id}")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        return estadoObraRepository.findByIdAndFechaBajaIsNull(id).map(e -> {
            long usos = obraEstadoObraRepository.countByEstadoObraIdAndObraFechaBajaIsNull(id);
            if (usos > 0) {
                return new ApiResponse<Void>(false, null, "El estado está asociado a una obra activa");
            }
            e.setFechaBaja(LocalDateTime.now());
            estadoObraRepository.save(e);
            return new ApiResponse<Void>(true, null);
        }).orElseGet(() -> new ApiResponse<>(false, null, "Not found"));
    }
}


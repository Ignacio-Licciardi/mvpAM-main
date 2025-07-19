package com.AM.mvpAM.controllers;

import com.AM.mvpAM.dto.ApiResponse;
import com.AM.mvpAM.entities.Departamento;
import com.AM.mvpAM.repositories.DepartamentoRepository;
import com.AM.mvpAM.repositories.LocalidadRepository;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/departamentos")
public class DepartamentoController {

    private final DepartamentoRepository departamentoRepository;
    private final LocalidadRepository localidadRepository;

    public DepartamentoController(DepartamentoRepository departamentoRepository,
                                 LocalidadRepository localidadRepository) {
        this.departamentoRepository = departamentoRepository;
        this.localidadRepository = localidadRepository;
    }

    @GetMapping
    public ApiResponse<List<Departamento>> getAll() {
        return new ApiResponse<>(true, departamentoRepository.findByFechaBajaIsNull());
    }

    @GetMapping("/all")
    public ApiResponse<List<Departamento>> getAllIncludingBajas() {
        return new ApiResponse<>(true, departamentoRepository.findAll());
    }

    @GetMapping("/{id}")
    public ApiResponse<Departamento> getById(@PathVariable Long id) {
        return departamentoRepository.findByIdAndFechaBajaIsNull(id)
                .map(d -> new ApiResponse<>(true, d))
                .orElseGet(() -> new ApiResponse<>(false, null, "Not found"));
    }

    @PostMapping
    public ApiResponse<Departamento> create(@RequestBody Departamento departamento) {
        if (departamento.getNombreDepartamento() == null || departamento.getNombreDepartamento().trim().isEmpty()) {
            return ApiResponse.error("Nombre de departamento requerido");
        }
        boolean exists = departamentoRepository
                .existsByNombreDepartamentoIgnoreCaseAndFechaBajaIsNull(departamento.getNombreDepartamento());
        if (exists) {
            return ApiResponse.error("Ya existe un departamento con ese nombre");
        }
        return new ApiResponse<>(true, departamentoRepository.save(departamento));
    }

    @PutMapping("/{id}")
    public ApiResponse<Departamento> update(@PathVariable Long id, @RequestBody Departamento departamento) {
        if (departamento.getNombreDepartamento() == null || departamento.getNombreDepartamento().trim().isEmpty()) {
            return ApiResponse.error("Nombre de departamento requerido");
        }
        return departamentoRepository.findByIdAndFechaBajaIsNull(id)
                .map(d -> {
                    d.setNombreDepartamento(departamento.getNombreDepartamento());
                    return new ApiResponse<>(true, departamentoRepository.save(d));
                }).orElseGet(() -> new ApiResponse<>(false, null, "Not found"));
    }

    @DeleteMapping("/{id}")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        return departamentoRepository.findByIdAndFechaBajaIsNull(id).map(d -> {
            boolean tieneLocalidades = localidadRepository
                    .existsByDepartamentoIdAndFechaBajaIsNull(d.getId());
            if (tieneLocalidades) {
                return ApiResponse.<Void>error("No se puede dar de baja un departamento con localidades activas");
            }
            d.setFechaBaja(java.time.LocalDateTime.now());
            departamentoRepository.save(d);
            return new ApiResponse<Void>(true, null);
        }).orElseGet(() -> ApiResponse.<Void>error("Not found"));
    }
}


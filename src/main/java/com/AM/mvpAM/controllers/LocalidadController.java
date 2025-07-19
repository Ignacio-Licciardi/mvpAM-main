package com.AM.mvpAM.controllers;

import com.AM.mvpAM.dto.ApiResponse;
import com.AM.mvpAM.entities.Localidad;
import com.AM.mvpAM.repositories.DepartamentoRepository;
import com.AM.mvpAM.repositories.LocalidadRepository;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/localidades")
public class LocalidadController {

    private final LocalidadRepository localidadRepository;
    private final DepartamentoRepository departamentoRepository;

    public LocalidadController(LocalidadRepository localidadRepository, DepartamentoRepository departamentoRepository) {
        this.localidadRepository = localidadRepository;
        this.departamentoRepository = departamentoRepository;
    }

    @GetMapping
    public ApiResponse<List<Localidad>> getAll() {
        return new ApiResponse<>(true, localidadRepository.findByFechaBajaIsNull());
    }

    @GetMapping("/all")
    public ApiResponse<List<Localidad>> getAllIncludingBajas() {
        return new ApiResponse<>(true, localidadRepository.findAll());
    }

    @GetMapping("/departamento/{id}")
    public ApiResponse<List<Localidad>> getByDepartamento(@PathVariable Long id) {
        return new ApiResponse<>(true, localidadRepository.findByDepartamentoIdAndFechaBajaIsNull(id));
    }

    @GetMapping("/{id}")
    public ApiResponse<Localidad> getById(@PathVariable Long id) {
        return localidadRepository.findByIdAndFechaBajaIsNull(id)
                .map(l -> new ApiResponse<>(true, l))
                .orElseGet(() -> new ApiResponse<>(false, null, "Not found"));
    }

    @PostMapping
    public ApiResponse<Localidad> create(@RequestBody Localidad localidad) {
        if (localidad.getNombreLocalidad() == null || localidad.getNombreLocalidad().trim().isEmpty()) {
            return ApiResponse.error("Nombre de localidad requerido");
        }
        if (localidad.getDepartamento() == null || localidad.getDepartamento().getId() == null) {
            return ApiResponse.error("Departamento requerido");
        }
        return departamentoRepository.findByIdAndFechaBajaIsNull(localidad.getDepartamento().getId())
                .map(dep -> {
                    localidad.setDepartamento(dep);
                    return new ApiResponse<>(true, localidadRepository.save(localidad));
                })
                .orElseGet(() -> ApiResponse.error("Departamento no encontrado"));
    }

    @PutMapping("/{id}")
    public ApiResponse<Localidad> update(@PathVariable Long id, @RequestBody Localidad localidad) {
        if (localidad.getNombreLocalidad() == null || localidad.getNombreLocalidad().trim().isEmpty()) {
            return ApiResponse.error("Nombre de localidad requerido");
        }
        return localidadRepository.findByIdAndFechaBajaIsNull(id).map(l -> {
            l.setNombreLocalidad(localidad.getNombreLocalidad());
            if (localidad.getDepartamento() != null && localidad.getDepartamento().getId() != null) {
                return departamentoRepository.findByIdAndFechaBajaIsNull(localidad.getDepartamento().getId())
                        .map(dep -> {
                            l.setDepartamento(dep);
                            return new ApiResponse<>(true, localidadRepository.save(l));
                        })
                        .orElseGet(() -> ApiResponse.error("Departamento inválido o dado de baja"));
            }
            return new ApiResponse<>(true, localidadRepository.save(l));
        }).orElseGet(() -> new ApiResponse<>(false, null, "Not found"));
    }

    @DeleteMapping("/{id}")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        return localidadRepository.findByIdAndFechaBajaIsNull(id).map(l -> {
            l.setFechaBaja(java.time.LocalDateTime.now());
            localidadRepository.save(l);
            return new ApiResponse<Void>(true, null);
        }).orElseGet(() -> ApiResponse.<Void>error("Not found"));
    }
}


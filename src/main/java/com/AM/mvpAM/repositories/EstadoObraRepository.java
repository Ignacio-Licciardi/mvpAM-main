package com.AM.mvpAM.repositories;

import com.AM.mvpAM.entities.EstadoObra;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface EstadoObraRepository extends JpaRepository<EstadoObra, Long> {
    List<EstadoObra> findByFechaBajaIsNull();

    Optional<EstadoObra> findByIdAndFechaBajaIsNull(Long id);

    Optional<EstadoObra> findFirstByNombreEstadoObraIgnoreCaseAndFechaBajaIsNull(String nombreEstadoObra);

    boolean existsByNombreEstadoObraIgnoreCaseAndFechaBajaIsNull(String nombreEstadoObra);

    boolean existsByNombreEstadoObraIgnoreCaseAndFechaBajaIsNullAndIdNot(String nombreEstadoObra, Long id);
}

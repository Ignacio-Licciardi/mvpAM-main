package com.AM.mvpAM.repositories;

import com.AM.mvpAM.entities.ObraEstadoObra;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ObraEstadoObraRepository extends JpaRepository<ObraEstadoObra, Long> {
    long countByEstadoObraIdAndObraFechaBajaIsNull(Long estadoObraId);

    @org.springframework.data.jpa.repository.Query(
        "SELECT new com.AM.mvpAM.dto.ObrasPorEstadoDTO(e.nombreEstadoObra, COUNT(oe)) " +
        "FROM ObraEstadoObra oe " +
        "JOIN oe.estadoObra e " +
        "JOIN oe.obra o " +
        "WHERE oe.fechaHoraFin IS NULL AND o.fechaBaja IS NULL " +
        "GROUP BY e.nombreEstadoObra"
    )
    java.util.List<com.AM.mvpAM.dto.ObrasPorEstadoDTO> countObrasPorEstado();
}

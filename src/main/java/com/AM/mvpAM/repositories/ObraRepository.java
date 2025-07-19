package com.AM.mvpAM.repositories;

import com.AM.mvpAM.entities.Obra;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import java.util.Optional;

public interface ObraRepository extends JpaRepository<Obra, Long> {
    @Query("SELECT COALESCE(SUM(o.inversionFinal),0) FROM Obra o WHERE o.fechaBaja IS NULL")
    java.math.BigDecimal sumInversion();

    Page<Obra> findByFechaBajaIsNull(Pageable pageable);

    Optional<Obra> findByIdAndFechaBajaIsNull(Long id);

    // Métodos para validar número de obra único
    boolean existsByNroObraAndFechaBajaIsNull(Long nroObra);

    boolean existsByNroObraAndFechaBajaIsNullAndIdNot(Long nroObra, Long id);

    long countByPlanProyectoIdAndFechaBajaIsNull(Long planProyectoId);

    @Query(
        "SELECT new com.AM.mvpAM.dto.InversionPorRubroDTO(r.nombreRubro, COALESCE(SUM(o.inversionFinal),0)) " +
        "FROM Obra o " +
        "JOIN o.planProyecto p " +
        "JOIN p.rubro r " +
        "WHERE o.fechaBaja IS NULL " +
        "GROUP BY r.nombreRubro"
    )
    java.util.List<com.AM.mvpAM.dto.InversionPorRubroDTO> sumInversionPorRubro();
}

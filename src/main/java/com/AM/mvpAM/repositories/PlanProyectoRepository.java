package com.AM.mvpAM.repositories;

import com.AM.mvpAM.entities.PlanProyecto;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import java.util.Optional;

public interface PlanProyectoRepository extends JpaRepository<PlanProyecto, Long> {
    long countBySeEjecutaTrue();

    Page<PlanProyecto> findByFechaBajaIsNull(Pageable pageable);

    Optional<PlanProyecto> findByIdAndFechaBajaIsNull(Long id);

    long countByRubroIdAndFechaBajaIsNull(Long rubroId);
}

package com.AM.mvpAM.repositories;

import com.AM.mvpAM.entities.ObraRiesgo;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ObraRiesgoRepository extends JpaRepository<ObraRiesgo, Long> {
    long countByRiesgoTecnicoIdAndObraFechaBajaIsNull(Long riesgoId);
}

package com.AM.mvpAM.repositories;

import com.AM.mvpAM.entities.RiesgoTecnico;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.Optional;

public interface RiesgoTecnicoRepository extends JpaRepository<RiesgoTecnico, Long> {
    Page<RiesgoTecnico> findByFechaBajaIsNull(Pageable pageable);

    Optional<RiesgoTecnico> findByIdAndFechaBajaIsNull(Long id);

    List<RiesgoTecnico> findByObraRiesgosObraIdAndFechaBajaIsNull(Long obraId);

    boolean existsByNroRiesgo(Long nroRiesgo);

    boolean existsByNroRiesgoAndIdNot(Long nroRiesgo, Long id);
}

package com.AM.mvpAM.repositories;

import com.AM.mvpAM.entities.Localidad;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface LocalidadRepository extends JpaRepository<Localidad, Long> {
    List<Localidad> findByFechaBajaIsNull();

    Optional<Localidad> findByIdAndFechaBajaIsNull(Long id);

    List<Localidad> findByDepartamentoIdAndFechaBajaIsNull(Long departamentoId);

    boolean existsByDepartamentoIdAndFechaBajaIsNull(Long departamentoId);
}

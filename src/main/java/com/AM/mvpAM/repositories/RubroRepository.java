package com.AM.mvpAM.repositories;

import com.AM.mvpAM.entities.Rubro;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface RubroRepository extends JpaRepository<Rubro, Long> {
    List<Rubro> findByFechaBajaIsNull();

    Optional<Rubro> findByIdAndFechaBajaIsNull(Long id);

    boolean existsByNombreRubroIgnoreCaseAndFechaBajaIsNull(String nombreRubro);

    boolean existsByNombreRubroIgnoreCaseAndFechaBajaIsNullAndIdNot(String nombreRubro, Long id);
}

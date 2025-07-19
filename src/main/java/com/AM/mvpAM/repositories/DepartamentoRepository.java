package com.AM.mvpAM.repositories;

import com.AM.mvpAM.entities.Departamento;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface DepartamentoRepository extends JpaRepository<Departamento, Long> {
    List<Departamento> findByFechaBajaIsNull();

    Optional<Departamento> findByIdAndFechaBajaIsNull(Long id);

    boolean existsByNombreDepartamentoIgnoreCaseAndFechaBajaIsNull(String nombreDepartamento);
}

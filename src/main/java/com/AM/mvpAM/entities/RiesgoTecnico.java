package com.AM.mvpAM.entities;

import jakarta.persistence.Entity;
import jakarta.persistence.OneToMany;
import jakarta.persistence.CascadeType;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import java.util.List;

import com.AM.mvpAM.entities.ObraRiesgo;

@Entity
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
@Table(name = "riesgo_tecnico")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class RiesgoTecnico extends Base {
    private Long nroRiesgo;
    private String naturalezaRiesgo;
    private String propuestaSolucion;
    private String medidasMitigacion;
    private String accionesEjecutadas;

    @OneToMany(mappedBy = "riesgoTecnico", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnoreProperties("riesgoTecnico")
    private List<ObraRiesgo> obraRiesgos = new java.util.ArrayList<>();
}

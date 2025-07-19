package com.AM.mvpAM.entities;

import com.AM.mvpAM.enums.Prioridad;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import java.math.BigDecimal;

@Entity
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
@Table(name = "plan_proyecto")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class PlanProyecto extends Base {
    private String nombrePlanProyecto;
    private String descripcionPlanProyecto;
    private Integer mesesEstudio;
    private BigDecimal inversionEstimada;
    private Integer tiempoEstimado;
    private Boolean seEjecuta;

    @Enumerated(EnumType.STRING)
    private Prioridad prioridad;

    @ManyToOne(fetch = FetchType.LAZY)
    @JsonIgnoreProperties("planes")
    private Rubro rubro;
}

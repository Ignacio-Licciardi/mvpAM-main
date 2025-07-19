package com.AM.mvpAM.entities;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonManagedReference;


import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Entity
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
@Table(name = "obra")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Obra extends Base {
    private Long nroObra;
    private String nombreObra;
    private Integer tiempoEjecucion;
    private Integer anioEjecucion;
    private LocalDate fechaInicioObra;
    private LocalDate fechaFinObra;
    private BigDecimal inversionFinal;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "plan_proyecto_id")
    private PlanProyecto planProyecto;

    @OneToMany(mappedBy = "obra", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonManagedReference
    private List<ObraEstadoObra> obraEstadoObras = new ArrayList<>();

    @ManyToOne(fetch = FetchType.LAZY)
    @JsonIgnoreProperties("localidades")
    private Localidad localidad;

    @OneToMany(mappedBy = "obra", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonManagedReference
    private List<ObraRiesgo> obraRiesgos = new ArrayList<>();

    @OneToMany(mappedBy = "obra", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonManagedReference
    private List<ObraRubro> obraRubros = new ArrayList<>();
}

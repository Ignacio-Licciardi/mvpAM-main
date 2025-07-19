package com.AM.mvpAM.entities;

import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonBackReference;

@Entity
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
@Table(name = "obra_riesgo")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ObraRiesgo extends Base {
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "obra_id")
    @JsonIgnoreProperties("obraRiesgos")
    @JsonBackReference
    private Obra obra;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "riesgo_id")
    @JsonIgnoreProperties("obraRiesgos")
    private RiesgoTecnico riesgoTecnico;
}

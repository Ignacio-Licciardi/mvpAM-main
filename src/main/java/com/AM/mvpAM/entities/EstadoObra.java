package com.AM.mvpAM.entities;

import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@Entity
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
@Table(name = "estado_obra")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class EstadoObra extends Base {
    private String nombreEstadoObra;
}

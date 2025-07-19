package com.AM.mvpAM.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ObrasPorEstadoDTO {
    private String estado;
    private Long cantidad;
}

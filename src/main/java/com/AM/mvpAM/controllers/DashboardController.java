package com.AM.mvpAM.controllers;

import com.AM.mvpAM.dto.ApiResponse;
import com.AM.mvpAM.dto.DashboardStats;
import com.AM.mvpAM.dto.ObrasPorEstadoDTO;
import com.AM.mvpAM.dto.InversionPorRubroDTO;
import com.AM.mvpAM.repositories.ObraRepository;
import com.AM.mvpAM.repositories.PlanProyectoRepository;
import com.AM.mvpAM.repositories.RiesgoTecnicoRepository;
import com.AM.mvpAM.repositories.ObraEstadoObraRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.math.BigDecimal;

@RestController
@RequestMapping("/api/dashboard")
@CrossOrigin(origins = "http://localhost:3000")
public class DashboardController {

    @Autowired
    private ObraRepository obraRepository;

    @Autowired
    private PlanProyectoRepository planProyectoRepository;

    @Autowired
    private RiesgoTecnicoRepository riesgoTecnicoRepository;

    @Autowired
    private ObraEstadoObraRepository obraEstadoObraRepository;

    @GetMapping("/stats")
    public ResponseEntity<ApiResponse<DashboardStats>> getDashboardStats() {
        try {
            long totalObras = obraRepository.count();
            long planesActivos = planProyectoRepository.countBySeEjecutaTrue();

            // Calcular inversión total sumando todas las obras
            BigDecimal inversionTotal = obraRepository.findAll().stream()
                    .map(obra -> obra.getInversionFinal())
                    .reduce(BigDecimal.ZERO, BigDecimal::add);

            long riesgosPendientes = riesgoTecnicoRepository.count();

            DashboardStats stats = new DashboardStats(totalObras, planesActivos, inversionTotal, riesgosPendientes);
            return ResponseEntity.ok(ApiResponse.success(stats));
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body(ApiResponse.error("Error al obtener las estadísticas del dashboard"));
        }
    }

    @GetMapping("/obras-por-estado")
    public ResponseEntity<ApiResponse<java.util.List<ObrasPorEstadoDTO>>> getObrasPorEstado() {
        try {
            var data = obraEstadoObraRepository.countObrasPorEstado();
            return ResponseEntity.ok(ApiResponse.success(data));
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body(ApiResponse.error("Error al obtener datos de obras por estado"));
        }
    }

    @GetMapping("/inversion-por-rubro")
    public ResponseEntity<ApiResponse<java.util.List<InversionPorRubroDTO>>> getInversionPorRubro() {
        try {
            var data = obraRepository.sumInversionPorRubro();
            return ResponseEntity.ok(ApiResponse.success(data));
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body(ApiResponse.error("Error al obtener datos de inversión por rubro"));
        }
    }
}

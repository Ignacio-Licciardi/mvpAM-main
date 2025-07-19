package com.AM.mvpAM;

import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Profile;

import com.AM.mvpAM.entities.*;
import com.AM.mvpAM.enums.Prioridad;
import com.AM.mvpAM.repositories.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@SpringBootApplication
public class MvpAmApplication {

        public static void main(String[] args) {
                SpringApplication.run(MvpAmApplication.class, args);
        }

        // Este método se ejecuta al iniciar la aplicación y carga datos de ejemplo
        // en la base de datos H2 en memoria.
        @Bean
        @Profile("!test")
        CommandLineRunner loadData(
                        DepartamentoRepository departamentoRepo,
                        LocalidadRepository localidadRepo,
                        EstadoObraRepository estadoObraRepo,
                        RubroRepository rubroRepo,
                        ObraRepository obraRepo,
                        PlanProyectoRepository planProyectoRepo,
                        ObraEstadoObraRepository obraEstadoObraRepo,
                        ObraRubroRepository obraRubroRepo,
                        ObraRiesgoRepository obraRiesgoRepo,
                        RiesgoTecnicoRepository riesgoTecnicoRepo) {
                return args -> {
                        // Departamentos y Localidades
                        Departamento d1 = new Departamento();
                        d1.setNombreDepartamento("New York State");
                        departamentoRepo.save(d1);

                        Departamento d2 = new Departamento();
                        d2.setNombreDepartamento("Nevada");
                        departamentoRepo.save(d2);

                        Localidad l1 = new Localidad();
                        l1.setNombreLocalidad("New York City");
                        l1.setDepartamento(d1);
                        localidadRepo.save(l1);

                        Localidad l2 = new Localidad();
                        l2.setNombreLocalidad("Buffalo");
                        l2.setDepartamento(d1);
                        localidadRepo.save(l2);

                        Localidad l3 = new Localidad();
                        l3.setNombreLocalidad("Las Vegas");
                        l3.setDepartamento(d2);
                        localidadRepo.save(l3);

                        // Estados de obra
                        EstadoObra e1 = new EstadoObra();
                        e1.setNombreEstadoObra("Planificacion");
                        estadoObraRepo.save(e1);

                        EstadoObra e2 = new EstadoObra();
                        e2.setNombreEstadoObra("Ejecucion");
                        estadoObraRepo.save(e2);

                        EstadoObra e3 = new EstadoObra();
                        e3.setNombreEstadoObra("Finalizada");
                        estadoObraRepo.save(e3);

                        // Rubros
                        Rubro r1 = new Rubro();
                        r1.setNombreRubro("Infraestructura");
                        rubroRepo.save(r1);

                        Rubro r2 = new Rubro();
                        r2.setNombreRubro("Turismo");
                        rubroRepo.save(r2);

                        // Obras y Planes
                        Obra o1 = new Obra();
                        o1.setNroObra(2001L);
                        o1.setNombreObra("Statue of Liberty Renovation");
                        o1.setTiempoEjecucion(6);
                        o1.setAnioEjecucion(2024);
                        o1.setFechaInicioObra(LocalDate.now());
                        o1.setInversionFinal(new BigDecimal("300000"));
                        o1.setLocalidad(l1);
                        obraRepo.save(o1);

                        Obra o2 = new Obra();
                        o2.setNroObra(2002L);
                        o2.setNombreObra("Las Vegas Monorail Extension");
                        o2.setTiempoEjecucion(12);
                        o2.setAnioEjecucion(2025);
                        o2.setFechaInicioObra(LocalDate.now().minusMonths(2));
                        o2.setInversionFinal(new BigDecimal("400000"));
                        o2.setLocalidad(l3);
                        obraRepo.save(o2);

                        PlanProyecto p1 = new PlanProyecto();
                        p1.setNombrePlanProyecto("Statue Renovation Plan");
                        p1.setDescripcionPlanProyecto("Renovation of the Statue of Liberty");
                        p1.setMesesEstudio(4);
                        p1.setInversionEstimada(new BigDecimal("320000"));
                        p1.setTiempoEstimado(8);
                        p1.setSeEjecuta(true);
                        p1.setPrioridad(Prioridad.UNO);
                        p1.setRubro(r2);
                        planProyectoRepo.save(p1);
                        o1.setPlanProyecto(p1);
                        obraRepo.save(o1);

                        PlanProyecto p2 = new PlanProyecto();
                        p2.setNombrePlanProyecto("Monorail Expansion Plan");
                        p2.setDescripcionPlanProyecto("Extension of Las Vegas Monorail");
                        p2.setMesesEstudio(5);
                        p2.setInversionEstimada(new BigDecimal("420000"));
                        p2.setTiempoEstimado(12);
                        p2.setSeEjecuta(true);
                        p2.setPrioridad(Prioridad.DOS);
                        p2.setRubro(r1);
                        planProyectoRepo.save(p2);
                        o2.setPlanProyecto(p2);
                        obraRepo.save(o2);

                        // Obra-EstadoObra
                        ObraEstadoObra oe1 = new ObraEstadoObra();
                        oe1.setObra(o1);
                        oe1.setEstadoObra(e1);
                        oe1.setFechaHoraInicio(LocalDateTime.now());
                        obraEstadoObraRepo.save(oe1);

                        ObraEstadoObra oe2 = new ObraEstadoObra();
                        oe2.setObra(o1);
                        oe2.setEstadoObra(e2);
                        oe2.setFechaHoraInicio(LocalDateTime.now().plusMonths(1));
                        obraEstadoObraRepo.save(oe2);

                        // Obra-Rubro
                        ObraRubro or1 = new ObraRubro();
                        or1.setObra(o1);
                        or1.setRubro(r1);
                        obraRubroRepo.save(or1);

                        ObraRubro or2 = new ObraRubro();
                        or2.setObra(o2);
                        or2.setRubro(r2);
                        obraRubroRepo.save(or2);

                        // Riesgos
                        RiesgoTecnico rt1 = new RiesgoTecnico();
                        rt1.setNroRiesgo(1L);
                        rt1.setNaturalezaRiesgo("Ambiental");
                        rt1.setPropuestaSolucion("Cubiertas temporales");
                        rt1.setMedidasMitigacion("Revisiones climáticas diarias");
                        rt1.setAccionesEjecutadas("Ninguna");
                        riesgoTecnicoRepo.save(rt1);

                        ObraRiesgo or3 = new ObraRiesgo();
                        or3.setObra(o1);
                        or3.setRiesgoTecnico(rt1);
                        obraRiesgoRepo.save(or3);

                        // Crear algunos planes sin obra asignada para testing
                        PlanProyecto p3 = new PlanProyecto();
                        p3.setNombrePlanProyecto("City Park Improvement");
                        p3.setDescripcionPlanProyecto("Landscape upgrades for a public park");
                        p3.setMesesEstudio(3);
                        p3.setInversionEstimada(new BigDecimal("150000"));
                        p3.setTiempoEstimado(7);
                        p3.setSeEjecuta(false);
                        p3.setPrioridad(Prioridad.TRES);
                        p3.setRubro(r2);
                        planProyectoRepo.save(p3);

                        PlanProyecto p4 = new PlanProyecto();
                        p4.setNombrePlanProyecto("Highway Repair Plan");
                        p4.setDescripcionPlanProyecto("Maintenance of state highways");
                        p4.setMesesEstudio(2);
                        p4.setInversionEstimada(new BigDecimal("200000"));
                        p4.setTiempoEstimado(6);
                        p4.setSeEjecuta(false);
                        p4.setPrioridad(Prioridad.CUATRO);
                        p4.setRubro(r1);
                        planProyectoRepo.save(p4);

                        // Crear algunos riesgos sin obra asignada para testing
                        RiesgoTecnico rt2 = new RiesgoTecnico();
                        rt2.setNroRiesgo(2L);
                        rt2.setNaturalezaRiesgo("Estructural");
                        rt2.setPropuestaSolucion("Refuerzos adicionales");
                        rt2.setMedidasMitigacion("Inspecciones de ingeniería");
                        rt2.setAccionesEjecutadas("Ninguna");
                        riesgoTecnicoRepo.save(rt2);

                        RiesgoTecnico rt3 = new RiesgoTecnico();
                        rt3.setNroRiesgo(3L);
                        rt3.setNaturalezaRiesgo("Financiero");
                        rt3.setPropuestaSolucion("Fondo de contingencia");
                        rt3.setMedidasMitigacion("Monitoreo de presupuesto");
                        rt3.setAccionesEjecutadas("Ninguna");
                        riesgoTecnicoRepo.save(rt3);

                        System.out.println("Datos de prueba cargados exitosamente");
                };
        }
}

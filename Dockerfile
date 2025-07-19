# Usar imagen base de OpenJDK 21
FROM openjdk:21-jdk-slim

# Establecer directorio de trabajo
WORKDIR /app

# Copiar el archivo JAR generado
COPY build/libs/mvpAM-0.0.1-SNAPSHOT.jar app.jar

# Exponer el puerto
EXPOSE 8080

# Comando para ejecutar la aplicación
ENTRYPOINT ["java", "-Dspring.profiles.active=prod", "-jar", "app.jar"]

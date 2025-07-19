# Usar imagen base de OpenJDK 21
FROM openjdk:21-jdk-slim AS builder

# Instalar herramientas necesarias
RUN apt-get update && apt-get install -y curl unzip

# Establecer directorio de trabajo
WORKDIR /app

# Copiar archivos de configuración de Gradle
COPY gradlew .
COPY gradle gradle/
COPY build.gradle .
COPY settings.gradle .

# Dar permisos de ejecución al gradlew
RUN chmod +x ./gradlew

# Copiar código fuente
COPY src src/

# Construir la aplicación
RUN ./gradlew clean build -x test

# Etapa 2: Ejecución
FROM openjdk:21-jdk-slim

# Establecer directorio de trabajo
WORKDIR /app

# Copiar el JAR desde la etapa de construcción
COPY --from=builder /app/build/libs/mvpAM-0.0.1-SNAPSHOT.jar app.jar

# Exponer el puerto
EXPOSE 8080

# Comando para ejecutar la aplicación
ENTRYPOINT ["java", "-Dspring.profiles.active=prod", "-Dserver.port=${PORT:-8080}", "-jar", "app.jar"]

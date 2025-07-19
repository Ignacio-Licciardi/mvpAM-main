#!/bin/bash

# Build script para Render con Docker
echo "Building Spring Boot application..."

# Asegurar permisos de ejecución para Gradle
chmod +x ./gradlew

# Construir la aplicación
./gradlew clean build -x test

echo "Build completed successfully!"
echo "JAR file created at: build/libs/mvpAM-0.0.1-SNAPSHOT.jar"

#!/bin/bash

# Build script para Render
echo "Building Spring Boot application..."

# Asegurar permisos de ejecución para Gradle
chmod +x ./gradlew

# Construir la aplicación
./gradlew clean build -x test

echo "Build completed successfully!"

FROM openjdk:17-jdk-slim

WORKDIR /app

COPY . .

RUN chmod +x mvnw
RUN ./mvnw clean package -DskipTests

# Using sh -c to ensure the wildcard *.jar is expanded correctly
CMD ["sh", "-c", "java -jar target/*.jar"]

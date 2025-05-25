FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS base
USER $APP_UID
WORKDIR /app
EXPOSE 8080
EXPOSE 8081

FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
ARG BUILD_CONFIGURATION=Release
WORKDIR /src
COPY ["gRPC.telemetry.Server/gRPC.telemetry.Server.csproj", "gRPC.telemetry.Server/"]
RUN dotnet restore "gRPC.telemetry.Server/gRPC.telemetry.Server.csproj"
COPY . .
WORKDIR "/src/gRPC.telemetry.Server"
RUN dotnet build "./gRPC.telemetry.Server.csproj" -c $BUILD_CONFIGURATION -o /app/build

FROM build AS publish
ARG BUILD_CONFIGURATION=Release
RUN dotnet publish "./gRPC.telemetry.Server.csproj" -c $BUILD_CONFIGURATION -o /app/publish /p:UseAppHost=false

FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "gRPC.telemetry.Server.dll"]

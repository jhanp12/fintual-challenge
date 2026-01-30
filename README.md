# Desafío Fintual - Análisis de Fondos de Inversión

Aplicación web desarrollada en Angular para analizar y visualizar la variación mensual de los fondos de inversión de Fintual.

## Características

### Funcionalidades Principales
- Consumo de API pública de Fintual
- Cálculo de variación mensual de fondos
- Visualización interactiva con gráficos (Línea, Barras, Radar)
- Filtros por tipo de fondo y rango de fechas
- Modo comparación para analizar hasta 4 fondos simultáneamente
- Estadísticas detalladas (promedio, mejor/peor mes, volatilidad)
- Tabla interactiva con búsqueda y ordenamiento
- Diseño responsive y moderno

### Funcionalidades Extra
- Selector de tipo de gráfico (Línea, Barras, Radar)
- Modo comparación múltiple de fondos
- Panel de estadísticas con métricas clave
- Búsqueda en tiempo real en tabla de datos
- Ordenamiento por mes o variación
- Diseño totalmente responsive

## Tecnologías Utilizadas

- **Frontend**: Angular 17
- **Lenguaje**: TypeScript
- **Gráficos**: Chart.js
- **Estilos**: CSS3 con diseño moderno y gradientes
- **API**: API pública de Fintual

## Prerrequisitos

Antes de comenzar, asegúrate de tener instalado:

- [Node.js](https://nodejs.org/) (versión 18 o superior)
- [npm](https://www.npmjs.com/) (viene con Node.js)
- [Angular CLI](https://angular.io/cli) (se instalará globalmente)

## Instalación

### 1. Clonar el repositorio
```bash
git clone https://github.com/TU_USUARIO/fintual-challenge.git
cd fintual-challenge
```

### 2. Instalar dependencias
```bash
npm install
```

### 3. Instalar Angular CLI (si no lo tienes)
```bash
npm install -g @angular/cli
```

## Ejecución

### Modo desarrollo
```bash
ng serve
```

La aplicación estará disponible en `http://localhost:4200`

### Compilar para producción
```bash
ng build --configuration production
```

Los archivos compilados estarán en el directorio `dist/`

## Uso de la Aplicación

### Modo Individual

1. **Seleccionar tipo de fondo** (opcional): Filtra fondos por categoría
2. **Seleccionar un fondo**: Elige el fondo que deseas analizar
3. **Configurar fechas** (opcional): Define un rango de fechas específico
4. **Ver resultados**: 
   - Gráfico interactivo de variación mensual
   - Panel de estadísticas con métricas clave
   - Tabla detallada con todos los datos

### Modo Comparación

1. **Activar modo comparación**: Click en el botón "Activar Modo Comparación"
2. **Seleccionar fondos**: Haz click en hasta 4 fondos para comparar
3. **Configurar fechas** (opcional): Define el período de análisis
4. **Analizar**: Visualiza todos los fondos en un mismo gráfico

### Cambiar Tipo de Gráfico

- **Línea** : Ideal para ver tendencias
- **Barras** : Mejor para comparar valores específicos
- **Radar** : Vista alternativa de datos

## 💾 Estructura del Proyecto
```
fintual-challenge/
├── src/
│   ├── app/
│   │   ├── components/
│   │   │   └── funds-chart/          # Componente principal
│   │   ├── services/
│   │   │   └── fintual.service.ts    # Servicio API
│   │   ├── models/
│   │   │   ├── fund.ts               # Interface Fund
│   │   │   └── real-asset.ts         # Interfaces de datos
│   │   └── app.component.ts
│   └── styles.css                     # Estilos globales
├── queries.sql                        # Consultas SQL del desafío
├── package.json
└── README.md
```

## Consultas SQL

El proyecto incluye consultas SQL para análisis de datos de inversiones:

### 1. Total de aportes y retiros para diciembre 2021
```sql
SELECT movement_type, SUM(amount) as total_amount
FROM user_movements
WHERE DATE_TRUNC('month', date) = '2021-12-01'
GROUP BY movement_type;
```

### 2. Cantidad y monto promedio por fecha
```sql
SELECT date, movement_type, COUNT(*), AVG(amount)
FROM user_movements
GROUP BY date, movement_type;
```

### 3. Usuario con más aportes
```sql
SELECT ud.name, ud.last_name, COUNT(*) as total_aportes
FROM user_data ud
JOIN user_movements um ON ud.user_id = um.user_id
WHERE um.movement_type = 'subscription'
GROUP BY ud.user_id, ud.name, ud.last_name
ORDER BY total_aportes DESC
LIMIT 1;
```

## Decisiones Técnicas

### Arquitectura
- **Componentes standalone**: Uso de la nueva sintaxis de Angular 17
- **Servicios inyectables**: Separación de lógica de negocio
- **Interfaces TypeScript**: Tipado fuerte para mayor seguridad

### API
- **Fondos hardcodeados**: La API de Fintual no tiene endpoint de listado, por lo que se definen los 4 fondos según documentación oficial
- **Manejo de fechas**: Filtrado flexible con parámetros opcionales
- **Estructura de respuesta**: Manejo de diferentes formatos (`data` o array directo)

### Cálculo de Variaciones
```typescript
variación = ((precio_final - precio_inicial) / precio_inicial) * 100
```
- Se toma el primer y último precio de cada mes
- Los datos se agrupan por año-mes (`YYYY-MM`)
- Ordenamiento cronológico automático

### Estadísticas
- **Promedio**: Media aritmética de todas las variaciones
- **Volatilidad**: Desviación estándar de las variaciones
- **Mejor/Peor mes**: Máximo y mínimo del período

### Visualización
- **Chart.js**: Librería robusta y flexible para gráficos
- **Múltiples tipos**: Soporte para línea, barras y radar
- **Comparación**: Hasta 4 fondos con colores diferenciados

### UX/UI
- **Design System**: Gradientes morados consistentes
- **Feedback visual**: Loading spinners y mensajes de error
- **Responsive**: Grid CSS y media queries
- **Accesibilidad**: Labels claros y contraste adecuado

## Manejo de Errores

La aplicación maneja:
- Errores de conexión a la API
- Datos vacíos o inválidos
- Fechas sin información
- Límite de fondos en comparación (máximo 4)

## 📱 Compatibilidad

- Chrome, Firefox, Safari, Edge (últimas versiones)
- Responsive: Desktop, Tablet, Mobile
- Resoluciones desde 320px hasta 4K

## Autor

**[JHAN PIERRE BECERRA HUAYTALLA]**
- GitHub: [@tu-usuario](https://github.com/tu-usuario)
- LinkedIn: [Tu Perfil](https://linkedin.com/in/tu-perfil)

---

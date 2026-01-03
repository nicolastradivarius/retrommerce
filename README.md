# E-commerce Project

Proyecto de e-commerce full-stack construido con Next.js, PostgreSQL y Prisma.

## Stack Tecnológico

- **Frontend/Backend**: Next.js 16 (App Router)
- **Base de Datos**: PostgreSQL
- **ORM**: Prisma
- **Estilos**: Tailwind CSS
- **Lenguaje**: TypeScript

## Configuración Inicial

### 1. Instalar dependencias
```bash
yarn install
```

### 2. Configurar base de datos
Edita el archivo `.env` con tus credenciales de PostgreSQL:
```
DATABASE_URL="postgresql://ecommerce_user:tu_password_seguro@localhost:5432/ecommerce"
```

### 3. Crear la base de datos
```bash
# Accede a PostgreSQL
sudo -u postgres psql

# Crea el usuario y base de datos
CREATE USER ecommerce_user WITH PASSWORD 'tu_password_seguro';
CREATE DATABASE ecommerce;
GRANT ALL PRIVILEGES ON DATABASE ecommerce TO ecommerce_user;
\q
```

### 4. Ejecutar migraciones
```bash
yarn prisma:migrate
```

### 5. Generar el cliente de Prisma
```bash
yarn prisma:generate
```

### 6. Iniciar servidor de desarrollo
```bash
yarn dev
```

La aplicación estará disponible en `http://localhost:3000`

## Scripts Disponibles

- `yarn dev` - Inicia el servidor de desarrollo
- `yarn build` - Construye la aplicación para producción
- `yarn start` - Inicia el servidor de producción
- `yarn lint` - Ejecuta el linter
- `yarn prisma:generate` - Genera el cliente de Prisma
- `yarn prisma:migrate` - Ejecuta migraciones de base de datos
- `yarn prisma:studio` - Abre Prisma Studio (interfaz visual para la DB)
- `yarn prisma:seed` - Ejecuta el seed de datos iniciales

## Estructura del Proyecto

```
ecommerce/
├── app/                  # App Router de Next.js
│   ├── generated/       # Cliente de Prisma generado
│   ├── api/            # API Routes
│   └── ...             # Páginas y layouts
├── lib/                # Utilidades y configuración
│   └── prisma.ts       # Cliente de Prisma singleton
├── prisma/             # Schema y migraciones de Prisma
│   └── schema.prisma   # Definición del modelo de datos
├── public/             # Archivos estáticos
└── .env               # Variables de entorno
```

## Próximos Pasos

- [ ] Definir modelos de base de datos (User, Product, Order)
- [ ] Configurar autenticación
- [ ] Crear API endpoints
- [ ] Diseñar UI del catálogo
- [ ] Implementar carrito de compras
- [ ] Integrar pagos con Stripe
- [ ] Configurar Cloudinary para imágenes

---

## Recursos de Next.js

- [Next.js Documentation](https://nextjs.org/docs)
- [Learn Next.js](https://nextjs.org/learn)
- [Next.js GitHub repository](https://github.com/vercel/next.js)

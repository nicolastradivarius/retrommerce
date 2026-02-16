import { PrismaClient } from "@/app/generated/prisma";
import { PrismaPg } from "@prisma/adapter-pg";
import "dotenv/config";
import bcrypt from "bcryptjs";

const connectionString = `${process.env.DATABASE_URL}`;

const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🌱 Seeding database...");

  // Crear usuarios
  const hashedPasswordUser = await bcrypt.hash("user123", 10);
  const hashedPasswordAdmin = await bcrypt.hash("admin123", 10);

  const users = await Promise.all([
    // [0] Usuario Demo
    prisma.user.upsert({
      where: { email: "user@retrommerce.com" },
      update: {},
      create: {
        email: "user@retrommerce.com",
        name: "Usuario Demo",
        phone: "+1 555-0100",
        password: hashedPasswordUser,
        role: "USER",
      },
    }),
    // [1] Administrador
    prisma.user.upsert({
      where: { email: "admin@retrommerce.com" },
      update: {},
      create: {
        email: "admin@retrommerce.com",
        name: "Administrador",
        phone: "+1 555-0101",
        password: hashedPasswordAdmin,
        role: "ADMIN",
      },
    }),
    // [2] Carlos Mendez
    prisma.user.upsert({
      where: { email: "carlos@retrommerce.com" },
      update: {},
      create: {
        email: "carlos@retrommerce.com",
        name: "Carlos Mendez",
        phone: "+1 555-0102",
        password: hashedPasswordUser,
        role: "USER",
      },
    }),
    // [3] Laura Gonzalez
    prisma.user.upsert({
      where: { email: "laura@retrommerce.com" },
      update: {},
      create: {
        email: "laura@retrommerce.com",
        name: "Laura Gonzalez",
        phone: "+1 555-0103",
        password: hashedPasswordUser,
        role: "USER",
      },
    }),
    // [4] Martin Rodriguez
    prisma.user.upsert({
      where: { email: "martin@retrommerce.com" },
      update: {},
      create: {
        email: "martin@retrommerce.com",
        name: "Martin Rodriguez",
        phone: "+1 555-0104",
        password: hashedPasswordUser,
        role: "USER",
      },
    }),
    // [5] Ana Torres
    prisma.user.upsert({
      where: { email: "ana@retrommerce.com" },
      update: {},
      create: {
        email: "ana@retrommerce.com",
        name: "Ana Torres",
        phone: "+1 555-0105",
        password: hashedPasswordUser,
        role: "USER",
      },
    }),
    // [6] Pedro Sanchez
    prisma.user.upsert({
      where: { email: "pedro@retrommerce.com" },
      update: {},
      create: {
        email: "pedro@retrommerce.com",
        name: "Pedro Sanchez",
        phone: "+1 555-0106",
        password: hashedPasswordUser,
        role: "USER",
      },
    }),
    // [7] Valentina Lopez
    prisma.user.upsert({
      where: { email: "valentina@retrommerce.com" },
      update: {},
      create: {
        email: "valentina@retrommerce.com",
        name: "Valentina Lopez",
        phone: "+1 555-0107",
        password: hashedPasswordUser,
        role: "USER",
      },
    }),
    // [8] Diego Fernandez
    prisma.user.upsert({
      where: { email: "diego@retrommerce.com" },
      update: {},
      create: {
        email: "diego@retrommerce.com",
        name: "Diego Fernandez",
        phone: "+1 555-0108",
        password: hashedPasswordUser,
        role: "USER",
      },
    }),
    // [9] Camila Ruiz
    prisma.user.upsert({
      where: { email: "camila@retrommerce.com" },
      update: {},
      create: {
        email: "camila@retrommerce.com",
        name: "Camila Ruiz",
        phone: "+1 555-0109",
        password: hashedPasswordUser,
        role: "USER",
      },
    }),
    // [10] Santiago Morales
    prisma.user.upsert({
      where: { email: "santiago@retrommerce.com" },
      update: {},
      create: {
        email: "santiago@retrommerce.com",
        name: "Santiago Morales",
        phone: "+1 555-0110",
        password: hashedPasswordUser,
        role: "USER",
      },
    }),
    // [11] Isabella Vargas
    prisma.user.upsert({
      where: { email: "isabella@retrommerce.com" },
      update: {},
      create: {
        email: "isabella@retrommerce.com",
        name: "Isabella Vargas",
        phone: "+1 555-0111",
        password: hashedPasswordUser,
        role: "USER",
      },
    }),
  ]);

  console.log(`✅ Created ${users.length} users`);

  // Crear categorías
  const categories = await Promise.all([
    prisma.category.upsert({
      where: { slug: "computadoras" },
      update: {},
      create: {
        name: "Computadoras",
        slug: "computadoras",
        description: "Computadoras completas de los 90s y 2000s",
      },
    }),
    prisma.category.upsert({
      where: { slug: "procesadores" },
      update: {},
      create: {
        name: "Procesadores",
        slug: "procesadores",
        description: "CPUs clásicos de Intel, AMD y Cyrix",
      },
    }),
    prisma.category.upsert({
      where: { slug: "memorias-ram" },
      update: {},
      create: {
        name: "Memorias RAM",
        slug: "memorias-ram",
        description: "Módulos SIMM, DIMM y SDRAM vintage",
      },
    }),
    prisma.category.upsert({
      where: { slug: "monitores-crt" },
      update: {},
      create: {
        name: "Monitores CRT",
        slug: "monitores-crt",
        description: "Monitores de tubo catódico clásicos",
      },
    }),
    prisma.category.upsert({
      where: { slug: "tarjetas-graficas" },
      update: {},
      create: {
        name: "Tarjetas Gráficas",
        slug: "tarjetas-graficas",
        description: "GPUs retro de 3dfx, Nvidia, ATI",
      },
    }),
    prisma.category.upsert({
      where: { slug: "discos-duros" },
      update: {},
      create: {
        name: "Discos Duros",
        slug: "discos-duros",
        description: "HDDs IDE y SCSI vintage",
      },
    }),
    prisma.category.upsert({
      where: { slug: "perifericos" },
      update: {},
      create: {
        name: "Periféricos",
        slug: "perifericos",
        description: "Teclados, ratones y otros periféricos retro",
      },
    }),
    prisma.category.upsert({
      where: { slug: "tarjetas-sonido" },
      update: {},
      create: {
        name: "Tarjetas de Sonido",
        slug: "tarjetas-sonido",
        description: "Sound Blaster y otras tarjetas de audio clásicas",
      },
    }),
  ]);

  console.log(`✅ Created ${categories.length} categories`);

  // Crear productos de ejemplo
  const products = await Promise.all([
    // === COMPUTADORAS ===
    // Producto 0 -> users[0]
    prisma.product.upsert({
      where: { slug: "ibm-thinkpad-600e" },
      update: {
        featuredOnHomepage: true,
        userId: users[0].id,
      },
      create: {
        name: "IBM ThinkPad 600E",
        slug: "ibm-thinkpad-600e",
        description:
          "Laptop clásica de IBM con procesador Pentium II y Windows 98. Incluye trackpoint rojo característico.",
        price: 299.99,
        originalPrice: 399.99,
        year: 1998,
        manufacturer: "IBM",
        stock: 3,
        featured: true,
        featuredOnHomepage: true,
        images: ["/images/thinkpad-600e.jpg"],
        categoryId: categories[0].id,
        userId: users[0].id,
      },
    }),
    // Producto 1 -> users[2]
    prisma.product.upsert({
      where: { slug: "compaq-presario-5000" },
      update: { userId: users[2].id },
      create: {
        name: "Compaq Presario 5000",
        slug: "compaq-presario-5000",
        description:
          "Torre de escritorio clásica con Pentium III y Windows 2000 Professional.",
        price: 179.99,
        originalPrice: 249.99,
        year: 2000,
        manufacturer: "Compaq",
        stock: 4,
        featured: true,
        images: ["/images/presario-5000.jpg"],
        categoryId: categories[0].id,
        userId: users[2].id,
      },
    }),
    // Producto 2 -> users[3]
    prisma.product.upsert({
      where: { slug: "dell-dimension-4600" },
      update: { userId: users[3].id },
      create: {
        name: "Dell Dimension 4600",
        slug: "dell-dimension-4600",
        description:
          "Computadora de escritorio Dell con Pentium 4 HT y Windows XP.",
        price: 199.99,
        originalPrice: 279.99,
        year: 2003,
        manufacturer: "Dell",
        stock: 5,
        images: ["/images/dell-4600.jpg"],
        categoryId: categories[0].id,
        userId: users[3].id,
      },
    }),
    // Producto 3 -> users[4]
    prisma.product.upsert({
      where: { slug: "hp-pavilion-a1000" },
      update: { userId: users[4].id },
      create: {
        name: "HP Pavilion a1000",
        slug: "hp-pavilion-a1000",
        description:
          "Torre multimedia con AMD Athlon 64 y Windows XP Media Center.",
        price: 249.99,
        originalPrice: 329.99,
        year: 2005,
        manufacturer: "HP",
        stock: 3,
        images: ["/images/hp-a1000.jpg"],
        categoryId: categories[0].id,
        userId: users[4].id,
      },
    }),
    // Producto 4 -> users[5]
    prisma.product.upsert({
      where: { slug: "gateway-2000-p5-133" },
      update: { userId: users[5].id },
      create: {
        name: "Gateway 2000 P5-133",
        slug: "gateway-2000-p5-133",
        description:
          "PC de escritorio clásica con caja vaca manchada característica de Gateway.",
        price: 149.99,
        originalPrice: 199.99,
        year: 1996,
        manufacturer: "Gateway",
        stock: 2,
        images: ["/images/gateway-p5.jpg"],
        categoryId: categories[0].id,
        userId: users[5].id,
      },
    }),
    // Producto 5 -> users[6]
    prisma.product.upsert({
      where: { slug: "apple-imac-g3-bondi" },
      update: { userId: users[6].id },
      create: {
        name: "Apple iMac G3 Bondi Blue",
        slug: "apple-imac-g3-bondi",
        description:
          "El revolucionario iMac G3 en color Bondi Blue que cambió el diseño de computadoras.",
        price: 349.99,
        originalPrice: 449.99,
        year: 1998,
        manufacturer: "Apple",
        stock: 2,
        featured: true,
        images: ["/images/imac-g3.jpg"],
        categoryId: categories[0].id,
        userId: users[6].id,
      },
    }),
    // Producto 6 -> users[7]
    prisma.product.upsert({
      where: { slug: "packard-bell-legend" },
      update: { userId: users[7].id },
      create: {
        name: "Packard Bell Legend 406CD",
        slug: "packard-bell-legend",
        description:
          "PC multimedia familiar con parlantes integrados y software educativo.",
        price: 129.99,
        originalPrice: 169.99,
        year: 1995,
        manufacturer: "Packard Bell",
        stock: 3,
        images: ["/images/packard-bell.jpg"],
        categoryId: categories[0].id,
        userId: users[7].id,
      },
    }),
    // Producto 7 -> users[8]
    prisma.product.upsert({
      where: { slug: "emachines-etower-500is" },
      update: { userId: users[8].id },
      create: {
        name: "eMachines eTower 500is",
        slug: "emachines-etower-500is",
        description: "PC económica pero potente de la era del Internet.",
        price: 99.99,
        originalPrice: 139.99,
        year: 1999,
        manufacturer: "eMachines",
        stock: 6,
        images: ["/images/emachines.jpg"],
        categoryId: categories[0].id,
        userId: users[8].id,
      },
    }),

    // === PROCESADORES ===
    // Producto 8 -> users[9]
    prisma.product.upsert({
      where: { slug: "intel-pentium-3-800mhz" },
      update: { userId: users[9].id },
      create: {
        name: "Intel Pentium III 800MHz",
        slug: "intel-pentium-3-800mhz",
        description:
          "Procesador Intel Pentium III Socket 370, perfecto para builds retro.",
        price: 49.99,
        originalPrice: 49.99,
        year: 2000,
        manufacturer: "Intel",
        stock: 8,
        featured: true,
        images: ["/images/pentium3-800.jpg"],
        categoryId: categories[1].id,
        userId: users[9].id,
      },
    }),
    // Producto 9 -> users[10]
    prisma.product.upsert({
      where: { slug: "amd-athlon-xp-2400" },
      update: { userId: users[10].id },
      create: {
        name: "AMD Athlon XP 2400+",
        slug: "amd-athlon-xp-2400",
        description:
          "Procesador AMD Athlon XP con tecnologia QuantiSpeed Architecture.",
        price: 54.99,
        originalPrice: 69.99,
        year: 2002,
        manufacturer: "AMD",
        stock: 6,
        images: ["/images/athlon-xp-2400.jpg"],
        categoryId: categories[1].id,
        userId: users[10].id,
      },
    }),
    // Producto 10 -> users[11]
    prisma.product.upsert({
      where: { slug: "intel-pentium-4-3ghz" },
      update: { userId: users[11].id },
      create: {
        name: "Intel Pentium 4 3.0GHz",
        slug: "intel-pentium-4-3ghz",
        description: "Procesador Pentium 4 con Hyper-Threading y Socket 478.",
        price: 59.99,
        originalPrice: 79.99,
        year: 2003,
        manufacturer: "Intel",
        stock: 9,
        images: ["/images/pentium4-3ghz.jpg"],
        categoryId: categories[1].id,
        userId: users[11].id,
      },
    }),
    // Producto 11 -> users[0]
    prisma.product.upsert({
      where: { slug: "amd-k6-2-450" },
      update: { userId: users[0].id },
      create: {
        name: "AMD K6-2 450MHz",
        slug: "amd-k6-2-450",
        description:
          "Procesador AMD K6-2 con tecnología 3DNow! para gaming retro.",
        price: 29.99,
        originalPrice: 39.99,
        year: 1998,
        manufacturer: "AMD",
        stock: 12,
        images: ["/images/k6-2.jpg"],
        categoryId: categories[1].id,
        userId: users[0].id,
      },
    }),
    // Producto 12 -> users[2]
    prisma.product.upsert({
      where: { slug: "intel-pentium-mmx-233" },
      update: { userId: users[2].id },
      create: {
        name: "Intel Pentium MMX 233MHz",
        slug: "intel-pentium-mmx-233",
        description: "El legendario Pentium MMX, perfecto para DOS gaming.",
        price: 34.99,
        originalPrice: 44.99,
        year: 1997,
        manufacturer: "Intel",
        stock: 7,
        images: ["/images/pentium-mmx.jpg"],
        categoryId: categories[1].id,
        userId: users[2].id,
      },
    }),
    // Producto 13 -> users[3]
    prisma.product.upsert({
      where: { slug: "cyrix-6x86mx-pr233" },
      update: { userId: users[3].id },
      create: {
        name: "Cyrix 6x86MX PR233",
        slug: "cyrix-6x86mx-pr233",
        description: "Procesador Cyrix alternativo económico para Socket 7.",
        price: 19.99,
        originalPrice: 29.99,
        year: 1997,
        manufacturer: "Cyrix",
        stock: 5,
        images: ["/images/cyrix-6x86.jpg"],
        categoryId: categories[1].id,
        userId: users[3].id,
      },
    }),
    // Producto 14 -> users[4]
    prisma.product.upsert({
      where: { slug: "amd-duron-900" },
      update: { userId: users[4].id },
      create: {
        name: "AMD Duron 900MHz",
        slug: "amd-duron-900",
        description: "Procesador económico AMD Duron para sistemas de entrada.",
        price: 24.99,
        originalPrice: 34.99,
        year: 2001,
        manufacturer: "AMD",
        stock: 10,
        images: ["/images/duron-900.jpg"],
        categoryId: categories[1].id,
        userId: users[4].id,
      },
    }),
    // Producto 15 -> users[5]
    prisma.product.upsert({
      where: { slug: "intel-celeron-300a" },
      update: { userId: users[5].id },
      create: {
        name: "Intel Celeron 300A",
        slug: "intel-celeron-300a",
        description:
          "El famoso Celeron 300A, legendario por su overclock a 450MHz.",
        price: 39.99,
        originalPrice: 49.99,
        year: 1998,
        manufacturer: "Intel",
        stock: 4,
        featured: true,
        images: ["/images/celeron-300a.jpg"],
        categoryId: categories[1].id,
        userId: users[5].id,
      },
    }),

    // === MEMORIAS RAM ===
    // Producto 16 -> users[6]
    prisma.product.upsert({
      where: { slug: "kingston-128mb-pc133" },
      update: { userId: users[6].id },
      create: {
        name: "Kingston 128MB PC133 SDRAM",
        slug: "kingston-128mb-pc133",
        description:
          "Módulo de memoria SDRAM de 128MB para sistemas Socket 370/Slot 1",
        price: 24.99,
        originalPrice: 24.99,
        year: 2000,
        manufacturer: "Kingston",
        stock: 15,
        images: ["/images/kingston-128mb.jpg"],
        categoryId: categories[2].id,
        userId: users[6].id,
      },
    }),
    // Producto 17 -> users[7]
    prisma.product.upsert({
      where: { slug: "corsair-256mb-pc2700" },
      update: { userId: users[7].id },
      create: {
        name: "Corsair 256MB PC2700 DDR",
        slug: "corsair-256mb-pc2700",
        description:
          "Memoria DDR de 256MB para sistemas AMD Athlon XP y Pentium 4.",
        price: 29.99,
        originalPrice: 29.99,
        year: 2002,
        manufacturer: "Corsair",
        stock: 12,
        images: ["/images/corsair-256mb.jpg"],
        categoryId: categories[2].id,
        userId: users[7].id,
      },
    }),
    // Producto 18 -> users[8]
    prisma.product.upsert({
      where: { slug: "crucial-512mb-pc3200" },
      update: { userId: users[8].id },
      create: {
        name: "Crucial 512MB PC3200 DDR",
        slug: "crucial-512mb-pc3200",
        description:
          "Memoria DDR de 512MB con alta velocidad para gaming retro.",
        price: 34.99,
        originalPrice: 34.99,
        year: 2004,
        manufacturer: "Crucial",
        stock: 14,
        images: ["/images/crucial-512mb.jpg"],
        categoryId: categories[2].id,
        userId: users[8].id,
      },
    }),
    // Producto 19 -> users[9]
    prisma.product.upsert({
      where: { slug: "simm-32mb-edo" },
      update: { userId: users[9].id },
      create: {
        name: "SIMM 32MB EDO RAM",
        slug: "simm-32mb-edo",
        description:
          "Módulo SIMM de 32MB EDO para sistemas 486 y Pentium tempranos.",
        price: 19.99,
        originalPrice: 24.99,
        year: 1995,
        manufacturer: "Generic",
        stock: 8,
        images: ["/images/simm-32mb.jpg"],
        categoryId: categories[2].id,
        userId: users[9].id,
      },
    }),
    // Producto 20 -> users[10]
    prisma.product.upsert({
      where: { slug: "kingston-64mb-pc100" },
      update: { userId: users[10].id },
      create: {
        name: "Kingston 64MB PC100 SDRAM",
        slug: "kingston-64mb-pc100",
        description: "Módulo SDRAM de 64MB para sistemas Pentium II y III.",
        price: 14.99,
        originalPrice: 19.99,
        year: 1998,
        manufacturer: "Kingston",
        stock: 20,
        images: ["/images/kingston-64mb.jpg"],
        categoryId: categories[2].id,
        userId: users[10].id,
      },
    }),
    // Producto 21 -> users[11]
    prisma.product.upsert({
      where: { slug: "samsung-1gb-ddr2" },
      update: { userId: users[11].id },
      create: {
        name: "Samsung 1GB DDR2-667",
        slug: "samsung-1gb-ddr2",
        description: "Memoria DDR2 de 1GB para sistemas modernos retro.",
        price: 24.99,
        originalPrice: 29.99,
        year: 2006,
        manufacturer: "Samsung",
        stock: 16,
        images: ["/images/samsung-1gb.jpg"],
        categoryId: categories[2].id,
        userId: users[11].id,
      },
    }),

    // === MONITORES CRT ===
    // Producto 22 -> users[0]
    prisma.product.upsert({
      where: { slug: "sony-trinitron-cpd-g220" },
      update: { userId: users[0].id },
      create: {
        name: "Sony Trinitron CPD-G220",
        slug: "sony-trinitron-cpd-g220",
        description:
          'Monitor CRT profesional de 19" con resolución máxima de 1600x1200. Perfecto para gaming retro.',
        price: 149.99,
        originalPrice: 199.99,
        year: 2001,
        manufacturer: "Sony",
        stock: 2,
        featured: true,
        images: ["/images/trinitron-g220.jpg"],
        categoryId: categories[3].id,
        userId: users[0].id,
      },
    }),
    // Producto 23 -> users[2]
    prisma.product.upsert({
      where: { slug: "viewsonic-p95f" },
      update: { userId: users[2].id },
      create: {
        name: "ViewSonic P95f+",
        slug: "viewsonic-p95f",
        description:
          "Monitor CRT de 19 pulgadas con excelente calidad de imagen y tasa de refresco.",
        price: 129.99,
        originalPrice: 159.99,
        year: 2002,
        manufacturer: "ViewSonic",
        stock: 3,
        images: ["/images/viewsonic-p95f.jpg"],
        categoryId: categories[3].id,
        userId: users[2].id,
      },
    }),
    // Producto 24 -> users[3]
    prisma.product.upsert({
      where: { slug: "samsung-syncmaster-997df" },
      update: { userId: users[3].id },
      create: {
        name: "Samsung SyncMaster 997DF",
        slug: "samsung-syncmaster-997df",
        description:
          "Monitor CRT de 19 pulgadas con pantalla plana para reducir reflejos.",
        price: 139.99,
        originalPrice: 179.99,
        year: 2003,
        manufacturer: "Samsung",
        stock: 2,
        images: ["/images/samsung-997df.jpg"],
        categoryId: categories[3].id,
        userId: users[3].id,
      },
    }),
    // Producto 25 -> users[4]
    prisma.product.upsert({
      where: { slug: "dell-p1110" },
      update: { userId: users[4].id },
      create: {
        name: "Dell P1110 Trinitron",
        slug: "dell-p1110",
        description:
          'Monitor CRT de 21" con tubo Sony Trinitron, ideal para diseño gráfico.',
        price: 199.99,
        originalPrice: 279.99,
        year: 2000,
        manufacturer: "Dell",
        stock: 1,
        featured: true,
        images: ["/images/dell-p1110.jpg"],
        categoryId: categories[3].id,
        userId: users[4].id,
      },
    }),
    // Producto 26 -> users[5]
    prisma.product.upsert({
      where: { slug: "nec-multisync-fe991sb" },
      update: { userId: users[5].id },
      create: {
        name: "NEC MultiSync FE991SB",
        slug: "nec-multisync-fe991sb",
        description:
          'Monitor CRT de 19" con pantalla plana y excelente reproducción de color.',
        price: 159.99,
        originalPrice: 199.99,
        year: 2002,
        manufacturer: "NEC",
        stock: 2,
        images: ["/images/nec-fe991sb.jpg"],
        categoryId: categories[3].id,
        userId: users[5].id,
      },
    }),
    // Producto 27 -> users[6]
    prisma.product.upsert({
      where: { slug: "compaq-v700" },
      update: { userId: users[6].id },
      create: {
        name: "Compaq V700",
        slug: "compaq-v700",
        description: 'Monitor CRT compacto de 17" perfecto para uso general.',
        price: 79.99,
        originalPrice: 99.99,
        year: 1999,
        manufacturer: "Compaq",
        stock: 5,
        images: ["/images/compaq-v700.jpg"],
        categoryId: categories[3].id,
        userId: users[6].id,
      },
    }),

    // === TARJETAS GRÁFICAS ===
    // Producto 28 -> users[7]
    prisma.product.upsert({
      where: { slug: "3dfx-voodoo3-3000-agp" },
      update: { userId: users[7].id },
      create: {
        name: "3dfx Voodoo3 3000 AGP",
        slug: "3dfx-voodoo3-3000-agp",
        description: "Tarjeta gráfica legendaria de 3dfx. ¡La reina del Glide!",
        price: 89.99,
        originalPrice: 89.99,
        year: 1999,
        manufacturer: "3dfx",
        stock: 5,
        featured: true,
        images: ["/images/voodoo3-3000.jpg"],
        categoryId: categories[4].id,
        userId: users[7].id,
      },
    }),
    // Producto 29 -> users[8]
    prisma.product.upsert({
      where: { slug: "nvidia-riva-tnt2-ultra" },
      update: { userId: users[8].id },
      create: {
        name: "NVIDIA Riva TNT2 Ultra",
        slug: "nvidia-riva-tnt2-ultra",
        description:
          "Tarjeta gráfica de alto rendimiento para la época con 32MB de memoria.",
        price: 64.99,
        originalPrice: 64.99,
        year: 1999,
        manufacturer: "NVIDIA",
        stock: 7,
        images: ["/images/tnt2-ultra.jpg"],
        categoryId: categories[4].id,
        userId: users[8].id,
      },
    }),
    // Producto 30 -> users[9]
    prisma.product.upsert({
      where: { slug: "ati-radeon-9800-pro" },
      update: { userId: users[9].id },
      create: {
        name: "ATI Radeon 9800 Pro",
        slug: "ati-radeon-9800-pro",
        description:
          "Una de las mejores tarjetas gráficas de la era AGP con 128MB de memoria.",
        price: 119.99,
        originalPrice: 149.99,
        year: 2003,
        manufacturer: "ATI",
        stock: 4,
        featured: true,
        images: ["/images/radeon-9800-pro.jpg"],
        categoryId: categories[4].id,
        userId: users[9].id,
      },
    }),
    // Producto 31 -> users[10]
    prisma.product.upsert({
      where: { slug: "nvidia-geforce-fx-5900-ultra" },
      update: { userId: users[10].id },
      create: {
        name: "NVIDIA GeForce FX 5900 Ultra",
        slug: "nvidia-geforce-fx-5900-ultra",
        description: "Tarjeta gráfica de gama alta con 256MB de memoria DDR.",
        price: 99.99,
        originalPrice: 129.99,
        year: 2003,
        manufacturer: "NVIDIA",
        stock: 5,
        images: ["/images/geforce-fx-5900.jpg"],
        categoryId: categories[4].id,
        userId: users[10].id,
      },
    }),
    // Producto 32 -> users[11]
    prisma.product.upsert({
      where: { slug: "3dfx-voodoo2-12mb" },
      update: { userId: users[11].id },
      create: {
        name: "3dfx Voodoo2 12MB",
        slug: "3dfx-voodoo2-12mb",
        description:
          "La legendaria Voodoo2, puede usarse en SLI para máximo rendimiento.",
        price: 79.99,
        originalPrice: 89.99,
        year: 1998,
        manufacturer: "3dfx",
        stock: 3,
        images: ["/images/voodoo2.jpg"],
        categoryId: categories[4].id,
        userId: users[11].id,
      },
    }),
    // Producto 33 -> users[0]
    prisma.product.upsert({
      where: { slug: "nvidia-geforce2-mx400" },
      update: { userId: users[0].id },
      create: {
        name: "NVIDIA GeForce2 MX400",
        slug: "nvidia-geforce2-mx400",
        description:
          "Tarjeta gráfica económica pero capaz para juegos de la época.",
        price: 34.99,
        originalPrice: 44.99,
        year: 2001,
        manufacturer: "NVIDIA",
        stock: 9,
        images: ["/images/geforce2-mx400.jpg"],
        categoryId: categories[4].id,
        userId: users[0].id,
      },
    }),
    // Producto 34 -> users[1]
    prisma.product.upsert({
      where: { slug: "ati-rage-128-pro" },
      update: { userId: users[1].id },
      create: {
        name: "ATI Rage 128 Pro",
        slug: "ati-rage-128-pro",
        description: "Tarjeta gráfica 2D/3D con excelente calidad de imagen.",
        price: 29.99,
        originalPrice: 39.99,
        year: 1999,
        manufacturer: "ATI",
        stock: 6,
        images: ["/images/rage-128-pro.jpg"],
        categoryId: categories[4].id,
        userId: users[1].id,
      },
    }),
    // Producto 35 -> users[2]
    prisma.product.upsert({
      where: { slug: "matrox-g400-max" },
      update: { userId: users[2].id },
      create: {
        name: "Matrox G400 MAX",
        slug: "matrox-g400-max",
        description: "Tarjeta gráfica con la mejor calidad 2D de su época.",
        price: 44.99,
        originalPrice: 54.99,
        year: 1999,
        manufacturer: "Matrox",
        stock: 4,
        images: ["/images/matrox-g400.jpg"],
        categoryId: categories[4].id,
        userId: users[2].id,
      },
    }),

    // === DISCOS DUROS ===
    // Producto 36 -> users[3]
    prisma.product.upsert({
      where: { slug: "western-digital-caviar-40gb" },
      update: { userId: users[3].id },
      create: {
        name: "Western Digital Caviar 40GB",
        slug: "western-digital-caviar-40gb",
        description:
          "Disco duro IDE de 40GB con 7200 RPM, perfecto para sistemas retro.",
        price: 39.99,
        originalPrice: 39.99,
        year: 2001,
        manufacturer: "Western Digital",
        stock: 10,
        images: ["/images/wd-caviar-40gb.jpg"],
        categoryId: categories[5].id,
        userId: users[3].id,
      },
    }),
    // Producto 37 -> users[4]
    prisma.product.upsert({
      where: { slug: "seagate-barracuda-80gb" },
      update: { userId: users[4].id },
      create: {
        name: "Seagate Barracuda 80GB",
        slug: "seagate-barracuda-80gb",
        description: "Disco duro IDE de alta velocidad con 80GB de capacidad.",
        price: 44.99,
        originalPrice: 44.99,
        year: 2002,
        manufacturer: "Seagate",
        stock: 8,
        images: ["/images/seagate-80gb.jpg"],
        categoryId: categories[5].id,
        userId: users[4].id,
      },
    }),
    // Producto 38 -> users[5]
    prisma.product.upsert({
      where: { slug: "maxtor-diamondmax-120gb" },
      update: { userId: users[5].id },
      create: {
        name: "Maxtor DiamondMax 120GB",
        slug: "maxtor-diamondmax-120gb",
        description:
          "Disco duro IDE de 120GB con gran capacidad para la época.",
        price: 49.99,
        originalPrice: 49.99,
        year: 2003,
        manufacturer: "Maxtor",
        stock: 7,
        images: ["/images/maxtor-120gb.jpg"],
        categoryId: categories[5].id,
        userId: users[5].id,
      },
    }),
    // Producto 39 -> users[6]
    prisma.product.upsert({
      where: { slug: "quantum-fireball-10gb" },
      update: { userId: users[6].id },
      create: {
        name: "Quantum Fireball 10GB",
        slug: "quantum-fireball-10gb",
        description: "Disco duro clásico de Quantum para sistemas de los 90s.",
        price: 24.99,
        originalPrice: 29.99,
        year: 1999,
        manufacturer: "Quantum",
        stock: 6,
        images: ["/images/quantum-10gb.jpg"],
        categoryId: categories[5].id,
        userId: users[6].id,
      },
    }),
    // Producto 40 -> users[7]
    prisma.product.upsert({
      where: { slug: "ibm-deskstar-75gxp" },
      update: { userId: users[7].id },
      create: {
        name: "IBM Deskstar 75GXP 45GB",
        slug: "ibm-deskstar-75gxp",
        description:
          "Disco duro IBM de alto rendimiento (verificado y funcional).",
        price: 34.99,
        originalPrice: 44.99,
        year: 2000,
        manufacturer: "IBM",
        stock: 4,
        images: ["/images/deskstar-75gxp.jpg"],
        categoryId: categories[5].id,
        userId: users[7].id,
      },
    }),
    // Producto 41 -> users[8]
    prisma.product.upsert({
      where: { slug: "seagate-cheetah-scsi" },
      update: { userId: users[8].id },
      create: {
        name: "Seagate Cheetah 36GB SCSI",
        slug: "seagate-cheetah-scsi",
        description: "Disco duro SCSI de alto rendimiento para servidores.",
        price: 59.99,
        originalPrice: 79.99,
        year: 2001,
        manufacturer: "Seagate",
        stock: 3,
        images: ["/images/cheetah-scsi.jpg"],
        categoryId: categories[5].id,
        userId: users[8].id,
      },
    }),

    // === PERIFÉRICOS ===
    // Producto 42 -> users[9]
    prisma.product.upsert({
      where: { slug: "ibm-model-m-keyboard" },
      update: { userId: users[9].id },
      create: {
        name: "IBM Model M Keyboard",
        slug: "ibm-model-m-keyboard",
        description:
          "El legendario teclado mecánico IBM Model M con switches buckling spring.",
        price: 89.99,
        originalPrice: 119.99,
        year: 1989,
        manufacturer: "IBM",
        stock: 4,
        featured: true,
        images: ["/images/model-m.jpg"],
        categoryId: categories[6].id,
        userId: users[9].id,
      },
    }),
    // Producto 43 -> users[10]
    prisma.product.upsert({
      where: { slug: "microsoft-intellimouse-explorer" },
      update: { userId: users[10].id },
      create: {
        name: "Microsoft IntelliMouse Explorer 3.0",
        slug: "microsoft-intellimouse-explorer",
        description:
          "Mouse óptico legendario, favorito de gamers profesionales.",
        price: 49.99,
        originalPrice: 59.99,
        year: 2003,
        manufacturer: "Microsoft",
        stock: 6,
        featured: true,
        images: ["/images/intellimouse.jpg"],
        categoryId: categories[6].id,
        userId: users[10].id,
      },
    }),
    // Producto 44 -> users[11]
    prisma.product.upsert({
      where: { slug: "logitech-mx500" },
      update: { userId: users[11].id },
      create: {
        name: "Logitech MX500",
        slug: "logitech-mx500",
        description: "Mouse óptico ergonómico de alta precisión.",
        price: 39.99,
        originalPrice: 49.99,
        year: 2002,
        manufacturer: "Logitech",
        stock: 5,
        images: ["/images/mx500.jpg"],
        categoryId: categories[6].id,
        userId: users[11].id,
      },
    }),
    // Producto 45 -> users[0]
    prisma.product.upsert({
      where: { slug: "dell-quietkey-keyboard" },
      update: { userId: users[0].id },
      create: {
        name: "Dell QuietKey Keyboard",
        slug: "dell-quietkey-keyboard",
        description:
          "Teclado de membrana silencioso de Dell, muy cómodo para escribir.",
        price: 19.99,
        originalPrice: 24.99,
        year: 2000,
        manufacturer: "Dell",
        stock: 12,
        images: ["/images/dell-quietkey.jpg"],
        categoryId: categories[6].id,
        userId: users[0].id,
      },
    }),
    // Producto 46 -> users[1]
    prisma.product.upsert({
      where: { slug: "microsoft-serial-mouse" },
      update: { userId: users[1].id },
      create: {
        name: "Microsoft Serial Mouse 2.0",
        slug: "microsoft-serial-mouse",
        description: "Mouse de bola clásico con conector serial.",
        price: 9.99,
        originalPrice: 14.99,
        year: 1995,
        manufacturer: "Microsoft",
        stock: 8,
        images: ["/images/serial-mouse.jpg"],
        categoryId: categories[6].id,
        userId: users[1].id,
      },
    }),

    // === TARJETAS DE SONIDO ===
    // Producto 47 -> users[2]
    prisma.product.upsert({
      where: { slug: "creative-soundblaster-live" },
      update: { userId: users[2].id },
      create: {
        name: "Creative Sound Blaster Live!",
        slug: "creative-soundblaster-live",
        description: "Tarjeta de sonido con chip EMU10K1 y soporte EAX.",
        price: 34.99,
        originalPrice: 44.99,
        year: 1998,
        manufacturer: "Creative",
        stock: 7,
        featured: true,
        images: ["/images/sb-live.jpg"],
        categoryId: categories[7].id,
        userId: users[2].id,
      },
    }),
    // Producto 48 -> users[3]
    prisma.product.upsert({
      where: { slug: "creative-awe64-gold" },
      update: { userId: users[3].id },
      create: {
        name: "Creative AWE64 Gold",
        slug: "creative-awe64-gold",
        description: "Tarjeta ISA con síntesis wavetable de alta calidad.",
        price: 49.99,
        originalPrice: 59.99,
        year: 1996,
        manufacturer: "Creative",
        stock: 3,
        images: ["/images/awe64-gold.jpg"],
        categoryId: categories[7].id,
        userId: users[3].id,
      },
    }),
    // Producto 49 -> users[4]
    prisma.product.upsert({
      where: { slug: "sound-blaster-16" },
      update: { userId: users[4].id },
      create: {
        name: "Sound Blaster 16",
        slug: "sound-blaster-16",
        description: "La tarjeta de sonido clásica para DOS gaming.",
        price: 39.99,
        originalPrice: 49.99,
        year: 1992,
        manufacturer: "Creative",
        stock: 5,
        images: ["/images/sb16.jpg"],
        categoryId: categories[7].id,
        userId: users[4].id,
      },
    }),
    // Producto 50 -> users[5]
    prisma.product.upsert({
      where: { slug: "creative-audigy-2" },
      update: { userId: users[5].id },
      create: {
        name: "Creative Audigy 2 ZS",
        slug: "creative-audigy-2",
        description: "Tarjeta de sonido de alta fidelidad con soporte 7.1.",
        price: 44.99,
        originalPrice: 54.99,
        year: 2003,
        manufacturer: "Creative",
        stock: 6,
        images: ["/images/audigy2.jpg"],
        categoryId: categories[7].id,
        userId: users[5].id,
      },
    }),
    // Producto 51 -> users[6]
    prisma.product.upsert({
      where: { slug: "gravis-ultrasound" },
      update: { userId: users[6].id },
      create: {
        name: "Gravis UltraSound MAX",
        slug: "gravis-ultrasound",
        description: "Tarjeta de sonido legendaria para demos y MOD trackers.",
        price: 79.99,
        originalPrice: 99.99,
        year: 1994,
        manufacturer: "Gravis",
        stock: 2,
        images: ["/images/gus-max.jpg"],
        categoryId: categories[7].id,
        userId: users[6].id,
      },
    }),
  ]);

  console.log(`✅ Created ${products.length} products`);

  // === RESEÑAS ===
  // Primero limpiamos reseñas existentes para evitar duplicados en re-seeds
  await prisma.review.deleteMany({});

  // Reseñas raíz (sin parentId)
  const review1 = await prisma.review.create({
    data: {
      productId: products[0].id, // IBM ThinkPad 600E
      userId: users[2].id, // Carlos Mendez
      content:
        "Increíble estado de conservación. El trackpoint funciona perfecto y el teclado tiene ese tacto clásico de ThinkPad que ya no se encuentra. Windows 98 arranca sin problemas.",
    },
  });

  const review2 = await prisma.review.create({
    data: {
      productId: products[0].id, // IBM ThinkPad 600E
      userId: users[5].id, // Ana Torres
      content:
        "Llegó bien embalada y todo funciona. La batería obviamente no dura nada pero para usarla conectada está genial. Muy nostálgica.",
    },
  });

  const review3 = await prisma.review.create({
    data: {
      productId: products[0].id, // IBM ThinkPad 600E
      userId: users[8].id, // Diego Fernandez
      content:
        "La compré para una colección y estoy muy contento. El vendedor fue muy atento con el empaquetado.",
    },
  });

  const review4 = await prisma.review.create({
    data: {
      productId: products[5].id, // Apple iMac G3 Bondi Blue
      userId: users[0].id, // Usuario Demo
      content:
        "El color Bondi Blue es espectacular en persona. Funciona de maravilla con Mac OS 9. Un clásico absoluto del diseño industrial.",
    },
  });

  const review5 = await prisma.review.create({
    data: {
      productId: products[5].id, // Apple iMac G3 Bondi Blue
      userId: users[3].id, // Laura Gonzalez
      content:
        "Siempre quise uno de estos. Lo tengo en el living y todos preguntan qué es. El CRT se ve increíble, colores vibrantes.",
    },
  });

  const review6 = await prisma.review.create({
    data: {
      productId: products[28].id, // 3dfx Voodoo3 3000 AGP
      userId: users[2].id, // Carlos Mendez
      content:
        "La instalé en mi build retro con un Pentium III y corre Quake III de lujo. La nostalgia de Glide no tiene precio.",
    },
  });

  const review7 = await prisma.review.create({
    data: {
      productId: products[28].id, // 3dfx Voodoo3 3000 AGP
      userId: users[11].id, // Isabella Vargas
      content:
        "Funciona perfecto. Los juegos con Glide API se ven mucho mejor que con Direct3D de la época. Excelente compra para retro gaming.",
    },
  });

  const review8 = await prisma.review.create({
    data: {
      productId: products[42].id, // IBM Model M Keyboard
      userId: users[0].id, // Usuario Demo
      content:
        "El sonido de las teclas buckling spring es adictivo. Escribir en este teclado es una experiencia completamente diferente. Construido como un tanque.",
    },
  });

  const review9 = await prisma.review.create({
    data: {
      productId: products[42].id, // IBM Model M Keyboard
      userId: users[4].id, // Martin Rodriguez
      content:
        "Lo uso todos los días para trabajar. Mis compañeros de oficina me odian por el ruido pero yo soy feliz. Calidad insuperable.",
    },
  });

  const review10 = await prisma.review.create({
    data: {
      productId: products[42].id, // IBM Model M Keyboard
      userId: users[7].id, // Valentina Lopez
      content:
        "Pesadísimo pero indestructible. Lleva más de 30 años y sigue funcionando como el primer día. Una reliquia.",
    },
  });

  const review11 = await prisma.review.create({
    data: {
      productId: products[22].id, // Sony Trinitron CPD-G220
      userId: users[3].id, // Laura Gonzalez
      content:
        "La calidad de imagen del Trinitron sigue siendo impresionante. Para juegos retro no hay nada mejor que un buen CRT. Cero input lag.",
    },
  });

  const review12 = await prisma.review.create({
    data: {
      productId: products[22].id, // Sony Trinitron CPD-G220
      userId: users[10].id, // Santiago Morales
      content:
        "Pesa una tonelada pero la imagen es perfecta. Los colores son mucho más vivos que en cualquier LCD moderno. Para speedrunning es indispensable.",
    },
  });

  const review13 = await prisma.review.create({
    data: {
      productId: products[8].id, // Intel Pentium III 800MHz
      userId: users[6].id, // Pedro Sanchez
      content:
        "Lo usé para armar un PC retro con Windows 98 SE. Corre todo lo de la época sin problemas. Buen precio también.",
    },
  });

  const review14 = await prisma.review.create({
    data: {
      productId: products[47].id, // Creative Sound Blaster Live!
      userId: users[8].id, // Diego Fernandez
      content:
        "El chip EMU10K1 suena espectacular. EAX en juegos como Thief y Half-Life es otra experiencia. Imprescindible para un build retro serio.",
    },
  });

  const review15 = await prisma.review.create({
    data: {
      productId: products[47].id, // Creative Sound Blaster Live!
      userId: users[11].id, // Isabella Vargas
      content:
        "Funciona de inmediato con Windows 98 y XP. Los drivers se encuentran fácil online. Calidad de audio muy buena para la época.",
    },
  });

  const review16 = await prisma.review.create({
    data: {
      productId: products[30].id, // ATI Radeon 9800 Pro
      userId: users[0].id, // Usuario Demo
      content:
        "La mejor tarjeta AGP que existió. Half-Life 2, Doom 3, Far Cry... todo corre de lujo. Un must para builds retro de gama alta.",
    },
  });

  const review17 = await prisma.review.create({
    data: {
      productId: products[1].id, // Compaq Presario 5000
      userId: users[9].id, // Camila Ruiz
      content:
        "Mi primera computadora fue una Presario. Esta me trajo muchos recuerdos. Funciona perfectamente con Windows 2000.",
    },
  });

  const review18 = await prisma.review.create({
    data: {
      productId: products[43].id, // Microsoft IntelliMouse Explorer 3.0
      userId: users[2].id, // Carlos Mendez
      content:
        "El mejor mouse que se fabricó. La forma ergonómica es perfecta y el sensor óptico sigue siendo preciso. Leyenda del gaming.",
    },
  });

  console.log("✅ Created 18 root reviews");

  // Respuestas a reseñas (un solo nivel de profundidad)
  await Promise.all([
    // Respuesta del vendedor (users[0]) a la reseña de Carlos en ThinkPad
    prisma.review.create({
      data: {
        productId: products[0].id,
        userId: users[0].id, // El vendedor del producto
        content:
          "¡Gracias Carlos! Me alegra que te haya gustado. Todos los ThinkPad que vendo pasan por una revisión completa antes del envío.",
        parentId: review1.id,
      },
    }),
    // Respuesta de otro usuario a la reseña de Ana en ThinkPad
    prisma.review.create({
      data: {
        productId: products[0].id,
        userId: users[10].id, // Santiago Morales
        content:
          "¿Probaste ponerle una batería de terceros? Hay algunas compatibles en eBay que dan un par de horas.",
        parentId: review2.id,
      },
    }),
    // Respuesta a la reseña del iMac G3
    prisma.review.create({
      data: {
        productId: products[5].id,
        userId: users[6].id, // Pedro (vendedor del iMac)
        content:
          "¡Gracias por la reseña! Si querés, también tengo el teclado y mouse USB originales que hacen juego.",
        parentId: review4.id,
      },
    }),
    // Respuesta a reseña de Voodoo3
    prisma.review.create({
      data: {
        productId: products[28].id,
        userId: users[9].id, // Camila Ruiz
        content:
          "¿En qué resolución lo corrés? Yo tengo la Voodoo3 2000 y a 1024x768 ya empieza a sufrir un poco.",
        parentId: review6.id,
      },
    }),
    // Carlos responde sobre la Voodoo3
    prisma.review.create({
      data: {
        productId: products[28].id,
        userId: users[2].id, // Carlos (autor de review6)
        content:
          "A 800x600 va perfecta. La 3000 tiene más memoria y clockea más alto que la 2000, así que a 1024x768 también se banca bastante bien.",
        parentId: review6.id,
      },
    }),
    // Respuesta en Model M
    prisma.review.create({
      data: {
        productId: products[42].id,
        userId: users[9].id, // Camila (vendedora del Model M)
        content:
          "¡Gracias! Es verdad que son ruidosos pero la calidad de escritura no tiene comparación. Tengo más unidades si alguien necesita.",
        parentId: review8.id,
      },
    }),
    // Respuesta en Trinitron
    prisma.review.create({
      data: {
        productId: products[22].id,
        userId: users[4].id, // Martin Rodriguez
        content:
          "Totalmente de acuerdo con lo del input lag. Para juegos de pelea y speedruns un CRT es obligatorio.",
        parentId: review11.id,
      },
    }),
    // Respuesta en Sound Blaster Live
    prisma.review.create({
      data: {
        productId: products[47].id,
        userId: users[2].id, // Carlos (vendedor de SB Live)
        content:
          "Me alegra que funcione bien. Si necesitás el CD original con los drivers y el software, avisame que tengo copias.",
        parentId: review14.id,
      },
    }),
    // Respuesta en Radeon 9800 Pro
    prisma.review.create({
      data: {
        productId: products[30].id,
        userId: users[9].id, // Camila (vendedora de Radeon 9800)
        content:
          "¡Gracias por la reseña! Tengo también una Radeon 9700 Pro si alguien busca algo similar pero un poco más económico.",
        parentId: review16.id,
      },
    }),
    // Respuesta en Compaq Presario
    prisma.review.create({
      data: {
        productId: products[1].id,
        userId: users[2].id, // Carlos (vendedor de Presario)
        content:
          "¡Qué bueno que te trajo buenos recuerdos! Las Presario eran muy populares. Si necesitás los drivers originales, puedo pasártelos.",
        parentId: review17.id,
      },
    }),
    // Respuesta en IntelliMouse
    prisma.review.create({
      data: {
        productId: products[43].id,
        userId: users[7].id, // Valentina Lopez
        content:
          "Coincido totalmente. Todavía hay gente que juega competitivo con el IntelliMouse. El shape es perfecto para claw grip.",
        parentId: review18.id,
      },
    }),
  ]);

  console.log("✅ Created 11 review replies");
  console.log("🎉 Seeding completed!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

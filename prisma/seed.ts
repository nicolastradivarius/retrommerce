import { PrismaClient, Condition } from '../app/generated/prisma';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Crear categorías
  const categories = await Promise.all([
    prisma.category.create({
      data: {
        name: 'Computadoras',
        slug: 'computadoras',
        description: 'Computadoras completas de los 90s y 2000s',
        icon: '💻',
      },
    }),
    prisma.category.create({
      data: {
        name: 'Procesadores',
        slug: 'procesadores',
        description: 'CPUs clásicos de Intel, AMD y Cyrix',
        icon: '⚡',
      },
    }),
    prisma.category.create({
      data: {
        name: 'Memorias RAM',
        slug: 'memorias-ram',
        description: 'Módulos SIMM, DIMM y SDRAM vintage',
        icon: '🧠',
      },
    }),
    prisma.category.create({
      data: {
        name: 'Monitores CRT',
        slug: 'monitores-crt',
        description: 'Monitores de tubo catódico clásicos',
        icon: '📺',
      },
    }),
    prisma.category.create({
      data: {
        name: 'Tarjetas Gráficas',
        slug: 'tarjetas-graficas',
        description: 'GPUs retro de 3dfx, Nvidia, ATI',
        icon: '🎨',
      },
    }),
    prisma.category.create({
      data: {
        name: 'Discos Duros',
        slug: 'discos-duros',
        description: 'HDDs IDE y SCSI vintage',
        icon: '💾',
      },
    }),
  ]);

  console.log(`✅ Created ${categories.length} categories`);

  // Crear productos de ejemplo
  const products = await Promise.all([
    prisma.product.create({
      data: {
        name: 'IBM ThinkPad 600E',
        slug: 'ibm-thinkpad-600e',
        description: 'Laptop clásica de IBM con procesador Pentium II y Windows 98. Incluye trackpoint rojo característico.',
        price: 299.99,
        originalPrice: 399.99,
        year: 1998,
        manufacturer: 'IBM',
        condition: Condition.GOOD,
        stock: 3,
        featured: true,
        images: ['/images/thinkpad-600e.jpg'],
        specifications: {
          cpu: 'Intel Pentium II 366MHz',
          ram: '128MB SDRAM',
          storage: '6GB HDD',
          display: '13.3" TFT 800x600',
          os: 'Windows 98 SE',
          ports: 'PS/2, Serial, Parallel, USB',
        },
        categoryId: categories[0].id,
      },
    }),
    prisma.product.create({
      data: {
        name: 'Intel Pentium III 800MHz',
        slug: 'intel-pentium-3-800mhz',
        description: 'Procesador Intel Pentium III Socket 370, perfecto para builds retro.',
        price: 49.99,
        year: 2000,
        manufacturer: 'Intel',
        condition: Condition.USED,
        stock: 8,
        featured: true,
        images: ['/images/pentium3-800.jpg'],
        specifications: {
          socket: 'Socket 370',
          cores: '1',
          threads: '1',
          cache: '256KB L2',
          fsb: '133MHz',
        },
        categoryId: categories[1].id,
      },
    }),
    prisma.product.create({
      data: {
        name: 'Sony Trinitron CPD-G220',
        slug: 'sony-trinitron-cpd-g220',
        description: 'Monitor CRT profesional de 19" con resolución máxima de 1600x1200. Perfecto para gaming retro.',
        price: 149.99,
        originalPrice: 199.99,
        year: 2001,
        manufacturer: 'Sony',
        condition: Condition.EXCELLENT,
        stock: 2,
        featured: true,
        images: ['/images/trinitron-g220.jpg'],
        specifications: {
          size: '19 pulgadas',
          resolution: '1600x1200 @ 85Hz',
          dotPitch: '0.24mm',
          inputs: 'VGA, BNC',
          technology: 'Trinitron Aperture Grille',
        },
        categoryId: categories[3].id,
      },
    }),
    prisma.product.create({
      data: {
        name: '3dfx Voodoo3 3000 AGP',
        slug: '3dfx-voodoo3-3000-agp',
        description: 'Tarjeta gráfica legendaria de 3dfx. ¡La reina del Glide!',
        price: 89.99,
        year: 1999,
        manufacturer: '3dfx',
        condition: Condition.GOOD,
        stock: 5,
        images: ['/images/voodoo3-3000.jpg'],
        specifications: {
          memory: '16MB SDRAM',
          interface: 'AGP 2x/4x',
          ramdac: '300MHz',
          maxResolution: '2048x1536',
          api: 'Glide, OpenGL, Direct3D',
        },
        categoryId: categories[4].id,
      },
    }),
    prisma.product.create({
      data: {
        name: 'Kingston 128MB PC133 SDRAM',
        slug: 'kingston-128mb-pc133',
        description: 'Módulo de memoria SDRAM de 128MB para sistemas Socket 370/Slot 1',
        price: 24.99,
        year: 2000,
        manufacturer: 'Kingston',
        condition: Condition.NEW_OLD_STOCK,
        stock: 15,
        images: ['/images/kingston-128mb.jpg'],
        specifications: {
          capacity: '128MB',
          type: 'SDRAM DIMM',
          speed: 'PC133 (133MHz)',
          pins: '168-pin',
          voltage: '3.3V',
        },
        categoryId: categories[2].id,
      },
    }),
  ]);

  console.log(`✅ Created ${products.length} products`);
  console.log('🎉 Seeding completed!');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

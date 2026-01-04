import { PrismaClient } from '../app/generated/prisma';
import { PrismaPg } from '@prisma/adapter-pg'
import 'dotenv/config'

const connectionString = `${process.env.DATABASE_URL}`

const adapter = new PrismaPg({ connectionString })
const prisma = new PrismaClient({ adapter })

async function main() {
	console.log('🌱 Seeding database...');

	// Crear categorías
	const categories = await Promise.all([
		prisma.category.upsert({
			where: { slug: 'computadoras' },
			update: {},
			create: {
				name: 'Computadoras',
				slug: 'computadoras',
				description: 'Computadoras completas de los 90s y 2000s',
			},
		}),
		prisma.category.upsert({
			where: { slug: 'procesadores' },
			update: {},
			create: {
				name: 'Procesadores',
				slug: 'procesadores',
				description: 'CPUs clásicos de Intel, AMD y Cyrix',
			},
		}),
		prisma.category.upsert({
			where: { slug: 'memorias-ram' },
			update: {},
			create: {
				name: 'Memorias RAM',
				slug: 'memorias-ram',
				description: 'Módulos SIMM, DIMM y SDRAM vintage',
			},
		}),
		prisma.category.upsert({
			where: { slug: 'monitores-crt' },
			update: {},
			create: {
				name: 'Monitores CRT',
				slug: 'monitores-crt',
				description: 'Monitores de tubo catódico clásicos',
			},
		}),
		prisma.category.upsert({
			where: { slug: 'tarjetas-graficas' },
			update: {},
			create: {
				name: 'Tarjetas Gráficas',
				slug: 'tarjetas-graficas',
				description: 'GPUs retro de 3dfx, Nvidia, ATI',
			},
		}),
		prisma.category.upsert({
			where: { slug: 'discos-duros' },
			update: {},
			create: {
				name: 'Discos Duros',
				slug: 'discos-duros',
				description: 'HDDs IDE y SCSI vintage',
			},
		}),
	]);

	console.log(`✅ Created ${categories.length} categories`);

	// Crear productos de ejemplo
	const products = await Promise.all([
		prisma.product.upsert({
			where: { slug: 'ibm-thinkpad-600e' },
			update: {},
			create: {
				name: 'IBM ThinkPad 600E',
				slug: 'ibm-thinkpad-600e',
				description: 'Laptop clásica de IBM con procesador Pentium II y Windows 98. Incluye trackpoint rojo característico.',
				price: 299.99,
				originalPrice: 399.99,
				year: 1998,
				manufacturer: 'IBM',
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
		prisma.product.upsert({
			where: { slug: 'intel-pentium-3-800mhz' },
			update: {},
			create: {
				name: 'Intel Pentium III 800MHz',
				slug: 'intel-pentium-3-800mhz',
				description: 'Procesador Intel Pentium III Socket 370, perfecto para builds retro.',
				price: 49.99,
				originalPrice: 49.99,
				year: 2000,
				manufacturer: 'Intel',
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
		prisma.product.upsert({
			where: { slug: 'sony-trinitron-cpd-g220' },
			update: {},
			create: {
				name: 'Sony Trinitron CPD-G220',
				slug: 'sony-trinitron-cpd-g220',
				description: 'Monitor CRT profesional de 19" con resolución máxima de 1600x1200. Perfecto para gaming retro.',
				price: 149.99,
				originalPrice: 199.99,
				year: 2001,
				manufacturer: 'Sony',
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
		prisma.product.upsert({
			where: { slug: '3dfx-voodoo3-3000-agp' },
			update: {},
			create: {
				name: '3dfx Voodoo3 3000 AGP',
				slug: '3dfx-voodoo3-3000-agp',
				description: 'Tarjeta gráfica legendaria de 3dfx. ¡La reina del Glide!',
				price: 89.99,
				originalPrice: 89.99,
				year: 1999,
				manufacturer: '3dfx',
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
		prisma.product.upsert({
			where: { slug: 'kingston-128mb-pc133' },
			update: {},
			create: {
				name: 'Kingston 128MB PC133 SDRAM',
				slug: 'kingston-128mb-pc133',
				description: 'Módulo de memoria SDRAM de 128MB para sistemas Socket 370/Slot 1',
				price: 24.99,
				originalPrice: 24.99,
				year: 2000,
				manufacturer: 'Kingston',
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

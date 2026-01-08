import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { ITEMS_PER_PAGE } from '@/lib/constants';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const skip = (page - 1) * ITEMS_PER_PAGE;

    const [products, totalCount] = await Promise.all([
      prisma.product.findMany({
        skip,
        take: ITEMS_PER_PAGE,
        orderBy: [
          { featured: 'desc' },
          { createdAt: 'desc' },
        ],
        select: {
          id: true,
          name: true,
          slug: true,
          description: true,
          price: true,
          originalPrice: true,
          year: true,
          manufacturer: true,
          stock: true,
          images: true,
          featured: true,
        },
      }),
      prisma.product.count(),
    ]);

    const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

    return NextResponse.json({
      products,
      pagination: {
        page,
        totalPages,
        totalCount,
        itemsPerPage: ITEMS_PER_PAGE,
      },
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json(
      { error: 'Error al obtener productos' },
      { status: 500 }
    );
  }
}

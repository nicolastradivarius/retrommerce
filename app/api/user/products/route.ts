import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export async function POST(request: NextRequest) {
  try {
    const userPayload = await getCurrentUser();

    if (!userPayload) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const body = await request.json();

    const {
      name,
      description,
      price,
      originalPrice,
      year,
      manufacturer,
      stock,
      categoryId,
      images,
    } = body;

    // Validate required fields
    if (!name || typeof name !== "string" || name.trim().length === 0) {
      return NextResponse.json(
        { error: "El nombre es obligatorio" },
        { status: 400 },
      );
    }

    if (
      price === undefined ||
      price === null ||
      isNaN(Number(price)) ||
      Number(price) < 0
    ) {
      return NextResponse.json(
        { error: "El precio es obligatorio y debe ser un número válido" },
        { status: 400 },
      );
    }

    if (!categoryId || typeof categoryId !== "string") {
      return NextResponse.json(
        { error: "La categoría es obligatoria" },
        { status: 400 },
      );
    }

    // Verify category exists
    const category = await prisma.category.findUnique({
      where: { id: categoryId },
    });

    if (!category) {
      return NextResponse.json(
        { error: "Categoría no encontrada" },
        { status: 400 },
      );
    }

    // Generate unique slug
    const baseSlug = generateSlug(name.trim());
    let slug = baseSlug;
    let counter = 1;

    while (await prisma.product.findUnique({ where: { slug } })) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    const product = await prisma.product.create({
      data: {
        name: name.trim(),
        slug,
        description: description || null,
        price: Number(price),
        originalPrice:
          originalPrice !== undefined &&
          originalPrice !== null &&
          !isNaN(Number(originalPrice))
            ? Number(originalPrice)
            : Number(price),
        year:
          year !== undefined && year !== null && !isNaN(Number(year))
            ? Number(year)
            : null,
        manufacturer: manufacturer || null,
        stock:
          stock !== undefined && stock !== null && !isNaN(Number(stock))
            ? Number(stock)
            : 0,
        categoryId,
        images: Array.isArray(images)
          ? images.filter(
              (img: unknown) =>
                typeof img === "string" && img.trim().length > 0,
            )
          : [],
        featured: false,
        featuredOnHomepage: false,
        userId: userPayload.sub,
      },
      select: {
        id: true,
        name: true,
        slug: true,
        price: true,
        createdAt: true,
      },
    });

    return NextResponse.json(
      {
        success: true,
        product: {
          ...product,
          price: product.price.toString(),
        },
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Error creating product:", error);
    return NextResponse.json(
      { error: "Error al crear el producto" },
      { status: 500 },
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
    try {
        const userPayload = await getCurrentUser();

        if (!userPayload) {
            return NextResponse.json({ error: "No autorizado" }, { status: 401 });
        }

        const favorites = await prisma.favorite.findMany({
            where: { userId: userPayload.sub },
            select: { productId: true, createdAt: true },
            orderBy: { createdAt: "desc" },
        });

        return NextResponse.json({ favorites });
    } catch (error) {
        console.error("Error fetching favorites:", error);
        return NextResponse.json(
            { error: "Error al obtener favoritos" },
            { status: 500 },
        );
    }
}

export async function POST(request: NextRequest) {
    try {
        const userPayload = await getCurrentUser();

        if (!userPayload) {
            return NextResponse.json({ error: "No autorizado" }, { status: 401 });
        }

        const { productId } = await request.json();

        if (!productId) {
            return NextResponse.json(
                { error: "productId es requerido" },
                { status: 400 },
            );
        }

        await prisma.favorite.upsert({
            where: {
                userId_productId: {
                    userId: userPayload.sub,
                    productId,
                },
            },
            update: {},
            create: {
                userId: userPayload.sub,
                productId,
            },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error adding favorite:", error);
        return NextResponse.json(
            { error: "Error al agregar favorito" },
            { status: 500 },
        );
    }
}

export async function DELETE(request: NextRequest) {
    try {
        const userPayload = await getCurrentUser();

        if (!userPayload) {
            return NextResponse.json({ error: "No autorizado" }, { status: 401 });
        }

        const { productId } = await request.json();

        if (!productId) {
            return NextResponse.json(
                { error: "productId es requerido" },
                { status: 400 },
            );
        }

        await prisma.favorite.deleteMany({
            where: { userId: userPayload.sub, productId },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error removing favorite:", error);
        return NextResponse.json(
            { error: "Error al quitar favorito" },
            { status: 500 },
        );
    }
}
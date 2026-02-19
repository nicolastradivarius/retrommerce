import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import { prisma } from "@/lib/prisma";

export interface UserPayload {
  sub: string;
  email: string;
  role: string;
  name: string;
}

export interface UserWithAvatar {
  sub: string;
  email: string;
  role: string;
  name: string;
  phone: string | null;
  avatar: string | null;
  avatarUpdatedAt: Date | null;
}

export async function getCurrentUser(): Promise<UserPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth_token")?.value;

  if (!token) {
    return null;
  }

  try {
    const JWT_SECRET = process.env.JWT_SECRET;
    if (!JWT_SECRET) {
      return null;
    }

    const payload = jwt.verify(token, JWT_SECRET) as UserPayload;
    return payload;
  } catch {
    return null;
  }
}

export async function getCurrentUserWithAvatar(): Promise<UserWithAvatar | null> {
  const userPayload = await getCurrentUser();

  if (!userPayload) {
    return null;
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: userPayload.sub },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        avatar: true,
        avatarUpdatedAt: true,
        role: true,
      },
    });

    if (!user) {
      return null;
    }

    return {
      sub: user.id,
      email: user.email,
      role: user.role,
      name: user.name || "",
      phone: user.phone,
      avatar: user.avatar,
      avatarUpdatedAt: user.avatarUpdatedAt,
    };
  } catch {
    return null;
  }
}

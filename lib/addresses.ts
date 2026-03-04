import "server-only";

import { prisma } from "@/lib/prisma";
import type { Prisma } from "@/app/generated/prisma";

/**
 * Shape of an address as returned by getAddressesByUserId.
 */
export type AddressItem = Prisma.AddressGetPayload<{
  select: {
    id: true;
    fullName: true;
    street: true;
    city: true;
    state: true;
    zipCode: true;
    country: true;
    phone: true;
    isDefault: true;
  };
}>;

/**
 * Fetches all addresses belonging to a user, ordered by default first,
 * then by creation date descending.
 *
 * @param userId - The authenticated user's ID
 */
export async function getAddressesByUserId(
  userId: string,
): Promise<AddressItem[]> {
  try {
    return await prisma.address.findMany({
      where: { userId },
      orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
      select: {
        id: true,
        fullName: true,
        street: true,
        city: true,
        state: true,
        zipCode: true,
        country: true,
        phone: true,
        isDefault: true,
      },
    });
  } catch (error) {
    console.error("Error fetching addresses for user", userId, error);
    return [];
  }
}

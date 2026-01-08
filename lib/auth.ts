import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';

export interface UserPayload {
  sub: string;
  email: string;
  role: string;
  name: string;
}

export async function getCurrentUser(): Promise<UserPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth_token')?.value;

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
  } catch (error) {
    return null;
  }
}

import jwt from 'jsonwebtoken';

export type JwtPayload = {
  sub: string;
  phoneNorm: string;
  role: 'maid' | 'user';
};

export function signToken(payload: JwtPayload, secret: string): string {
  const body = { sub: payload.sub, phoneNorm: payload.phoneNorm, role: payload.role };
  return jwt.sign(body, secret, { expiresIn: 30 * 24 * 60 * 60 });
}

export function verifyToken(token: string, secret: string): JwtPayload {
  const decoded = jwt.verify(token, secret) as jwt.JwtPayload;
  if (!decoded.sub || typeof decoded.phoneNorm !== 'string' || (decoded.role !== 'maid' && decoded.role !== 'user')) {
    throw new Error('Invalid token payload');
  }
  return {
    sub: decoded.sub,
    phoneNorm: decoded.phoneNorm,
    role: decoded.role,
  };
}

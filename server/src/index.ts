import cors from '@fastify/cors';
import Fastify from 'fastify';
import { PrismaClient } from '@prisma/client';
import twilio from 'twilio';
import {
  maidPublicIdFromPhoneNorm,
  normalizePhoneDigits,
  toE164Phone,
} from './lib/phone.js';
import { haversineKm } from './lib/geo.js';
import { signToken, verifyToken, type JwtPayload } from './lib/jwt.js';

function otpDevBypass(): boolean {
  const v = process.env.OTP_DEV_BYPASS;
  return v === 'true' || v === '1';
}

function twilioVerifyReady(): boolean {
  return !!(
    process.env.TWILIO_ACCOUNT_SID &&
    process.env.TWILIO_AUTH_TOKEN &&
    process.env.TWILIO_VERIFY_SERVICE_SID
  );
}

function twilioVerifyClient(): ReturnType<typeof twilio> | null {
  if (!twilioVerifyReady()) return null;
  return twilio(
    process.env.TWILIO_ACCOUNT_SID as string,
    process.env.TWILIO_AUTH_TOKEN as string
  );
}

const prisma = new PrismaClient();

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET || JWT_SECRET.length < 16) {
  console.warn(
    '[findmymaid-api] Set JWT_SECRET (min 16 chars) in production. Using dev default (insecure).'
  );
}
const effectiveSecret = JWT_SECRET && JWT_SECRET.length >= 16 ? JWT_SECRET : 'dev-insecure-jwt-secret';

const app = Fastify({ logger: true });

await app.register(cors, { origin: true });

app.get('/health', async () => ({ ok: true, service: 'findmymaid-api' }));

app.post<{ Body: { phone?: string } }>('/v1/auth/otp/send', async (req, reply) => {
  const raw = (req.body?.phone ?? '').trim();
  if (!raw) return reply.code(400).send({ error: 'phone_required' });
  const e164 = toE164Phone(raw);
  if (!e164) return reply.code(400).send({ error: 'invalid_phone' });
  if (otpDevBypass()) {
    return { sent: true, devBypass: true };
  }
  const client = twilioVerifyClient();
  const vsid = process.env.TWILIO_VERIFY_SERVICE_SID;
  if (!client || !vsid) {
    return reply.code(503).send({ error: 'sms_not_configured' });
  }
  try {
    await client.verify.v2.services(vsid).verifications.create({ to: e164, channel: 'sms' });
    return { sent: true };
  } catch (e) {
    req.log.error(e);
    return reply.code(502).send({ error: 'sms_send_failed' });
  }
});

app.post<{ Body: { phone?: string; code?: string; role?: string } }>('/v1/auth/verify', async (req, reply) => {
  const phone = (req.body?.phone ?? '').trim();
  const code = (req.body?.code ?? '').replace(/\D/g, '');
  const role = req.body?.role === 'maid' ? 'maid' : req.body?.role === 'user' ? 'user' : '';
  if (!phone || !role) {
    return reply.code(400).send({ error: 'phone_and_role_required' });
  }
  const phoneNorm = normalizePhoneDigits(phone);
  if (!phoneNorm) {
    return reply.code(400).send({ error: 'invalid_phone' });
  }
  const e164 = toE164Phone(phone);
  if (!e164) {
    return reply.code(400).send({ error: 'invalid_phone' });
  }

  let otpOk = false;

  if (otpDevBypass()) {
    if (code.length < 6) {
      return reply.code(400).send({ error: 'invalid_code' });
    }
    otpOk = true;
  } else {
    if (!twilioVerifyReady()) {
      return reply.code(503).send({ error: 'sms_not_configured' });
    }
    if (code.length < 4) {
      return reply.code(400).send({ error: 'invalid_code' });
    }
    const client = twilioVerifyClient();
    const vsid = process.env.TWILIO_VERIFY_SERVICE_SID as string;
    try {
      const check = await client!.verify.v2.services(vsid).verificationChecks.create({
        to: e164,
        code,
      });
      otpOk = check.status === 'approved';
    } catch (e) {
      req.log.warn(e);
      return reply.code(400).send({ error: 'invalid_code' });
    }
  }

  if (!otpOk) {
    return reply.code(400).send({ error: 'invalid_code' });
  }

  const user = await prisma.appUser.upsert({
    where: { phoneNorm_role: { phoneNorm, role } },
    create: { phoneNorm, role },
    update: {},
  });
  const token = signToken({
    sub: user.id,
    phoneNorm: user.phoneNorm,
    role: user.role as JwtPayload['role'],
  }, effectiveSecret);
  return { token, user: { id: user.id, phoneNorm: user.phoneNorm, role: user.role } };
});

function authHeader(req: { headers: Record<string, string | string[] | undefined> }): JwtPayload | null {
  const h = req.headers.authorization;
  const raw = Array.isArray(h) ? h[0] : h;
  if (!raw?.startsWith('Bearer ')) return null;
  try {
    return verifyToken(raw.slice(7), effectiveSecret);
  } catch {
    return null;
  }
}

app.get<{ Querystring: { lat?: string; lng?: string; radiusKm?: string } }>(
  '/v1/maids',
  async (req) => {
    const rows = await prisma.maidListing.findMany();
    let list = rows.map((r) => listingToDto(r));

    const lat = req.query.lat != null ? Number(req.query.lat) : NaN;
    const lng = req.query.lng != null ? Number(req.query.lng) : NaN;
    const radiusKm = req.query.radiusKm != null ? Number(req.query.radiusKm) : NaN;
    if (Number.isFinite(lat) && Number.isFinite(lng) && Number.isFinite(radiusKm) && radiusKm > 0) {
      const origin = { lat, lng };
      list = list.filter((m) => {
        if (m.lat == null || m.lng == null) return true;
        return haversineKm(origin, { lat: m.lat, lng: m.lng }) <= radiusKm;
      });
    }

    return { maids: list };
  }
);

app.get<{ Params: { id: string } }>('/v1/maids/:id', async (req, reply) => {
  const row = await prisma.maidListing.findUnique({ where: { id: req.params.id } });
  if (!row) return reply.code(404).send({ error: 'not_found' });
  return { maid: listingToDto(row) };
});

type MaidBody = {
  displayName?: string;
  phone?: string;
  gender?: string;
  photoUri?: string | null;
  rates?: { m30?: number; h1?: number; h2?: number };
  services?: string[];
  verified?: boolean;
  locationLat?: number;
  locationLng?: number;
};

app.put<{ Body: MaidBody }>('/v1/maids/me', async (req, reply) => {
  const jwt = authHeader(req);
  if (!jwt) return reply.code(401).send({ error: 'unauthorized' });
  if (jwt.role !== 'maid') return reply.code(403).send({ error: 'maid_role_required' });

  const b = req.body ?? {};
  const displayName = (b.displayName ?? '').trim();
  const phone = (b.phone ?? '').trim();
  const gender = b.gender === 'male' || b.gender === 'female' ? b.gender : '';
  const rates = b.rates ?? {};
  const m30 = Number(rates.m30);
  const h1 = Number(rates.h1);
  const h2 = Number(rates.h2);
  const services = Array.isArray(b.services) ? b.services : [];

  if (displayName.length < 1) return reply.code(400).send({ error: 'displayName_required' });
  if (!gender) return reply.code(400).send({ error: 'gender_invalid' });
  if (![m30, h1, h2].every((n) => Number.isFinite(n) && n > 0)) return reply.code(400).send({ error: 'rates_invalid' });
  if (services.length < 1) return reply.code(400).send({ error: 'services_required' });

  const phoneNorm = jwt.phoneNorm;
  const listingId = maidPublicIdFromPhoneNorm(phoneNorm);
  const lat =
    typeof b.locationLat === 'number' && Number.isFinite(b.locationLat) ? b.locationLat : null;
  const lng =
    typeof b.locationLng === 'number' && Number.isFinite(b.locationLng) ? b.locationLng : null;

  const row = await prisma.maidListing.upsert({
    where: { userId: jwt.sub },
    create: {
      id: listingId,
      userId: jwt.sub,
      displayName,
      phone: phone || phoneNorm,
      gender,
      photoUrl: b.photoUri ?? null,
      ratesM30: m30,
      ratesH1: h1,
      ratesH2: h2,
      servicesJson: JSON.stringify(services),
      lat,
      lng,
      verified: b.verified !== false,
    },
    update: {
      displayName,
      phone: phone || phoneNorm,
      gender,
      photoUrl: b.photoUri ?? null,
      ratesM30: m30,
      ratesH1: h1,
      ratesH2: h2,
      servicesJson: JSON.stringify(services),
      lat,
      lng,
      verified: b.verified !== false,
    },
  });

  return { maid: listingToDto(row) };
});

function listingToDto(r: {
  id: string;
  displayName: string;
  phone: string;
  gender: string;
  photoUrl: string | null;
  ratesM30: number;
  ratesH1: number;
  ratesH2: number;
  servicesJson: string;
  lat: number | null;
  lng: number | null;
  verified: boolean;
}) {
  let services: string[] = [];
  try {
    const parsed = JSON.parse(r.servicesJson) as unknown;
    if (Array.isArray(parsed)) services = parsed.filter((x): x is string => typeof x === 'string');
  } catch {
    services = [];
  }
  return {
    id: r.id,
    displayName: r.displayName,
    photoUri: r.photoUrl,
    gender: r.gender,
    phone: r.phone,
    rates: { m30: r.ratesM30, h1: r.ratesH1, h2: r.ratesH2 },
    services,
    lat: r.lat,
    lng: r.lng,
    verified: r.verified,
    ratingAvg: 0,
    reviewCount: 0,
    reviews: [] as unknown[],
  };
}

const port = Number(process.env.PORT) || 3000;
const host = process.env.HOST || '0.0.0.0';

try {
  await app.listen({ port, host });
} catch (err) {
  app.log.error(err);
  process.exit(1);
}

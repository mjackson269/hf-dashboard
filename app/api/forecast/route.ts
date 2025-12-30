export const dynamic = "force-dynamic";
export const revalidate = 0;

// UK-centric (Keighley-ish) location for day/night & transitions
const LATITUDE = 53.8;
const LONGITUDE = -1.9;

// Bands we care about and their centre frequencies
const BANDS = {
  "80m": 3.6,
  "40m": 7.1,
  "20m": 14.1,
  "15m": 21.1,
  "10m": 28.5,
} as const;

type BandKey = keyof typeof BANDS;

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function addHours(date: Date, hours: number): Date {
  return new Date(date.getTime() + hours * 60 * 60 * 1000);
}

function isDaytime(d: Date): boolean {
  const hour = d.getUTCHours();
  return hour >= 7 && hour < 18;
}

function transitionFactor(d: Date): { sunrise: number; sunset: number } {
  const hour = d.getUTCHours();
  let sunrise = 0;
  let sunset = 0;

  if (hour >= 5 && hour <= 9) {
    const dist = Math.abs(hour - 7);
    sunrise = clamp(1 - dist / 2, 0, 1);
  }

  if (hour >= 16 && hour <= 20) {
    const dist = Math.abs(hour - 18);
    sunset = clamp(1 - dist / 2, 0, 1);
  }

  return { sunrise, sunset };
}

// ------------------------
// D-layer & SNR modelling
// ------------------------

function calcAbsorption(freqMHz: number, kp: number, isDay: boolean): number {
  const baseLoss = isDay ? 3.0 : 1.0;
  const kpTerm = 0.8 * kp;
  const freqTerm = 16 / freqMHz;
  return Number((baseLoss + kpTerm + freqTerm).toFixed(1));
}

function calcSNR(
  bandFreqMHz: number,
  sfi: number,
  muf: number,
  kp: number,
  absorption: number
): number {
  const sfiFactor = clamp((sfi - 60) / 4, 0, 15);
  const mufRatio = muf / bandFreqMHz;
  const mufFactor = clamp(mufRatio * 8, 0, 20);
  const kpNoise = kp * 1.2;

  const raw = sfiFactor * 1.5 + mufFactor - (absorption + kpNoise);
  return Number(clamp(raw, 0, 40).toFixed(0));
}

function bandTimeFactor(band: BandKey, d: Date): number {
  const hour = d.getUTCHours();
  const day = isDaytime(d);

  switch (band) {
    case "10m":
    case "15m":
      if (hour >= 9 && hour <= 17) return 1;
      if (hour >= 7 && hour < 9) return 0.6;
      if (hour > 17 && hour <= 19) return 0.5;
      return 0.2;

    case "20m":
      if (hour >= 8 && hour <= 20) return 1;
      return 0.5;

    case "40m":
    case "80m":
      if (!day) return 1;
      if (hour >= 17 && hour <= 20) return 0.7;
      if (hour >= 5 && hour < 7) return 0.6;
      return 0.3;

    default:
      return 0.5;
  }
}

function calcDXProbability(
  band: BandKey,
  snr: number,
  bandFreqMHz: number,
  muf: number,
  kp: number,
  d: Date
): number {
  const snrFactor = clamp(snr / 40, 0, 1);
  const mufRatio = muf / bandFreqMHz;
  const mufFactor = clamp((mufRatio - 0.8) / 0.6, 0, 1);
  const timeFactor = clamp(bandTimeFactor(band, d), 0, 1);
  const kpPenalty = clamp(kp / 9, 0, 1);

  let score =
    mufFactor * 0.45 +
    snrFactor * 0.35 +
    timeFactor * 0.15 -
    kpPenalty * 0.25;

  return Number(clamp(score, 0, 1).toFixed(2)) * 100;
}

// ------------------------
// New MUF model
// ------------------------

function calcFoF2FromSfiAndTime(sfi: number, d: Date): number {
  const sfiNorm = clamp((sfi - 60) / 100, 0, 2);
  const hour = d.getUTCHours();
  const radians = ((hour - 12) / 24) * 2 * Math.PI;
  const diurnal = (Math.cos(radians) + 1) / 2;

  const nightFo = 2.5 + sfiNorm * 1.0;
  const dayBoost = 4.0 + sfiNorm * 3.0;

  return nightFo + diurnal * dayBoost;
}

function calcMUFfromFoF2(foF2: number): number {
  return foF2 * 3.2;
}

function calcForecastMUF(
  sfi: number,
  kp: number,
  d: Date,
  liveMufNow: number,
  now: Date
): number {
  const { sunrise, sunset } = transitionFactor(d);

  let foF2 = calcFoF2FromSfiAndTime(sfi, d);
  let muf = calcMUFfromFoF2(foF2);

  muf -= kp * 0.6;
  muf -= sunrise * 4.0;
  muf += sunset * 2.0;

  muf = clamp(muf, 6, 40);

  const hoursFromNow =
    Math.abs(d.getTime() - now.getTime()) / (1000 * 60 * 60);
  const blendFactor = clamp(1 - hoursFromNow / 6, 0, 1);

  return Number((muf * (1 - blendFactor) + liveMufNow * blendFactor).toFixed(1));
}

// ------------------------
// Handler
// ------------------------

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const baseUrl = `${url.protocol}//${url.host}`;

    const res = await fetch(`${baseUrl}/api/current`, {
      cache: "no-store",
    });

    const current = await res.json();
    const { sfiEstimated, kp, muf: liveMufNow } = current;

    const now = new Date();

    const steps: Date[] = [];
    for (let i = 0; i <= 24; i += 3) {
      steps.push(addHours(now, i));
    }

    const forecast = steps.map((ts, idx) => {
      const sfi = Math.round(sfiEstimated + Math.sin(idx / 2) * 4);
      const kpForecast = clamp(kp + Math.cos(idx / 2) * 0.7, 0, 9);
      const mufForecast = calcForecastMUF(sfi, kpForecast, ts, liveMufNow, now);

      const isDay = isDaytime(ts);

      const absorption: Record<BandKey, number> = {} as any;
      const snr: Record<BandKey, number> = {} as any;
      const dxProbability: Record<BandKey, number> = {} as any;

      (Object.keys(BANDS) as BandKey[]).forEach((band) => {
        const freq = BANDS[band];

        const a = calcAbsorption(freq, kpForecast, isDay);
        const s = calcSNR(freq, sfi, mufForecast, kpForecast, a);
        const dx = calcDXProbability(band, s, freq, mufForecast, kpForecast, ts);

        absorption[band] = a;
        snr[band] = s;
        dxProbability[band] = dx;
      });

      return {
        timeIso: ts.toISOString(),
        timeLabel: ts.toISOString().substring(11, 16),
        sfi,
        kp: Number(kpForecast.toFixed(1)),
        muf: mufForecast,
        absorption,
        snr,
        dxProbability,
      };
    });

    return Response.json({ forecast });
  } catch (err) {
    console.error("[/api/forecast] Error:", err);
    return Response.json({ forecast: [] }, { status: 500 });
  }
}
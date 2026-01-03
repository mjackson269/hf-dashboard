export function generateDeterministicMUF(sfi: number, kp: number) {
  const hours = [...Array(24).keys()];
  const now = new Date();
  const currentHour = now.getUTCHours();

  // Base MUF from SFI (simple but effective)
  const baseMUF = 3 + (sfi - 60) * 0.25; // SFI 100 → ~13 MHz baseline

  // Kp suppression (geomagnetic storms reduce MUF)
  const kpPenalty = Math.max(0, (kp - 2) * 1.2);

  const curve = hours.map((h) => {
    const hourOffset = (h - currentHour + 24) % 24;

    // Diurnal shaping: MUF peaks ~13:00, lowest ~03:00
    const diurnal =
      1 + 0.35 * Math.sin(((hourOffset - 3) / 24) * Math.PI * 2);

    let muf = baseMUF * diurnal - kpPenalty;

    // Clamp realistic MUF range
    muf = Math.max(2, Math.min(muf, 45));

    return {
      hour: h,
      muf: Number(muf.toFixed(1)),
    };
  });

  return curve;
}
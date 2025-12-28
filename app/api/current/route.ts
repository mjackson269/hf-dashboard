export async function GET() {
  // In a real app, fetch these from your data source.
  const data = {
    sfiEstimated: 145,
    sfiEstimatedPrev: 143,

    sfiAdjusted: 178,
    sfiAdjustedPrev: 178,

    kp: 2,
    kpPrev: 3,

    muf: 22.5,
    mufPrev: 21.8,
  };

  return Response.json(data);
}


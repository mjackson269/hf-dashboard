export async function GET() {
  const data = {
    sfi: 145,
    kp: 2,
    muf: 22.5,
  };

  return new Response(JSON.stringify(data), {
    headers: {
      "Content-Type": "application/json",
    },
  });
}
import https from "https";

const key = process.env.DEEPSEEK_API_KEY;

console.log("Key loaded:", !!key);

const data = JSON.stringify({
  model: "deepseek-chat",
  messages: [{ role: "user", content: "ping" }]
});

const options = {
  hostname: "api.deepseek.com",
  port: 443,
  path: "/v1/chat/completions",
  method: "POST",
  headers: {
    "Authorization": `Bearer ${key}`,
    "Content-Type": "application/json",
    "Content-Length": data.length
  }
};

const req = https.request(options, (res) => {
  console.log("Status:", res.statusCode);

  let body = "";
  res.on("data", chunk => body += chunk);
  res.on("end", () => {
    console.log("Body:", body);
  });
});

req.on("error", (e) => {
  console.error("Error:", e);
});

req.write(data);
req.end();
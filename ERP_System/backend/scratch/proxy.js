import http from "http";

const PORT = 5002;
const TARGET_BASE = "http://127.0.0.1:5000";

const server = http.createServer(async (req, res) => {
  // Allow CORS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "*");
  res.setHeader("Access-Control-Allow-Credentials", "true");

  if (req.method === "OPTIONS") {
    res.writeHead(200);
    res.end();
    return;
  }

  const targetUrl = `${TARGET_BASE}${req.url}`;
  
  // Read request body
  let bodyBuffers = [];
  req.on("data", (chunk) => {
    bodyBuffers.push(chunk);
  });

  req.on("end", async () => {
    const requestBody = Buffer.concat(bodyBuffers).toString();
    
    if (req.url.includes("/orders")) {
      console.log("\n==========================================");
      console.log(`Intercepted POS Order creation: ${req.method} ${req.url}`);
      console.log("Headers:", JSON.stringify(req.headers, null, 2));
      console.log("Request Body:", requestBody);
      console.log("==========================================\n");
    }

    try {
      const forwardHeaders = {};
      for (const key of Object.keys(req.headers)) {
        if (key !== "host" && key !== "content-length") {
          forwardHeaders[key] = req.headers[key];
        }
      }

      const fetchOptions = {
        method: req.method,
        headers: forwardHeaders,
      };

      if (req.method !== "GET" && req.method !== "HEAD" && requestBody) {
        fetchOptions.body = requestBody;
      }

      const targetRes = await fetch(targetUrl, fetchOptions);
      const targetResBody = await targetRes.text();

      if (req.url.includes("/orders")) {
        console.log("==========================================");
        console.log(`Target response: ${targetRes.status}`);
        console.log("Response Body:", targetResBody);
        console.log("==========================================\n");
      }

      res.writeHead(targetRes.status, {
        "Content-Type": targetRes.headers.get("content-type") || "application/json"
      });
      res.end(targetResBody);

    } catch (err) {
      console.error("Proxy error:", err.message);
      res.writeHead(500);
      res.end(JSON.stringify({ error: err.message }));
    }
  });
});

server.listen(PORT, () => {
  console.log(`Proxy listening on http://localhost:${PORT} -> forwarding to ${TARGET_BASE}`);
});

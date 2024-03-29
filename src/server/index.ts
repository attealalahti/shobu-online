import { createServer } from "http";
import { parse } from "url";
import next from "next";
import ws from "./ws";

const dev = process.env.NODE_ENV !== "production";
const hostname = process.env.RAILWAY_STATIC_URL || "localhost";
const port = parseInt(process.env.PORT || "3000", 10);
const protocol = process.env.NODE_ENV === "production" ? "https" : "http";
const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const server = createServer(async (req, res) => {
    try {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const parsedUrl = parse(req.url!, true);
      await handle(req, res, parsedUrl);
    } catch (err) {
      console.error("Error occurred handling", req.url, err);
      res.statusCode = 500;
      res.end("internal server error");
    }
  }).listen(port, () => {
    console.log(`> Ready on ${protocol}://${hostname}:${port}`);
  });
  ws(server);
});

import { createServer } from "https";
import { parse } from "url";
import next from "next";
import fs from "fs";

const port = 3000;
const dev = process.env.NODE_ENV !== "production";
const app = next({ dev });
const handle = app.getRequestHandler();

const httpsOptions = {
  key: fs.readFileSync("./.cert/localhost-key.pem"),
  cert: fs.readFileSync("./.cert/localhost.pem"),
};

app.prepare().then(() => {
  createServer(httpsOptions, (req, res) => {
    const parsedUrl = parse(req.url!, true);
    handle(req, res, parsedUrl);
  }).listen(port, () => {
    console.log(`✅ Server ready on https://localhost:${port}`);
  });
});

import { createServer } from "../server/index.js";

const app = createServer();

export default function handler(req, res) {
  return app(req, res);
}

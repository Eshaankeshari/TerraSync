import dotenv from "dotenv";
dotenv.config();
import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import { connect } from "mongoose";
import path from "path";
import routes from "./routes/index.js";

const app = express();
app.use(helmet());
app.use(cors({ origin: (_origin, cb) => cb(null, true), credentials: true }));
app.use(express.json({ limit: "10mb" }));
app.use(morgan("dev"));

app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));
app.get("/health", (_req, res) => res.json({ status: "ok" }));
app.use("/api", routes);

const PORT = process.env.PORT || 4000;

async function start() {
  try {
    const mongoUri = process.env.MONGODB_URI!;
    await connect(mongoUri);
    app.listen(PORT, () => {
      console.log(`Server listening on :${PORT}`);
    });
  } catch (err) {
    console.error("Failed to start server", err);
    process.exit(1);
  }
}

start();
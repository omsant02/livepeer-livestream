import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { Livepeer } from "livepeer";

dotenv.config();

const app = express();
app.use(cors({ origin: "http://localhost:5173" }));
app.use(express.json());

const livepeer = new Livepeer({
  apiKey: process.env.LIVEPEER_API_KEY,
});

// Create a new stream
app.post("/api/stream/create", async (req, res) => {
  try {
    const { name } = req.body;

    const response = await livepeer.stream.create({
      name: name || "test_stream",
    });

    console.log("Stream created:", response.stream);

    res.json({
      streamId: response.stream.id,
      streamKey: response.stream.streamKey,
      playbackId: response.stream.playbackId,
    });

  } catch (error) {
    console.error("Error creating stream:", error);
    res.status(500).json({ error: "Failed to create stream" });
  }
});

// Get playback info for a stream
app.get("/api/stream/:playbackId", async (req, res) => {
  try {
    const { playbackId } = req.params;
    const playbackInfo = await livepeer.playback.get(playbackId);
    res.json({ playbackInfo: playbackInfo.playbackInfo });
  } catch (error) {
    console.error("Error fetching stream:", error);
    res.status(500).json({ error: "Failed to fetch stream" });
  }
});

app.listen(3001, () => {
  console.log("Backend running on http://localhost:3001");
});
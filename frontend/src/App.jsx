import { useState } from "react";
import * as Broadcast from "@livepeer/react/broadcast";
import * as Player from "@livepeer/react/player";
import { getIngest, getSrc } from "@livepeer/react/external";

function App() {
  const [tab, setTab] = useState("create"); // create | broadcast | watch
  const [streamName, setStreamName] = useState("");
  const [streamData, setStreamData] = useState(null); // streamKey + playbackId
  const [watchId, setWatchId] = useState("");
  const [src, setSrc] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Step 1: Create stream on backend
  const handleCreateStream = async () => {
    if (!streamName) return;
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("http://localhost:3001/api/stream/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: streamName }),
      });

      const data = await res.json();
      console.log("Stream created:", data);
      setStreamData(data);
      setTab("broadcast"); // move to broadcast tab

    } catch (err) {
      setError("Failed to create stream");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Fetch stream for viewer
  const handleWatch = async () => {
    if (!watchId) return;
    setLoading(true);
    setError(null);
    setSrc(null);

    try {
      const res = await fetch(`http://localhost:3001/api/stream/${watchId}`);
      const data = await res.json();
      console.log("Playback info:", data);
      const videoSrc = getSrc(data.playbackInfo);
      setSrc(videoSrc);
    } catch (err) {
      setError("Failed to load stream");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: "40px", maxWidth: "800px", margin: "0 auto" }}>
      <h1>Livepeer Livestream</h1>

      {/* Tabs */}
      <div style={{ display: "flex", gap: "12px", marginBottom: "32px" }}>
        {["create", "broadcast", "watch"].map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            style={{
              padding: "8px 20px",
              borderRadius: "6px",
              border: "none",
              cursor: "pointer",
              background: tab === t ? "#2563eb" : "#e5e7eb",
              color: tab === t ? "white" : "black",
              fontWeight: tab === t ? "bold" : "normal",
              fontSize: "14px",
              textTransform: "capitalize",
            }}
          >
            {t === "create" ? "1. Create Stream" :
             t === "broadcast" ? "2. Go Live" :
             "3. Watch"}
          </button>
        ))}
      </div>

      {error && (
        <p style={{ color: "red", marginBottom: "16px" }}>{error}</p>
      )}

      {/* TAB 1: Create Stream */}
      {tab === "create" && (
        <div>
          <h2>Create a Stream</h2>
          <p style={{ color: "#666", marginBottom: "16px" }}>
            First create a stream to get your stream key and playback ID.
          </p>

          <input
            type="text"
            placeholder="Stream name (e.g. Sonu Nigam Live)"
            value={streamName}
            onChange={(e) => setStreamName(e.target.value)}
            style={{
              padding: "10px",
              width: "100%",
              marginBottom: "12px",
              borderRadius: "6px",
              border: "1px solid #ccc",
              fontSize: "16px",
            }}
          />

          <button
            onClick={handleCreateStream}
            disabled={loading || !streamName}
            style={{
              padding: "10px 24px",
              background: "#2563eb",
              color: "white",
              border: "none",
              borderRadius: "6px",
              cursor: "pointer",
              fontSize: "16px",
              opacity: loading || !streamName ? 0.6 : 1,
            }}
          >
            {loading ? "Creating..." : "Create Stream"}
          </button>

          {/* Show stream details if created */}
          {streamData && (
            <div style={{
              marginTop: "24px",
              padding: "16px",
              background: "#f0fdf4",
              border: "1px solid #86efac",
              borderRadius: "8px",
            }}>
              <p style={{ color: "#16a34a", fontWeight: "bold" }}>
                ✅ Stream Created!
              </p>
              <div style={{ marginTop: "12px", fontSize: "14px" }}>
                <p><strong>Stream Key:</strong></p>
                <code style={{
                  background: "#e5e7eb",
                  padding: "4px 8px",
                  borderRadius: "4px",
                  display: "block",
                  marginTop: "4px",
                  wordBreak: "break-all",
                }}>
                  {streamData.streamKey}
                </code>

                <p style={{ marginTop: "12px" }}><strong>Playback ID:</strong></p>
                <code style={{
                  background: "#e5e7eb",
                  padding: "4px 8px",
                  borderRadius: "4px",
                  display: "block",
                  marginTop: "4px",
                }}>
                  {streamData.playbackId}
                </code>

                <p style={{
                  marginTop: "12px",
                  color: "#666",
                  fontSize: "13px",
                }}>
                  Share the Playback ID with viewers so they can watch.
                  Click "2. Go Live" to start broadcasting.
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: Broadcast */}
      {tab === "broadcast" && (
        <div>
          <h2>Go Live 🔴</h2>

          {!streamData ? (
            <div style={{
              padding: "16px",
              background: "#fef9c3",
              border: "1px solid #fde047",
              borderRadius: "8px",
            }}>
              <p>⚠️ You need to create a stream first.</p>
              <button
                onClick={() => setTab("create")}
                style={{
                  marginTop: "8px",
                  padding: "6px 16px",
                  background: "#2563eb",
                  color: "white",
                  border: "none",
                  borderRadius: "6px",
                  cursor: "pointer",
                }}
              >
                Go to Create Stream
              </button>
            </div>
          ) : (
            <div>
              <div style={{
                padding: "12px",
                background: "#f0fdf4",
                border: "1px solid #86efac",
                borderRadius: "8px",
                marginBottom: "16px",
                fontSize: "14px",
              }}>
                <p><strong>Stream Key:</strong> <code>{streamData.streamKey}</code></p>
                <p style={{ marginTop: "4px" }}>
                  <strong>Playback ID:</strong> <code>{streamData.playbackId}</code>
                </p>
              </div>

              {/* Livepeer Broadcast Component */}
              <Broadcast.Root
                ingestUrl={getIngest(streamData.streamKey)}
              >
                <Broadcast.Container style={{
                  width: "100%",
                  aspectRatio: "16/9",
                  background: "black",
                  borderRadius: "8px",
                  position: "relative",
                  overflow: "hidden",
                }}>
                  <Broadcast.Video
                    title="Your livestream"
                    style={{ width: "100%", height: "100%", objectFit: "contain" }}
                  />

                  {/* LIVE / LOADING / IDLE indicator */}
                  <div style={{
                    position: "absolute",
                    top: "12px",
                    left: "12px",
                    background: "rgba(0,0,0,0.6)",
                    borderRadius: "999px",
                    padding: "4px 10px",
                  }}>
                    <Broadcast.StatusIndicator
                      matcher="live"
                      style={{ display: "flex", alignItems: "center", gap: "6px" }}
                    >
                      <div style={{
                        width: "8px", height: "8px",
                        borderRadius: "50%",
                        background: "#ef4444",
                        animation: "pulse 1.5s infinite",
                      }} />
                      <span style={{ color: "white", fontSize: "12px" }}>LIVE</span>
                    </Broadcast.StatusIndicator>

                    <Broadcast.StatusIndicator
                      matcher="pending"
                      style={{ display: "flex", alignItems: "center", gap: "6px" }}
                    >
                      <div style={{
                        width: "8px", height: "8px",
                        borderRadius: "50%",
                        background: "white",
                      }} />
                      <span style={{ color: "white", fontSize: "12px" }}>CONNECTING...</span>
                    </Broadcast.StatusIndicator>

                    <Broadcast.StatusIndicator
                      matcher="idle"
                      style={{ display: "flex", alignItems: "center", gap: "6px" }}
                    >
                      <div style={{
                        width: "8px", height: "8px",
                        borderRadius: "50%",
                        background: "#9ca3af",
                      }} />
                      <span style={{ color: "white", fontSize: "12px" }}>IDLE</span>
                    </Broadcast.StatusIndicator>
                  </div>

                  {/* Start/Stop button */}
                  <Broadcast.Controls style={{
                    position: "absolute",
                    bottom: "16px",
                    left: "50%",
                    transform: "translateX(-50%)",
                  }}>
                    <Broadcast.EnabledTrigger style={{
                      padding: "10px 28px",
                      borderRadius: "999px",
                      border: "none",
                      cursor: "pointer",
                      background: "#ef4444",
                      color: "white",
                      fontSize: "16px",
                      fontWeight: "bold",
                    }}>
                      <Broadcast.EnabledIndicator matcher={false}>
                        🔴 Start Streaming
                      </Broadcast.EnabledIndicator>
                      <Broadcast.EnabledIndicator>
                        ⏹ Stop Streaming
                      </Broadcast.EnabledIndicator>
                    </Broadcast.EnabledTrigger>
                  </Broadcast.Controls>

                </Broadcast.Container>
              </Broadcast.Root>

              <p style={{ marginTop: "12px", color: "#666", fontSize: "14px" }}>
                Share Playback ID <strong>{streamData.playbackId}</strong> with viewers
              </p>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: Watch */}
      {tab === "watch" && (
        <div>
          <h2>Watch a Stream</h2>
          <p style={{ color: "#666", marginBottom: "16px" }}>
            Enter a Playback ID to watch a live stream.
          </p>

          <div style={{ display: "flex", gap: "8px", marginBottom: "16px" }}>
            <input
              type="text"
              placeholder="Enter Playback ID"
              value={watchId}
              onChange={(e) => setWatchId(e.target.value)}
              style={{
                padding: "10px",
                flex: 1,
                borderRadius: "6px",
                border: "1px solid #ccc",
                fontSize: "16px",
              }}
            />
            <button
              onClick={handleWatch}
              disabled={loading || !watchId}
              style={{
                padding: "10px 20px",
                background: "#2563eb",
                color: "white",
                border: "none",
                borderRadius: "6px",
                cursor: "pointer",
                fontSize: "16px",
                opacity: loading || !watchId ? 0.6 : 1,
              }}
            >
              {loading ? "Loading..." : "Watch"}
            </button>
          </div>

          {src && (
            <Player.Root src={src}>
              <Player.Container style={{
                width: "100%",
                aspectRatio: "16/9",
                background: "black",
                borderRadius: "8px",
                position: "relative",
                overflow: "hidden",
              }}>
                <Player.Video
                  title="Live stream"
                  style={{ width: "100%", height: "100%", objectFit: "contain" }}
                />

                <Player.Controls style={{
                  position: "absolute",
                  bottom: 0, left: 0, right: 0,
                  padding: "8px 12px",
                  background: "linear-gradient(transparent, rgba(0,0,0,0.8))",
                  display: "flex",
                  flexDirection: "column",
                  gap: "6px",
                }}>
                  <div style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    color: "white",
                  }}>
                    <Player.PlayPauseTrigger style={{
                      background: "none", border: "none",
                      color: "white", cursor: "pointer", fontSize: "20px",
                    }}>
                      <Player.PlayingIndicator asChild matcher={false}>
                        <span>▶</span>
                      </Player.PlayingIndicator>
                      <Player.PlayingIndicator asChild>
                        <span>⏸</span>
                      </Player.PlayingIndicator>
                    </Player.PlayPauseTrigger>

                    {/* LIVE badge */}
                    <div style={{
                      background: "#ef4444",
                      color: "white",
                      fontSize: "11px",
                      fontWeight: "bold",
                      padding: "2px 8px",
                      borderRadius: "4px",
                    }}>
                      LIVE
                    </div>

                    <div style={{ flex: 1 }} />

                    <Player.FullscreenTrigger style={{
                      background: "none", border: "none",
                      color: "white", cursor: "pointer", fontSize: "18px",
                    }}>
                      <Player.FullscreenIndicator asChild matcher={false}>
                        <span>⛶</span>
                      </Player.FullscreenIndicator>
                      <Player.FullscreenIndicator asChild>
                        <span>✕</span>
                      </Player.FullscreenIndicator>
                    </Player.FullscreenTrigger>
                  </div>
                </Player.Controls>
              </Player.Container>
            </Player.Root>
          )}
        </div>
      )}

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }
      `}</style>
    </div>
  );
}

export default App;
import { useState } from "react";
import * as Broadcast from "@livepeer/react/broadcast";
import * as Player from "@livepeer/react/player";
import { getIngest, getSrc } from "@livepeer/react/external";

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Mono:wght@400;500&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  body {
    background: #080808;
    color: #f0f0f0;
    font-family: 'Syne', sans-serif;
    min-height: 100vh;
  }

  .app {
    max-width: 780px;
    margin: 0 auto;
    padding: 48px 24px;
  }

  .header {
    margin-bottom: 48px;
  }

  .header h1 {
    font-size: clamp(2rem, 5vw, 3.2rem);
    font-weight: 800;
    letter-spacing: -0.03em;
    line-height: 1;
    color: #fff;
  }

  .header h1 span {
    color: #ff3b3b;
  }

  .header p {
    margin-top: 10px;
    color: #666;
    font-size: 0.95rem;
    font-family: 'DM Mono', monospace;
    font-weight: 400;
  }

  .tabs {
    display: flex;
    gap: 0;
    margin-bottom: 40px;
    border: 1px solid #1e1e1e;
    border-radius: 10px;
    overflow: hidden;
    background: #0f0f0f;
  }

  .tab {
    flex: 1;
    padding: 12px 16px;
    background: transparent;
    border: none;
    color: #555;
    cursor: pointer;
    font-family: 'DM Mono', monospace;
    font-size: 0.78rem;
    font-weight: 500;
    letter-spacing: 0.05em;
    text-transform: uppercase;
    transition: all 0.2s;
    border-right: 1px solid #1e1e1e;
    position: relative;
  }

  .tab:last-child { border-right: none; }

  .tab.active {
    background: #fff;
    color: #000;
    font-weight: 700;
  }

  .tab:not(.active):hover {
    color: #aaa;
    background: #141414;
  }

  .step-number {
    display: inline-block;
    width: 18px;
    height: 18px;
    border-radius: 50%;
    font-size: 0.65rem;
    line-height: 18px;
    text-align: center;
    margin-right: 6px;
    background: currentColor;
    color: transparent;
    position: relative;
  }

  .tab.active .step-number {
    background: #000;
    color: #fff;
  }

  .tab:not(.active) .step-number {
    background: #333;
    color: #666;
  }

  /* ── Section titles ── */
  .section-title {
    font-size: 1.4rem;
    font-weight: 700;
    letter-spacing: -0.02em;
    margin-bottom: 6px;
    color: #fff;
  }

  .section-sub {
    color: #555;
    font-size: 0.85rem;
    font-family: 'DM Mono', monospace;
    margin-bottom: 28px;
  }

  /* ── Input ── */
  .input {
    width: 100%;
    padding: 14px 16px;
    background: #0f0f0f;
    border: 1px solid #1e1e1e;
    border-radius: 8px;
    color: #fff;
    font-family: 'DM Mono', monospace;
    font-size: 0.9rem;
    outline: none;
    transition: border-color 0.2s;
    margin-bottom: 14px;
  }

  .input:focus { border-color: #333; }
  .input::placeholder { color: #333; }

  /* ── Button ── */
  .btn {
    padding: 13px 28px;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    font-family: 'Syne', sans-serif;
    font-weight: 700;
    font-size: 0.9rem;
    letter-spacing: 0.02em;
    transition: all 0.15s;
  }

  .btn-primary {
    background: #fff;
    color: #000;
  }

  .btn-primary:hover:not(:disabled) {
    background: #e0e0e0;
    transform: translateY(-1px);
  }

  .btn-primary:disabled {
    opacity: 0.3;
    cursor: not-allowed;
  }

  .btn-danger {
    background: #ff3b3b;
    color: #fff;
  }

  .btn-danger:hover { background: #e03333; }

  /* ── Stream info card ── */
  .stream-card {
    margin-top: 24px;
    padding: 20px;
    background: #0f0f0f;
    border: 1px solid #1e1e1e;
    border-radius: 10px;
  }

  .stream-card-header {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 18px;
  }

  .dot-green {
    width: 8px; height: 8px;
    border-radius: 50%;
    background: #22c55e;
    box-shadow: 0 0 8px #22c55e;
  }

  .stream-card-header span {
    font-size: 0.8rem;
    font-family: 'DM Mono', monospace;
    color: #22c55e;
    letter-spacing: 0.08em;
    text-transform: uppercase;
  }

  .field-label {
    font-size: 0.7rem;
    font-family: 'DM Mono', monospace;
    color: #444;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    margin-bottom: 6px;
  }

  .field-value {
    font-family: 'DM Mono', monospace;
    font-size: 0.85rem;
    color: #fff;
    background: #161616;
    padding: 10px 14px;
    border-radius: 6px;
    border: 1px solid #222;
    margin-bottom: 14px;
    word-break: break-all;
    letter-spacing: 0.03em;
  }

  .field-value:last-child { margin-bottom: 0; }

  .hint {
    margin-top: 16px;
    font-size: 0.78rem;
    font-family: 'DM Mono', monospace;
    color: #444;
    line-height: 1.5;
  }

  /* ── Warning card ── */
  .warn-card {
    padding: 16px 20px;
    background: #0f0f0f;
    border: 1px solid #2a2000;
    border-radius: 10px;
    margin-bottom: 20px;
  }

  .warn-card p { color: #888; font-size: 0.85rem; margin-bottom: 10px; }

  /* ── Video container ── */
  .video-wrap {
    width: 100%;
    aspect-ratio: 16/9;
    background: #050505;
    border-radius: 10px;
    overflow: hidden;
    position: relative;
    border: 1px solid #1a1a1a;
  }

  /* ── Status badge ── */
  .status-badge {
    position: absolute;
    top: 12px;
    left: 12px;
    display: flex;
    align-items: center;
    gap: 6px;
    background: rgba(0,0,0,0.75);
    backdrop-filter: blur(8px);
    border: 1px solid rgba(255,255,255,0.08);
    border-radius: 999px;
    padding: 5px 12px;
    z-index: 10;
  }

  .status-dot {
    width: 7px;
    height: 7px;
    border-radius: 50%;
    flex-shrink: 0;
  }

  .status-dot.red { background: #ff3b3b; animation: blink 1.4s infinite; box-shadow: 0 0 4px rgba(255,59,59,0.3); }
  .status-dot.gray { background: #666; }
  .status-dot.white { background: #aaa; animation: blink 1s infinite; }

  .status-text {
    font-family: 'DM Mono', monospace;
    font-size: 0.7rem;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: #ccc;
    white-space: nowrap;
  }

  @keyframes blink {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.2; }
  }

  /* ── Broadcast controls ── */
  .broadcast-controls {
    position: absolute;
    bottom: 20px;
    left: 50%;
    transform: translateX(-50%);
    z-index: 10;
  }

  .go-live-btn {
    padding: 11px 32px;
    border-radius: 999px;
    border: none;
    cursor: pointer;
    font-family: 'Syne', sans-serif;
    font-weight: 700;
    font-size: 0.88rem;
    letter-spacing: 0.04em;
    transition: all 0.2s;
    display: flex;
    align-items: center;
    gap: 8px;
    background: #ff3b3b;
    color: #fff;
    box-shadow: 0 4px 20px rgba(255,59,59,0.35);
  }

  .go-live-btn:hover { transform: scale(1.03); box-shadow: 0 6px 24px rgba(255,59,59,0.45); }

  .stop-btn {
    background: rgba(20,20,20,0.9);
    color: #fff;
    border: 1px solid rgba(255,255,255,0.12);
    box-shadow: none;
  }

  .stop-btn:hover { background: rgba(40,40,40,0.9); transform: none; }

  /* ── Share row ── */
  .share-row {
    margin-top: 14px;
    padding: 12px 16px;
    background: #0f0f0f;
    border: 1px solid #1a1a1a;
    border-radius: 8px;
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .share-row span {
    font-family: 'DM Mono', monospace;
    font-size: 0.78rem;
    color: #555;
  }

  .share-row code {
    font-family: 'DM Mono', monospace;
    font-size: 0.82rem;
    color: #fff;
    background: #161616;
    padding: 3px 8px;
    border-radius: 4px;
    border: 1px solid #222;
  }

  /* ── Watch controls ── */
  .watch-controls {
    position: absolute;
    bottom: 0; left: 0; right: 0;
    padding: 10px 14px;
    background: linear-gradient(transparent, rgba(0,0,0,0.85));
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .ctrl-btn {
    background: none;
    border: none;
    color: #fff;
    cursor: pointer;
    font-size: 18px;
    padding: 2px;
    opacity: 0.85;
    transition: opacity 0.15s;
  }

  .ctrl-btn:hover { opacity: 1; }

  .live-badge {
    background: #ff3b3b;
    color: #fff;
    font-family: 'DM Mono', monospace;
    font-size: 0.62rem;
    font-weight: 500;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    padding: 3px 8px;
    border-radius: 4px;
  }

  /* ── Watch input row ── */
  .watch-row {
    display: flex;
    gap: 10px;
    margin-bottom: 20px;
  }

  .watch-row .input { margin-bottom: 0; }

  /* ── Error ── */
  .error {
    padding: 12px 16px;
    background: #1a0a0a;
    border: 1px solid #3a1010;
    border-radius: 8px;
    color: #ff6b6b;
    font-family: 'DM Mono', monospace;
    font-size: 0.82rem;
    margin-bottom: 20px;
  }

  /* ── Divider ── */
  .divider {
    height: 1px;
    background: #151515;
    margin: 32px 0;
  }

  /* Force hidden status indicators to not take space */
  [data-visible="false"] {
    display: none !important;
  }

  .broadcast-status {
    position: absolute;
    top: 0;
    left: 0;
  }

  .broadcast-status [data-visible="false"] {
    visibility: hidden;
    position: absolute;
    pointer-events: none;
  }
`;

export default function App() {
  const [tab, setTab] = useState("create");
  const [streamName, setStreamName] = useState("");
  const [streamData, setStreamData] = useState(null);
  const [watchId, setWatchId] = useState("");
  const [src, setSrc] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

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
      setStreamData(data);
      setTab("broadcast");
    } catch {
      setError("Failed to create stream. Is backend running?");
    } finally {
      setLoading(false);
    }
  };

  const handleWatch = async () => {
    if (!watchId) return;
    setLoading(true);
    setError(null);
    setSrc(null);
    try {
      const res = await fetch(`http://localhost:3001/api/stream/${watchId}`);
      const data = await res.json();
      setSrc(getSrc(data.playbackInfo));
    } catch {
      setError("Failed to load stream. Check the playback ID.");
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: "create", label: "Create Stream" },
    { id: "broadcast", label: "Go Live" },
    { id: "watch", label: "Watch" },
  ];

  return (
    <>
      <style>{styles}</style>
      <div className="app">

        {/* Header */}
        <div className="header">
          <h1>Live<span>peer</span> Studio</h1>
          <p>create → broadcast → watch</p>
        </div>

        {/* Tabs */}
        <div className="tabs">
          {tabs.map((t, i) => (
            <button
              key={t.id}
              className={`tab ${tab === t.id ? "active" : ""}`}
              onClick={() => setTab(t.id)}
            >
              <span className="step-number">{i + 1}</span>
              {t.label}
            </button>
          ))}
        </div>

        {error && <div className="error">⚠ {error}</div>}

        {/* ── TAB 1: Create ── */}
        {tab === "create" && (
          <div>
            <p className="section-title">Create a stream</p>
            <p className="section-sub">
              generates a stream key + playback ID
            </p>

            <input
              className="input"
              type="text"
              placeholder="stream name, e.g. sonu-nigam-live"
              value={streamName}
              onChange={(e) => setStreamName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleCreateStream()}
            />

            <button
              className="btn btn-primary"
              onClick={handleCreateStream}
              disabled={loading || !streamName}
            >
              {loading ? "Creating..." : "Create Stream →"}
            </button>

            {streamData && (
              <div className="stream-card">
                <div className="stream-card-header">
                  <div className="dot-green" />
                  <span>Stream Created</span>
                </div>

                <p className="field-label">Stream Key</p>
                <div className="field-value">{streamData.streamKey}</div>

                <p className="field-label">Playback ID</p>
                <div className="field-value">{streamData.playbackId}</div>

                <p className="hint">
                  → Use stream key to broadcast<br />
                  → Share playback ID with viewers
                </p>
              </div>
            )}
          </div>
        )}

        {/* ── TAB 2: Broadcast ── */}
        {tab === "broadcast" && (
          <div>
            <p className="section-title">Go Live</p>
            <p className="section-sub">
              webcam → webrtc whip → livepeer sfu
            </p>

            {!streamData ? (
              <div className="warn-card">
                <p>No stream created yet. Create one first.</p>
                <button className="btn btn-primary" onClick={() => setTab("create")}>
                  Create Stream →
                </button>
              </div>
            ) : (
              <>
                <div className="stream-card" style={{ marginBottom: 20, marginTop: 0 }}>
                  <p className="field-label">Stream Key</p>
                  <div className="field-value">{streamData.streamKey}</div>
                  <p className="field-label">Playback ID</p>
                  <div className="field-value" style={{ marginBottom: 0 }}>
                    {streamData.playbackId}
                  </div>
                </div>

                <Broadcast.Root ingestUrl={getIngest(streamData.streamKey)}>
                  <div style={{ position: "relative", width: "100%", aspectRatio: "16/9" }}>
                    <Broadcast.Container style={{ width: "100%", height: "100%", background: "#050505", borderRadius: 10, overflow: "visible", position: "absolute", inset: 0, border: "1px solid #1a1a1a" }}>
                      <Broadcast.Video
                        title="Livestream"
                        style={{ width: "100%", height: "100%", objectFit: "cover" }}
                      />

                      {/* Status badge - top left */}
                      <div style={{ position: "absolute", top: 12, left: 12, zIndex: 20, background: "rgba(0,0,0,0.75)", backdropFilter: "blur(8px)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 999, padding: "5px 12px", display: "flex", alignItems: "center", gap: 6 }}>
                        <Broadcast.StatusIndicator matcher="live">
                          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                            <div className="status-dot red" />
                            <span className="status-text">Live</span>
                          </div>
                        </Broadcast.StatusIndicator>
                        <Broadcast.StatusIndicator matcher="pending">
                          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                            <div className="status-dot white" />
                            <span className="status-text">Connecting</span>
                          </div>
                        </Broadcast.StatusIndicator>
                        <Broadcast.StatusIndicator matcher="idle">
                          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                            <div className="status-dot gray" />
                            <span className="status-text">Idle</span>
                          </div>
                        </Broadcast.StatusIndicator>
                      </div>

                      {/* Start/Stop - bottom center inside video */}
                      <div style={{ position: "absolute", bottom: 20, left: "50%", transform: "translateX(-50%)", zIndex: 20 }}>
                        <Broadcast.Controls>
                          <Broadcast.EnabledTrigger className="go-live-btn">
                            <Broadcast.EnabledIndicator matcher={false}>
                              <span style={{ fontSize: 10 }}>●</span> Start Streaming
                            </Broadcast.EnabledIndicator>
                            <Broadcast.EnabledIndicator>
                              <span style={{ fontSize: 12 }}>■</span> Stop Streaming
                            </Broadcast.EnabledIndicator>
                          </Broadcast.EnabledTrigger>
                        </Broadcast.Controls>
                      </div>
                    </Broadcast.Container>
                  </div>
                </Broadcast.Root>

                <div className="share-row">
                  <span>Share with viewers →</span>
                  <code>{streamData.playbackId}</code>
                </div>
              </>
            )}
          </div>
        )}

        {/* ── TAB 3: Watch ── */}
        {tab === "watch" && (
          <div>
            <p className="section-title">Watch a stream</p>
            <p className="section-sub">
              enter playback ID — webrtc whep if available, hls fallback
            </p>

            <div className="watch-row">
              <input
                className="input"
                type="text"
                placeholder="playback ID"
                value={watchId}
                onChange={(e) => setWatchId(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleWatch()}
              />
              <button
                className="btn btn-primary"
                onClick={handleWatch}
                disabled={loading || !watchId}
                style={{ flexShrink: 0 }}
              >
                {loading ? "..." : "Watch"}
              </button>
            </div>

            {src && (
              <Player.Root src={src}>
                <Player.Container style={{ width: "100%", aspectRatio: "16/9", background: "#050505", borderRadius: 10, overflow: "hidden", position: "relative", border: "1px solid #1a1a1a" }}>
                  <Player.Video
                    title="Live stream"
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  />
                  <div className="watch-controls">
                    <Player.PlayPauseTrigger className="ctrl-btn">
                      <Player.PlayingIndicator asChild matcher={false}><span>▶</span></Player.PlayingIndicator>
                      <Player.PlayingIndicator asChild><span>⏸</span></Player.PlayingIndicator>
                    </Player.PlayPauseTrigger>
                    <div className="live-badge">● Live</div>
                    <div style={{ flex: 1 }} />
                    <Player.FullscreenTrigger className="ctrl-btn">
                      <Player.FullscreenIndicator asChild matcher={false}><span>⛶</span></Player.FullscreenIndicator>
                      <Player.FullscreenIndicator asChild><span>✕</span></Player.FullscreenIndicator>
                    </Player.FullscreenTrigger>
                  </div>
                </Player.Container>
              </Player.Root>
            )}
          </div>
        )}

      </div>
    </>
  );
}
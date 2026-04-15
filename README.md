# Livepeer Livestream

Full livestream system — create stream, broadcast via webcam, watch live. Built with Livepeer, React, Express.

---

## What It Does

```
Tab 1: Create Stream → backend creates stream → returns streamKey + playbackId
Tab 2: Go Live       → webcam → WebRTC WHIP → Livepeer SFU → you're live
Tab 3: Watch         → enter playbackId → player auto-picks WebRTC or HLS
```

---

## Architecture

```
BROADCASTER:
Browser (webcam) ──WebRTC WHIP (UDP/SRTP)──→ Livepeer SFU

LIVEPEER SFU:
Livepeer SFU ──WebRTC WHEP──→ Viewer A  (if UDP works)   ~0.5-1s latency
             ──HLS chunks──→  Viewer B  (if UDP blocked)  ~10-20s latency

Both delivery options always available from Livepeer.
The PLAYER decides which to use — not Livepeer, not the viewer.

GETTING STREAM URL (viewer side):
Frontend → GET /api/stream/:playbackId → Backend → Livepeer API
Frontend ← { playbackInfo: { sources: [HLS url, WebRTC url, thumbnail] } } ← Backend
Frontend ← actual video ← Livepeer CDN/SFU direct (never through your backend)
```

---

## The Player Decision (WebRTC vs HLS)

```
Livepeer Player receives playbackInfo with BOTH sources:
  → HLS url
  → WebRTC url

Player tries WebRTC WHEP first:
  ✅ Success → uses WebRTC
     - Sub-second latency
     - Single quality stream
     - No quality selector (nothing to select)
     - No seek bar (real-time, no storage)

  ❌ Fails → auto falls back to HLS (silently, viewer doesn't notice)
     - 10-20 second latency
     - Multiple quality renditions
     - Quality selector appears
     - ABR (auto quality switching based on internet speed)

WebRTC fails when:
  → Firewall blocks UDP
  → Browser doesn't support WebRTC
  → B-frames present in stream
  → Very unstable network

Viewer CANNOT manually choose between WebRTC and HLS with Livepeer Player.
It's fully automatic.
```

---

## Flow

### Step 1 — Create Stream

```
Frontend
  ↓ POST /api/stream/create { name: "My Stream" }
Backend
  ↓ livepeer.stream.create() ← API key used here, never in frontend
Livepeer
  ↓ returns { streamKey, playbackId }
Backend
  ↓ res.json({ streamKey, playbackId })
Frontend
```

```
streamKey  → broadcaster uses to push video IN
playbackId → viewers use to pull video OUT
Both assigned immediately, before anyone goes live
```

---

### Step 2 — Go Live

```
getIngest(streamKey)
  ↓ HEAD request → GeoDNS finds nearest Livepeer server
Browser asks camera/mic permission
  ↓
DTLS handshake (encryption keys over UDP)
  ↓
HTTP POST SDP offer → Livepeer WHIP endpoint  ← only HTTP call, not video
Livepeer responds SDP answer
  ↓
WebRTC established
  ↓
SRTP video/audio → Livepeer SFU continuously (UDP, real-time)
```

Backend NOT involved. Video never touches your server.

---

### Step 3 — Watch

```
Frontend
  ↓ GET /api/stream/:playbackId
Backend
  ↓ livepeer.playback.get(playbackId) ← API key used here
Livepeer returns:
  {
    type: "live",
    meta: {
      live: 1,       ← 1 = broadcasting now, 0 = offline
      source: [
        { hrn: "HLS (TS)",      url: "...index.m3u8"  },
        { hrn: "WebRTC (H264)", url: "...webrtc/id"   },
        { hrn: "Thumbnail",     url: "...latest.png"  }
      ]
    }
  }
Frontend
  ↓ getSrc(playbackInfo) → player-friendly format
Player tries WebRTC → success → ~1s latency, no controls
                    → fail   → HLS fallback → 10-20s, quality controls appear
Video streams directly: Livepeer CDN → Browser
```

---

## Viewer Controls — WebRTC vs HLS

```
                  WebRTC (primary)     HLS (fallback)
Latency           0.5 - 1 second       10 - 20 seconds
Quality selector  ❌                   ✅
Seek bar          ❌                   ❌ (disabled, it's live)
Speed control     ❌                   ❌
ABR               ❌                   ✅ (auto quality switch)
Storage           ❌ (real-time)       ✅ (temporary chunks)
Clipping          ❌                   ✅ (chunks exist to clip from)
```

---

## Key Concepts

### streamKey vs playbackId

```
streamKey  → push video INTO Livepeer (broadcaster only, keep private)
playbackId → pull video FROM Livepeer (share with viewers, public)
```

### live: 0 vs live: 1

```
live: 0 → stream exists but nobody broadcasting → show "Offline"
live: 1 → actively streaming right now          → show "LIVE" badge
```

### Why Not Direct Broadcaster → Viewers (P2P)

```
1. Bandwidth:  1000 viewers × 8Mbps = 8Gbps upload needed (home = 50Mbps max)
2. NAT:        home routers block incoming connections
3. Transcoding: who converts to multiple qualities for HLS fallback?
4. CDN:        global viewers need nearby servers

Livepeer SFU solution:
Broadcaster uploads ONCE → SFU fans out to all viewers
```

### GeoDNS

```
getIngest() makes HEAD request → redirected to nearest Livepeer server
Mumbai user → Mumbai server, not LA
Minimizes latency at both ingest and delivery
```

### ICE / STUN / TURN

```
STUN → finds your public IP behind NAT → enables direct connection
TURN → relay server when firewall blocks UDP → always works, slightly slower
ICE  → tries direct first, STUN second, TURN last
Livepeer provides all three automatically
```

---

## API Endpoints

| Method | Endpoint | What it does |
|---|---|---|
| POST | `/api/stream/create` | Creates stream on Livepeer |
| GET | `/api/stream/:playbackId` | Gets stream sources + live status |

---

## Project Structure

```
4-livestream/
├── backend/
│   ├── server.js     → Express (create stream, get playback info)
│   ├── .env          → LIVEPEER_API_KEY
│   └── package.json  → type: module
└── frontend/
    ├── src/App.jsx   → 3-tab UI
    └── package.json
```

---

## Setup

```bash
# Backend
cd backend && npm install
echo "LIVEPEER_API_KEY=your_key" > .env
node server.js        # localhost:3001

# Frontend
cd frontend && npm install
npm run dev           # localhost:5173
```

---

## Asset Playback vs Livestream

```
                  Asset (recorded)     Livestream
Storage           permanent            temporary chunks only
Latency           N/A                  0.5-1s WebRTC / 10-20s HLS
Seek bar          ✅                   ❌
Quality selector  ✅                   only if HLS fallback
Speed control     ✅                   ❌
Protocol          HLS only             WebRTC first, HLS fallback
Thumbnail         every 3s (static)    live updating (latest frame)
Clipping          ❌                   ✅
```
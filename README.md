# 🚀 Event Streaming Engine

A production-grade, event-driven notification system built with **NestJS**, **Apache Kafka**, **WebSockets**, **MongoDB**, and **Redis**. Supports real-time notifications via WebSocket, SMS (Fast2SMS), Email, and Webhook delivery channels.

---

## 🏛️ Architecture

```
Client / Any App
      ↓
Event Producer (Port 3010)
      ↓ Publishes to Kafka
Apache Kafka (Topic: notifications)
      ↓ Consumed by
Event Consumer (Port 3011)
      ↓ Routes to channels
┌──────────────────────────────────────────┐
│  WebSocket  │  SMS  │  Email  │  Webhook │
└──────────────────────────────────────────┘
      ↓ On failure
Dead Letter Queue → MongoDB (audit log)
```

---

## ✨ Features

- ✅ **Apache Kafka** — Async event streaming
- ✅ **WebSocket** — Real-time push notifications
- ✅ **SMS** — Fast2SMS integration
- ✅ **Email** — Mailhog (dev) / SMTP (prod)
- ✅ **Webhook** — HMAC-SHA256 signed delivery
- ✅ **Retry Logic** — 3 attempts with exponential backoff
- ✅ **Dead Letter Queue** — Failed events captured
- ✅ **Event History** — MongoDB audit trail
- ✅ **Kafka UI** — Visual dashboard at http://localhost:8090
- ✅ **AI Summarizer** — Notification summary via LLM
- ✅ **Docker** — One command startup

---

## 🚀 Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | NestJS + TypeScript |
| Message Queue | Apache Kafka |
| Real-time | WebSockets (Socket.io) |
| SMS | Fast2SMS API |
| Email | Nodemailer + Mailhog |
| Database | MongoDB + Mongoose |
| Cache | Redis |
| Containerization | Docker + Docker Compose |
| API Docs | Swagger |

---

## 📦 Prerequisites

- Node.js v20+
- Docker Desktop
- npm

---

## 🛠️ Installation

### 1. Clone the repository
```bash
git clone https://github.com/rupalitaneja-3009/event-streaming-engine.git
cd event-streaming-engine
```

### 2. Install dependencies
```bash
npm run install:all
```

### 3. Start all infrastructure
```bash
docker-compose up -d
```

### 4. Start all services
```bash
npm run start:all
```

---

## 🐳 Docker Services

| Service | Port | Purpose |
|---------|------|---------|
| Kafka | 9092 | Message broker |
| Zookeeper | 2181 | Kafka coordination |
| MongoDB | 27017 | Event storage |
| Redis | 6380 | Connection tracking |
| Mailhog | 8025 | Email dev UI |
| Kafka UI | 8090 | Kafka visual dashboard |

---

## 📡 API Endpoints

### Event Producer (Port 3010)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/events/publish` | Publish event to Kafka |
| POST | `/events/subscribe` | Subscribe user to topics |
| GET | `/events/history` | Get event history |
| GET | `/events/stats` | Get delivery stats |
| GET | `/notifications/summary` | AI-powered summary |

---

## 🔄 Event Payload Example

### Publish an Event
```bash
curl -X POST http://localhost:3010/events/publish \
-H "Content-Type: application/json" \
-d '{
  "topic": "order.placed",
  "userId": "user_123",
  "channels": ["websocket", "sms", "email"],
  "payload": {
    "orderId": "ORD_123",
    "amount": 999,
    "status": "confirmed"
  },
  "recipients": {
    "phone": "+919876543210",
    "email": "user@example.com"
  },
  "smsTemplate": "order_confirmed",
  "priority": "high"
}'
```

### Connect WebSocket (Postman Socket.IO)
```
URL:    http://localhost:3012
Event:  join   → { "userId": "user_123" }
Listen: notification
```

### Check Stats
```bash
curl http://localhost:3010/events/stats
```

### Check History
```bash
curl http://localhost:3010/events/history?userId=user_123
```

---

## 🔒 Retry & Dead Letter Queue Flow

```
Event Published
      ↓
Delivery Attempt 1 → fails
      ↓ wait 2s
Delivery Attempt 2 → fails
      ↓ wait 4s
Delivery Attempt 3 → fails
      ↓
Dead Letter Queue → saved to MongoDB with status FAILED
```

---

## 📊 Kafka UI Dashboard

```
http://localhost:8090
```

Shows:
- All topics (notifications, dead-letter-queue)
- Messages in real time
- Consumer group status and lag
- Partition assignments

---

## 📚 Swagger Docs

| Service | URL |
|---------|-----|
| Event Producer | http://localhost:3010/api/docs |
| Event Consumer | http://localhost:3011/api/docs |
| Notification Gateway | http://localhost:3012/api/docs |

---

## 📧 Email Testing (Mailhog)

All emails in dev mode are captured by Mailhog — no real emails sent:
```
http://localhost:8025
```

---

## 🤖 AI Notification Summary

```bash
curl "http://localhost:3010/notifications/summary?userId=user_123"
```

Returns an intelligent summary of all unread notifications using an LLM (Claude/OpenAI).

---

## 🗄️ Environment Variables

Copy `.env.example` to each service folder and fill in values:

```env
# ── Service Ports ──────────────────────────
EVENT_PRODUCER_PORT=3010
EVENT_CONSUMER_PORT=3011
NOTIFICATION_GATEWAY_PORT=3012

# ── Kafka ──────────────────────────────────
KAFKA_BROKERS=localhost:9092
KAFKA_CLIENT_ID=event-streaming-engine
KAFKA_GROUP_ID=event-consumer-group
KAFKA_TOPIC_NOTIFICATIONS=notifications
KAFKA_TOPIC_DLQ=dead-letter-queue

# ── MongoDB ────────────────────────────────
MONGODB_URI=mongodb://localhost:27017/event_streaming

# ── Redis ──────────────────────────────────
REDIS_HOST=localhost
REDIS_PORT=6380

# ── SMS (Fast2SMS) ─────────────────────────
FAST2SMS_API_KEY=your_key_here
SMS_PROVIDER=fast2sms
SMS_DEV_MODE=true

# ── Email ──────────────────────────────────
SMTP_HOST=localhost
SMTP_PORT=1025
EMAIL_DEV_MODE=true

# ── AI Summarizer ──────────────────────────
AI_PROVIDER=anthropic
ANTHROPIC_API_KEY=your_key_here
AI_DEV_MODE=true

# ── Webhook ────────────────────────────────
WEBHOOK_TIMEOUT_MS=5000
WEBHOOK_MAX_RETRIES=3
```

---

## 📁 Project Structure

```
event-streaming-engine/
│
├── event-producer/              ← Service 1 (Port 3010)
│   └── src/
│       ├── events/              ← publish, subscribe, history, stats
│       ├── kafka/               ← Kafka producer
│       └── notifications/       ← AI summarizer
│
├── event-consumer/              ← Service 2 (Port 3011)
│   └── src/
│       ├── consumer/            ← Kafka consumer + DLQ
│       ├── delivery/
│       │   ├── sms/             ← Fast2SMS + MSG91 providers
│       │   ├── email/           ← Nodemailer
│       │   └── webhook/         ← HMAC-signed HTTP delivery
│       └── router/              ← Routes events to channels
│
├── notification-gateway/        ← Service 3 (Port 3012)
│   └── src/
│       └── gateway/             ← Socket.io WebSocket server
│
├── docker-compose.yml           ← All infrastructure
├── package.json                 ← Monorepo scripts
└── README.md
```

---

## 🏃 Quick Commands

```bash
# Start everything
docker-compose up -d
npm run start:all

# Individual services
npm run start:producer
npm run start:consumer
npm run start:gateway

# Stop ports if busy
lsof -ti:3010 | xargs kill -9
lsof -ti:3011 | xargs kill -9
lsof -ti:3012 | xargs kill -9

# Stop Docker
docker-compose down
```

---

## 💼 Key Concepts Demonstrated

| Concept | Implementation |
|---------|---------------|
| Event-driven architecture | Kafka producer/consumer pattern |
| Async messaging | Kafka topics with consumer groups |
| Real-time communication | Socket.io WebSocket gateway |
| Fault tolerance | 3-attempt retry with exponential backoff |
| Dead letter queue | Failed events captured and stored |
| Multi-channel delivery | WebSocket + SMS + Email + Webhook |
| Webhook security | HMAC-SHA256 request signing |
| Observability | Kafka UI + Swagger + MongoDB audit logs |
| AI integration | LLM-powered notification summarizer |

---

## 👩‍💻 Author

**Rupali Taneja** — Backend Engineer
- LinkedIn: [rupali-taneja3009](https://www.linkedin.com/in/rupali-taneja3009/)
- GitHub: [rupalitaneja-3009](https://github.com/rupalitaneja-3009)

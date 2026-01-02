<div align="center">

# Minifi Frontend

Frontend application for Minifi - an enterprise-grade URL shortener platform.

🔗 **https://minifi-url.vercel.app**

</div>

## ✨ Features

| Category           | Features                                                                                                       |
| ------------------ | -------------------------------------------------------------------------------------------------------------- |
| **URL Shortening** | Guest shortener, custom aliases (PRO), password protection, scheduling, click limits, one-time links, QR codes |
| **Analytics**      | Click tracking, geo heat maps, device/browser/OS stats, referrer tracking, unique visitors, UTM params         |
| **Tags**           | Custom colors (background + text), organize links, filter by tags, bulk tagging                                |
| **Dashboard**      | Link management, stats cards, search & filters, pagination, archive/unarchive                                  |
| **Real-time Chat** | WebSocket messaging, typing indicators, read receipts, message edit/delete, infinite scroll                    |
| **Admin Panel**    | Platform stats, 30-day trends, user management, link moderation, security alerts, advisory system              |
| **Advisories**     | System announcements, 4 types (Info/Warning/Maintenance/Critical), scheduled publishing, expiration            |
| **Authentication** | Keycloak SSO, role-based access (User/Admin), silent token refresh, PKCE                                       |
| **Subscriptions**  | Stripe Checkout, FREE/PRO tiers, billing portal, usage limits, cancel at period end                            |
| **Profile**        | Avatar upload (MinIO), phone number, address, Keycloak account management                                      |
| **Settings**       | Email notification toggles, subscription management, plan comparison                                           |
| **Theming**        | Dark/light/auto mode, persistent preference, Mantine UI components                                             |
| **Security**       | Password-protected links, security scan warnings, malicious link detection display                             |

## 🛠️ Tech Stack

| Technology                | Purpose                                    |
| ------------------------- | ------------------------------------------ |
| **React 19**              | UI Framework with React Compiler           |
| **Vite 7**                | Build tool & dev server                    |
| **TypeScript**            | Type safety                                |
| **Redux Toolkit**         | Global state management                    |
| **RTK Query**             | API layer with caching, optimistic updates |
| **React Router 7**        | Routing with lazy loading, nested routes   |
| **Mantine 8**             | UI component library                       |
| **Socket.IO Client**      | Real-time WebSocket communication          |
| **Keycloak JS**           | OIDC authentication                        |
| **Recharts**              | Charts & visualizations                    |
| **react-simple-maps**     | Geographic heat maps                       |
| **React Hook Form + Zod** | Form handling & validation                 |
| **dayjs**                 | Date manipulation                          |
| **Biome**                 | Linting & formatting                       |
| **Vitest**                | Unit testing                               |

## 📋 Prerequisites

- Node.js 24 LTS+
- Running backend API (minifi-api on port 3001)
- Keycloak server (port 8080)

## 🚀 Getting Started

### 1. Install Dependencies

```bash
cd minifi
npm install
```

### 2. Environment Setup

```bash
cp .env.example .env
# Edit .env with your configuration
```

### 3. Run Development Server

```bash
npm run dev
```

The app will be available at `http://localhost:5173`.

## 📜 Available Scripts

| Script            | Description                                   |
| ----------------- | --------------------------------------------- |
| `npm run dev`     | Start Vite dev server (port 5173)             |
| `npm run build`   | Build production bundle                       |
| `npm run preview` | Preview production build locally              |
| `npm run lint`    | Run Biome linter                              |
| `npm run format`  | Format code with Biome                        |
| `npm run check`   | Lint + format with Biome (run before commits) |
| `npm test`        | Run Vitest tests                              |
| `npm test:watch`  | Run tests in watch mode                       |

## 👤 User Tiers

| Feature                       | GUEST  | FREE     | PRO       |
| ----------------------------- | ------ | -------- | --------- |
| Links                         | 5/day  | 25 total | Unlimited |
| Retention                     | 3 days | 90 days  | 2 years   |
| Custom aliases                | -      | -        | Yes       |
| Password protection           | -      | Yes      | Yes       |
| Tags                          | -      | Yes      | Yes       |
| QR codes                      | -      | Yes      | Yes       |
| Basic analytics               | -      | Yes      | Yes       |
| Full analytics (geo, devices) | -      | -        | Yes       |
| Click log history             | -      | -        | Yes       |
| Chat support                  | -      | -        | Yes       |
| Email notifications           | -      | Yes      | Yes       |

## 🔌 WebSocket Events

### Client to Server

| Event                      | Payload                          | Description         |
| -------------------------- | -------------------------------- | ------------------- |
| `join-room`                | `{ room }`                       | Join chat room      |
| `leave-room`               | `{ room }`                       | Leave chat room     |
| `chat:user-typing`         | `{ chatId, userId }`             | Started typing      |
| `chat:user-stopped-typing` | `{ chatId, userId }`             | Stopped typing      |
| `chat:messages-read`       | `{ chatId, messageIds, userId }` | Mark as read        |
| `get-presence`             | `{ userIds? }`                   | Query online status |

### Server to Client

| Event                      | Payload                        | Description            |
| -------------------------- | ------------------------------ | ---------------------- |
| `chat:new-message`         | `{ data: Message }`            | New message received   |
| `chat:message-updated`     | `{ data: Message }`            | Message edited         |
| `chat:message-deleted`     | `{ data: { messageId } }`      | Message deleted        |
| `chat:message-read`        | `{ data: { messageId } }`      | Single message read    |
| `chat:messages-read`       | `{ data: { messageIds } }`     | Bulk messages read     |
| `chat:user-typing`         | `{ data: { userId, chatId } }` | Someone is typing      |
| `chat:user-stopped-typing` | `{ data: { userId, chatId } }` | Stopped typing         |
| `chat:unread-increment`    | `{ data: Message }`            | Unread count update    |
| `chat:user-joined`         | `{ data: Chat }`               | New chat created       |
| `presence-status`          | `{ data: { isAdminOnline? } }` | Online status response |
| `presence:user-online`     | `{ data: { userId } }`         | User came online       |
| `presence:user-offline`    | `{ data: { userId } }`         | User went offline      |
| `presence:admin-online`    | `{ data: {} }`                 | Admin came online      |
| `presence:admin-offline`   | `{ data: {} }`                 | Admin went offline     |

## 📖 Development Guidelines

### Path Aliases

Always use `@/` path alias:

```typescript
// Correct
import { formatDate } from "@/utils/date.util";

// Wrong
import { formatDate } from "../../../utils/date.util";
```

### State Management

- **Global state**: Redux slices in `src/features/`
- **Server state**: RTK Query in `src/app/api/`
- **Local state**: React useState for component-specific state
- **No Context API**: Use Redux selectors instead

### API Integration

All API calls go through RTK Query:

```typescript
// In component
const { data, isLoading } = useGetLinksQuery({ page: 1, limit: 10 });
const [createLink, { isLoading: isCreating }] = useCreateLinkMutation();
```

## 📄 License

MIT

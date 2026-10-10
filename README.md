# Taskboard

A real-time collaborative task board in the style of Trello. Team members share a board, organise work into lists and cards, drag them around, and see each other's changes appear live.

**Backend:** Java 21, Spring Boot 4 · **Frontend:** Next.js 16, TypeScript · **Database:** PostgreSQL 17 · **Runs with:** Docker Compose

## Features

- **Accounts** with JWT authentication and BCrypt-hashed passwords
- **Boards** shared between members with three roles: owner, editor and viewer
- **Lists and cards** with drag-and-drop reordering, including moving cards between lists
- **Card details:** description, assignee, priority and due date
- **Live updates:** every change is pushed to everyone viewing the board over WebSocket
- **Optimistic UI:** drags update the screen immediately and are reconciled with the server's result
- **Conflict detection:** two people editing the same card cannot silently overwrite each other

## Quick start

You need [Docker](https://www.docker.com/) and nothing else.

```bash
git clone <this-repository-url>
cd <repository-folder>

cp .env.example .env
# edit .env: set DB_PASSWORD, and set JWT_SECRET to the output of `openssl rand -base64 32`

docker compose up -d --build
```

Open http://localhost:3000 and register an account.

| Service | URL |
|---|---|
| Frontend | http://localhost:3000 |
| Backend API | http://localhost:8080/api |
| PostgreSQL | localhost:5433 |

To stop: `docker compose down`. Data is kept in a Docker volume.

## Tech stack

| Layer | Technology |
|---|---|
| Backend | Java 21, Spring Boot 4.1, Spring Web MVC, Spring Data JPA (Hibernate), Spring Security, Spring WebSocket (STOMP), Bean Validation, Lombok, Maven |
| Auth | JWT (jjwt), BCrypt |
| Frontend | Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS 4 |
| Forms | React Hook Form, Zod |
| Drag-and-drop | dnd-kit |
| Real-time client | @stomp/stompjs |
| Database | PostgreSQL 17 |
| Infrastructure | Docker (multi-stage builds), Docker Compose |

## Architecture

```
Browser (Next.js, port 3000)
   │
   ├── REST  /api/*  ──► Next.js proxy ──► Spring Boot (port 8080)
   │                                            │
   │                              JWT security filter chain
   │                                            │
   │                           Controller → Service → Repository
   │                                            │
   │                                       PostgreSQL
   │
   └── WebSocket  /ws (STOMP)  ◄── events broadcast after each commit
```

All writes go through the REST API. The WebSocket only carries events from the server to clients, so validation, permission checks and conflict handling live in one place.

The backend is organised by feature, each with its own controller, service, repository, entity and request/response records:

```
backend/src/main/java/com/taskboard/backend/
├── auth/        register and login
├── user/        user entity and profile
├── board/       boards, membership and roles
├── boardlist/   lists
├── card/        cards
├── realtime/    board events, broadcaster, WebSocket security
├── security/    JWT service and filter
├── config/      security and WebSocket configuration
└── common/      ordering helper, global error handler
```

## Design decisions

**Ordering with fractional positions.** Lists and cards store a decimal position. A moved item takes the midpoint between its new neighbours, so a move updates exactly one row. Two people moving different cards never touch the same row, and each live update is small. When a gap becomes too small to split, that list is renumbered and clients reload.

**Optimistic locking for edits.** Each card carries a version number (JPA `@Version`). The client sends the version it was editing; if the card has changed since, the server answers `409 Conflict` and the client offers to load the latest copy. This was chosen over database locks because conflicts are rare and a lock would be held while someone is typing.

**Broadcast only after commit.** Services publish an event inside their transaction, and a transactional listener sends the WebSocket message only once the transaction has committed. A change that fails is never announced.

**Secured WebSocket.** The JWT is checked when a client connects, a client may only subscribe to boards it is a member of, and clients cannot publish messages themselves.

**Permission responses.** A user who is not a member of a board gets `404`, so the existence of a board is not revealed. A member without the required role gets `403`.

## API

All endpoints are under `/api`. Everything except register and login needs an `Authorization: Bearer <token>` header.

| Method | Path | Purpose |
|---|---|---|
| POST | `/auth/register` | Create an account |
| POST | `/auth/login` | Get a token |
| GET | `/users/me` | Current user |
| GET | `/boards` | Boards the user belongs to |
| POST | `/boards` | Create a board |
| GET | `/boards/{boardId}` | Board with its lists and cards |
| GET | `/boards/{boardId}/members` | List members |
| POST | `/boards/{boardId}/members` | Add a member by email (owner) |
| DELETE | `/boards/{boardId}/members/{userId}` | Remove a member (owner) |
| GET | `/boards/{boardId}/lists` | Lists in order |
| POST | `/boards/{boardId}/lists` | Create a list |
| PATCH | `/lists/{listId}` | Rename or reorder a list |
| POST | `/lists/{listId}/cards` | Create a card |
| PATCH | `/cards/{cardId}` | Edit a card (requires its version) |
| POST | `/cards/{cardId}/move` | Move a card to a list and position |
| DELETE | `/cards/{cardId}` | Delete a card |

Live events are published on the STOMP topic `/topic/board/{boardId}` as `{ type, boardId, payload }`, with types such as `CARD_CREATED`, `CARD_MOVED` and `LIST_UPDATED`.

## Local development

Run only the database in Docker, and the two apps directly so they reload on change. This needs JDK 21 and Node.js 22.

```bash
docker compose up -d postgres

cd backend
./mvnw spring-boot:run        # http://localhost:8080

cd frontend
npm install
npm run dev                   # http://localhost:3000
```

No secrets are stored in the code. When run this way, the backend reads `DB_PASSWORD` and `JWT_SECRET` from the same `.env` file in the project root that Docker Compose uses.

## Configuration

| Variable | Used by | Purpose |
|---|---|---|
| `DB_PASSWORD` | postgres, backend | Database password |
| `JWT_SECRET` | backend | Base64 key (32 bytes or more) for signing tokens |
| `DB_URL`, `DB_USERNAME` | backend | Database connection, set by Compose |
| `API_URL` | frontend (build time) | Where the `/api` proxy forwards to |
| `NEXT_PUBLIC_WS_URL` | frontend (build time) | WebSocket address, default `ws://localhost:8080/ws` |

## Limitations

- The message broker is in-memory, so live updates work with a single backend instance. Running several would need a shared broker such as RabbitMQ or Redis.
- The schema is created by Hibernate at startup; there are no migration files yet.
- There is no automated test suite yet.
- Lists and boards cannot be deleted, and a member's role cannot be changed after they are added.

# expressjs-ddd

A REST API starter built with **Express 5 + TypeScript + Sequelize (PostgreSQL)**, organised with
domain-driven design. It ships a working `user` / `post` example so you can see every layer in use
before adding your own domains.

## Highlights

- **Clear layers** — `domains/` hold business logic, `interfaces/` hold HTTP adapters, `infras/`
  holds shared infrastructure. Dependencies only point one way.
- **Errors as values** — functions that can fail return `T | BadAction` instead of throwing, so the
  type checker forces every caller to handle the failure case. No `try/catch` for business logic.
- **Read through repositories, write through actions** — repositories only read; every write goes
  through an Action, which validates its input before touching the database.
- **Active Record entities** — entities are Sequelize models with explicit getters/setters.
- **Eager loading without JOIN blow-up** — relations load with a separate `WHERE … IN (…)` query, so
  pagination stays correct.
- **camelCase end to end** — database columns, request and response share one naming style.
- **Tooling** — ESLint 9 (typescript-eslint), Prettier, Commander CLI, Sequelize migrations.

## Requirements

- Node.js `>= 18.18`
- PostgreSQL

## Getting started

```bash
git clone git@github.com:phambinh217/expressjs-ddd.git
cd expressjs-ddd
npm install
```

Create a `.env` file in the project root:

```dotenv
PORT=3000
NODE_ENV=development

DB_HOST=127.0.0.1
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=expressjs_ddd
```

Create the database, run the migrations, then start the dev server:

```bash
npm run db:migrate
npm run dev
```

The API is served at `http://localhost:3000/api`.

## Scripts

| Command                                  | Description                                |
| ---------------------------------------- | ------------------------------------------ |
| `npm run dev`                            | Start the dev server with watch mode (tsx) |
| `npm run build` / `npm start`            | Compile to `dist/` and run the build       |
| `npm run cli -- <command>`               | Run a CLI command, e.g. `user:list`        |
| `npm run db:migrate` / `db:migrate:undo` | Apply / revert Sequelize migrations        |
| `npm run typecheck`                      | Type-check without emitting                |
| `npm run lint` / `lint:fix`              | Run ESLint                                 |
| `npm run format` / `format:check`        | Run Prettier                               |

## API

| Method   | Path             | Description                                 |
| -------- | ---------------- | ------------------------------------------- |
| `GET`    | `/api/health`    | Health check                                |
| `GET`    | `/api/users`     | Paginated users with their posts            |
| `GET`    | `/api/users/:id` | One user with their posts                   |
| `POST`   | `/api/users`     | Create a user (`name`, `email`, `password`) |
| `PUT`    | `/api/users/:id` | Update the fields that are sent             |
| `DELETE` | `/api/users/:id` | Delete a user                               |

`GET /api/users` accepts `page`, `perPage` and an `email` filter:

```bash
curl "http://localhost:3000/api/users?page=1&perPage=10"
```

```json
{
  "data": [
    {
      "id": 1,
      "name": "An",
      "email": "an@example.com",
      "posts": [{ "id": 1, "title": "Hello", "content": "…", "createdAt": "…", "updatedAt": "…" }],
      "createdAt": "…",
      "updatedAt": "…"
    }
  ],
  "currentPage": 1,
  "perPage": 10,
  "lastPage": 1,
  "total": 1
}
```

Errors share one shape, with the HTTP status taken from the error:

```json
{ "message": "Email already exists", "errors": { "field": "email" } }
```

## Project structure

```
src/
├── domains/                 Business logic, unaware of HTTP
│   └── user/
│       ├── actions/         One write use case per class (create, update, delete)
│       ├── data/            Input DTOs with Vine validation rules
│       ├── entities/        Sequelize models with getters/setters
│       ├── models/          Table mapping (Model.init) and associations
│       ├── repositories/    Read queries built on PostgresRepository
│       ├── providers/       Boot models, register CLI commands
│       └── console/         CLI commands
├── infras/                  Shared infrastructure (database, errors, hashing, CLI kernel)
├── interfaces/
│   └── admin-api/           HTTP channel: routes, controllers, middlewares
├── migrations/              Sequelize migrations
├── providers.ts             Boots every domain (shared by server and CLI)
├── app.ts / server.ts       Express app and HTTP entry point
└── cli.ts                   CLI entry point
```

A request flows like this:

```
route → controller → Data (validate) → Action → entity.save()
                   → repository (read) ───────────────┘
```

## Conventions

Coding conventions live in [`docs/`](docs/README.md) (currently written in Vietnamese): code style,
naming, and the entity / data / action / repository / controller patterns. Read them before adding a
new domain.

## License

[MIT](LICENSE)

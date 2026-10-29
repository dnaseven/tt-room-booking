# Project rules

## Git and commits

- Write commit messages in English.
- Use lowercase only.
- Format: `scope: message`, e.g. `api: add mock bookings handlers`.
- When the tree has many changes, split them into logical commits where that is easy and cheap; if splitting is hard, choose the lesser evil.

## Architecture

- `src/domain`: zod schemas, errors, pure business rules and use cases shared by client and server.
- `src/server`: mock API: msw handlers (`api`), localStorage repository (`infra`), worker, own `utils`.
- `src/client`: behavior layer (`api`, `features/*`) and presentation layer (`ui`), own `utils` and `i18n`.
- `src/bootstrap`: composition root; starts the server, then renders the client.
- Import across folders via aliases only: `@client/*`, `@server/*`, `@domain/*`.
- `domain` imports nothing from `client` or `server`; `client` and `server` talk only over HTTP (`/api/*`).

### Client UI

- Presentation (`client/ui`) knows nothing about api, domain, hooks or i18n; it gets data and ready strings via props.
- Atomic design: atoms, molecules, organisms, templates, pages. Atoms own the design tokens and are the single place to change styles; higher levels only compose and stay unaware of their surroundings.
- shadcn/ui (`ui/vendor/shadcn`) and lucide-react are imported by atoms only; atoms expose our own API.
- Behavior (`client/features/*`): screens, hooks (TanStack Query), model (mappers), lib. Screens map DTOs to UI models and pass props to pages.
- UI texts via react-i18next (ru, en; en by default), defined in the behavior layer.
- API errors are `ApiError` with a `code`; user texts are chosen by code. On 409 show a message, refetch the list and keep the form values.

# Logging Middleware

A reusable logging package that sends logs to the Affordmed evaluation server.

## Usage

```js
const { Log } = require("./index");

await Log(stack, level, package_name, message);
```

## Parameters

| Param | Values |
|-------|--------|
| stack | `backend`, `frontend` |
| level | `debug`, `info`, `warn`, `error`, `fatal` |
| package | `middleware`, `auth`, `config`, `utils` (shared) |

## Example

```js
await Log("backend", "info", "middleware", "Server started on port 3000");
await Log("backend", "error", "db", "Database connection failed");
```
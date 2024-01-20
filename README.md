# Tezoro SDK

## Installation

```bash
npm install @tezoro/sdk
```

## Initialization

```typescript
import { TezoroClient } from "@tezoro/sdk";

const tezoroClient = new TezoroClient();

// or
const tezoroClient = new TezoroClient({ token }); // use auth token for further requests
```

## Usage

### Register / login

```typescript
const { ok, data } = await tezoroClient.register("someEmail", "somePassword");
const { ok, data } = await tezoroClient.login("someEmail", "somePassword");

if (ok) {
  const { token } = data; // your token
  tezoroClient.token = token; // set token to client to further requests
}
```

### Get backup by ID

```typescript
const backup = await tezoroClient.getBackupById("someBackupId");
```

### Get backups

```typescript
const backups = await tezoroClient.getUserBackups();
```

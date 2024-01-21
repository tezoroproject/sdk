# Tezoro SDK

## Installation

```bash
npm install @tezoroproject/sdk
```

## Initialization

```ts
import { TezoroClient } from "@tezoroproject/sdk";

const tezoroClient = new TezoroClient();

// or
const tezoroClient = new TezoroClient({ token }); // use auth token for further requests
```

## Usage

### Register / login

```ts
const { ok, data } = await tezoroClient.register("someEmail", "somePassword");
const { ok, data } = await tezoroClient.login("someEmail", "somePassword");

if (ok) {
  const { token } = data; // your token
  tezoroClient.token = token; // set token to client to further requests
}
```

### Get backup by ID

```ts
const backup = await tezoroClient.getBackupById("someBackupId");
```

### Get backups

```ts
const backups = await tezoroClient.getUserBackups();
```

### Deploy backup

```ts
import { mainnet } from "wagmi";
import { deployBackup, TezoroClient } from '@tezoroproject/sdk';
import { createWalletClient, custom, http } from "viem";

const tezoroClient = new TezoroClient({ token });

// Backup data
const inactivePeriod = 1;
const beneficiaries = [
      {
        address: "0x0000000000000000000000000000000000000000",
        percent: 73,
      },
      {
        address: "0x0000000000000000000000000000000000000000",
        percent: 27,
      }
];
const executor = "0x0000000000000000000000000000000000000000";
const tokenAddress = "0x0000000000000000000000000000000000000000";
const tokenAmount = 123.456;
const launchDate = 1234567890;

const { email_hash, meta_id_encrypted } = await apiClient.getMetaId(
      token,
      beneficiaries,
      launchDate,
      tokenAmount,
      executor,
      inactivePeriod
  );

// Example. See viem, wagmi docs for more details
const walletClient = createWalletClient({
    chain: mainnet
    transport: custom(provider),
});

// Example. See viem, wagmi docs for more details
const publicClient = createPublicClient({
  chain: mainnet,
  transport: http(),
});

const tezoroServiceContractAddress = "0xd9bE6af8Cc9553Ffa6402939bEFAa63108366A06";

const deployTxHash = await deployBackup(
  publicClient,
  walletClient,
  tezoroServiceContractAddress,
  {
    executor,
    beneficiaries,
    tokenAddress,
    tokenAmount,
    launchDate,
    inactivePeriod,
    email_hash,
    meta_id_encrypted,
  }
);

```

### Approve token to Tezoro backup

```ts
import { mainnet } from "wagmi";
import { getContract } from "viem";
import { contracts } from '@tezoroproject/sdk';

const { ERC20 } = contracts;

// Example. See viem, wagmi docs for more details
const walletClient = createWalletClient({
    chain: mainnet
    transport: custom(provider),
});

const tokenContractAddress = "0x0000000000000000000000000000000000000000";
const tezoroServiceContractAddress = "0xd9bE6af8Cc9553Ffa6402939bEFAa63108366A06";

const tokenContract = getContract({
    abi: ERC20,
    address: tokenContractAddress,
    client: walletClient,
});
const amount = 123456;
const hash = await tokenContract.write.approve(
  [tezoroServiceContractAddress, BigInt(amount)],
  {
    account: currentAccount,
    chain: mainnet,
  }
);

```

import { getContract, type PublicClient } from "viem";
import Tezoro from "./contracts/Tezoro";

const getBackupInfoByAddress = async (
  publicClient: PublicClient,
  address: `0x${string}`
) => {
  const backupContract = getContract({
    abi: Tezoro,
    address,
    client: publicClient,
  });

  const timestamp = await backupContract.read.timestamp();
  const delay = await backupContract.read.delay();
  // 0 — initialized
  // 1 — initiated restoration process
  // 2 — initiated revocation process
  // 3 — restored
  // 4 — revoked
  const state = await backupContract.read.state();

  const restoreTimestamp = state === 3 ? timestamp - delay : 0;
  const revocationInitiatedTimestamp = state === 2 ? timestamp - delay : 0;
  const restoreInitiatedTimestamp = state === 1 ? timestamp - delay : 0;
  const ownerAddress = await backupContract.read.owner();
  const tokenAddress = await backupContract.read.tokenAddress();
  const revocationDelay = delay;
  const restoreDelay = delay;
  // const beneficiary = await backupContract.beneficiary();
  const initTimestamp = await backupContract.read.initTimestamp();
  const revocationTimestamp = state === 2 ? timestamp : 0;

  const isTerminalState = state >= 3;
  const isRevoked = state === 2 && Date.now() > timestamp;
  const isActive = !(isTerminalState || isRevoked);

  return {
    tokenAddress,
    from: ownerAddress,
    createdAt: parseInt(initTimestamp.toString(), 10),
    restoreTimestamp: parseInt(restoreTimestamp.toString(), 10),
    revocationInitiatedTimestamp: parseInt(
      revocationInitiatedTimestamp.toString(),
      10
    ),
    revocationDelaySeconds: parseInt(revocationDelay.toString(), 10),
    restoreInitiatedTimestamp: parseInt(
      restoreInitiatedTimestamp.toString(),
      10
    ),
    restoreDelaySeconds: parseInt(restoreDelay.toString(), 10),
    isActive,
    revocationTimestamp: parseInt(revocationTimestamp.toString(), 10),
  };
};

export default getBackupInfoByAddress;

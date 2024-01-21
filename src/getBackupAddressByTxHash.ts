import { decodeEventLog, parseAbi, type PublicClient } from "viem";

const getBackupAddressByTxHash = async (
  publicClient: PublicClient,
  deployTxHash: `0x${string}`
) => {
  const receipt = await publicClient.waitForTransactionReceipt({
    hash: deployTxHash,
  });

  if (receipt === null) {
    throw new Error(`Transaction receipt is null`);
  }

  const deployedBackupContractEvent = receipt.logs
    .map((log) => {
      try {
        return decodeEventLog({
          abi: parseAbi([
            "event DeployedBackupContract(address indexed backupContract,address indexed deployer,bytes32 userHash,bytes32 metaId)",
          ]),
          topics: [...log.topics],
          data: log.data,
        });
      } catch (e) {
        return null;
      }
    })
    .find((log) => log && log.eventName === "DeployedBackupContract");

  const deployedBackupContractAddress =
    deployedBackupContractEvent?.args?.backupContract;

  if (typeof deployedBackupContractAddress !== "string") {
    throw new Error("deployedBackupContractAddress is not a string");
  }

  return deployedBackupContractAddress;
};

export default getBackupAddressByTxHash;

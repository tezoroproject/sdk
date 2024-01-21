import { PublicClient, decodeFunctionData } from "viem";
import Tezoro from "./contracts/Tezoro";

const getActionStateByTxHash = async (
  publicClient: PublicClient,
  txHash: `0x${string}`
) => {
  const tx = await publicClient.getTransaction({
    hash: txHash,
  });
  if (!tx) {
    throw new Error(`Transaction with hash ${txHash} not found.`);
  }

  const { functionName } = decodeFunctionData({
    abi: Tezoro,
    data: tx.input,
  });

  return {
    status: tx.blockNumber ? "completed" : "pending",
    type: functionName,
  };
};

export default getActionStateByTxHash;

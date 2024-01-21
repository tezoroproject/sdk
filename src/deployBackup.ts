import { WalletClient, type PublicClient, zeroAddress, isAddress } from "viem";
import { PIECE, SERVICE_FEE_IN_WEI } from "./constants";
import TezoroService from "./contracts/TezoroService";

export type Beneficiary = {
  address: `0x${string}`;
  percent: number;
};

type DeployData = {
  executor: `0x${string}`;
  beneficiaries: Beneficiary[];
  tokenAddress: `0x${string}`;
  tokenAmount: number;
  launchDate: number;
  discounts?: number[] | undefined;
  inactivePeriod?: number | undefined;
  email_hash: `0x${string}`;
  meta_id_encrypted: `0x${string}`;
};

const deployBackup = async (
  publicClient: PublicClient,
  walletClient: WalletClient,
  tezoroServiceContractAddress: `0x${string}`,
  deployData: DeployData
) => {
  if (walletClient.account === undefined) {
    throw new Error("Account is undefined");
  }
  const { address: walletAddress } = walletClient.account;
  const {
    discounts,
    beneficiaries,
    tokenAddress,
    email_hash,
    launchDate,
    executor,
    meta_id_encrypted,
  } = deployData;
  const initialServiceFee = Number(SERVICE_FEE_IN_WEI);

  let serviceFee = initialServiceFee;
  // Apply discounts
  if (discounts) {
    discounts.forEach((discount) => {
      serviceFee -= serviceFee * discount;
    });
  }

  console.log(
    `Deploying backup using TezoroService (${tezoroServiceContractAddress}) with params:` +
      `beneficiaries:\n${beneficiaries
        .map((b, i) => `${i + 1}. ${b.address} (${b.percent}%)`)
        .join("\n")}\n\n` +
      `tokenAddress: ${tokenAddress}\n` +
      `email_hash: ${email_hash}\n` +
      `launchDate ${launchDate}\n` +
      `discounts: ${discounts?.join(", ")}\n` +
      `serviceFee: ${serviceFee}`,
    `executor: ${executor}`
  );

  const serviceFeedInt = Math.round(serviceFee);

  if (Number.isNaN(serviceFeedInt)) {
    throw new Error(`Service fee is NaN. Original value: ${serviceFee}`);
  }

  const [b1, b2, b3, b4] = beneficiaries;

  const beneficiary1 = b1?.address ?? zeroAddress;
  const beneficiary2 = b2?.address ?? zeroAddress;
  const beneficiary3 = b3?.address ?? zeroAddress;
  const beneficiary4 = b4?.address ?? zeroAddress;

  const share1 = (b1?.percent ?? 0) * PIECE;
  const share2 = (b2?.percent ?? 0) * PIECE;
  const share3 = (b3?.percent ?? 0) * PIECE;

  const { request } = await publicClient.simulateContract({
    account: walletAddress,
    address: tezoroServiceContractAddress,
    abi: TezoroService,
    functionName: "deployBackupContract",
    value: BigInt(serviceFeedInt),
    args: [
      beneficiary1,
      share1,
      beneficiary2,
      share2,
      beneficiary3,
      share3,
      beneficiary4,
      tokenAddress,
      isAddress(executor) ? executor : zeroAddress, // _executor (address)
      email_hash, // _userHash (bytes32)
      meta_id_encrypted, // _metaId bytes3
    ],
  });

  const txHash = await walletClient.writeContract(request);
  return txHash;
};

export default deployBackup;

import { isAddress, isHex } from "viem";
import { z } from "zod";

const evmAddress = z.string().refine(isAddress, (address) => ({
  message: `${address} is not a valid address`,
}));

export const backupSchema = z.object({
  amount: z.string().optional(),
  id: z.string(),
  timestamp: z.number().int().nonnegative().catch(0),
  contractAddress: evmAddress,
  ownerAddress: evmAddress,
  userHash: z.string(),
  activeTransactionHash: z.string().optional(),
  beneficiaries: z
    .object({
      address: z.string().optional(),
      percent: z.number().optional(),
    })
    .array(),
  dateTriggerTimestamp: z.number().int().nonnegative().catch(0),
  restoreDateTimestamp: z.number().int().nonnegative(),
  metaId: z.string(),
  status: z.string().optional(),
  inactiveMonthPeriod: z.number().optional(),
  isLaunchByInactivePeriod: z.boolean().optional(),
  isLaunchedByInactivePeriod: z.boolean().optional(),
  executor: z.string().optional(),
  nonce: z
    .object({ value: z.number().optional(), date: z.number().optional() })
    .optional(),
});

export const userSchema = z.object({
  token: z.string(),
  data: z.object({
    _id: z.string(),
    email: z.string().email(),
  }),
});

export const userDiscountsSchema = z
  .object({
    email: z.string().email(),
    discount: z.string(),
  })
  .array();

export const errorSchema = z.object({
  message: z.string().optional(),
});

export const currentFeesSchema = z.object({
  deployCost: z.number(),
  deployCostUsd: z.number(),
  serviceFee: z.number(),
  serviceFeeUsd: z.number(),
  total: z.number(),
  totalUsd: z.number(),
  ethUsdPrice: z.number(),
});

export const backupMetaResponseSchema = z.object({
  email_hash: z.string().refine(isHex, (str) => ({
    message: `${str} is not a valid hex string`,
  })),
  meta_id_encrypted: z.string(),
});

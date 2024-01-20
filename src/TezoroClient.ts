import {
  backupMetaResponseSchema,
  backupSchema,
  currentFeesSchema,
  errorSchema,
  userSchema,
} from "./schemas";
import { z } from "zod";
import { zeroAddress } from "viem";

import { fetchWithValidation } from "simple-typed-fetch";

type ConstructorParams = {
  token?: string;
  apiUrl?: string;
  tezoroServiceContractAddress?: string;
};

export type Beneficiary = {
  address?: string;
  percent?: number;
};

export default class TezoroClient {
  public tezoroServiceContractAddress =
    "0xd9bE6af8Cc9553Ffa6402939bEFAa63108366A06";
  public apiUrl = "https://tezoro.io/api";
  token?: string | undefined;

  constructor({
    token,
    apiUrl,
    tezoroServiceContractAddress,
  }: ConstructorParams) {
    this.token = token;
    if (apiUrl) {
      // Check if apiUrl is valid
      const url = new URL(apiUrl);
      if (!url.protocol.startsWith("http")) {
        throw new Error("customApiUrl must start with http or https");
      }
      this.apiUrl = apiUrl;

      if (tezoroServiceContractAddress) {
        this.tezoroServiceContractAddress = tezoroServiceContractAddress;
      }
    }
  }

  getSystemStatus = async () => {
    const url = `${this.apiUrl}/system/status`;
    const dataResult = await fetchWithValidation(
      url,
      z.object({
        isHighLoad: z.boolean(),
      }),
      {
        method: "GET",
      },
      errorSchema
    );

    if (dataResult.isOk()) {
      return {
        ok: true,
        data: dataResult.value.data,
      } as const;
    } else {
      return {
        ok: false,
        message: dataResult.error.message,
      } as const;
    }
  };

  saveUserAnalytics = async (
    email: string,
    sawPage?: string,
    promocode?: string
  ) => {
    if (this.token === undefined) {
      throw new Error("Token is undefined. Please, set token");
    }
    const url = `${this.apiUrl}/analytics/save`;
    const dataResult = await fetchWithValidation(
      url,
      z.object({
        email: z.string().email(),
        sawPage: z.string().optional(),
        promocode: z.string().optional(),
      }),
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.token}`,
        },
        body: JSON.stringify({
          email,
          sawPage,
          promocode,
        }),
      },
      errorSchema
    );

    if (dataResult.isOk()) {
      return {
        ok: true,
        data: dataResult.value.data,
      } as const;
    } else {
      return {
        ok: false,
        message: dataResult.error.message,
      } as const;
    }
  };

  updatePassword = async (password: string) => {
    if (this.token === undefined) {
      throw new Error("Token is undefined. Please, set token");
    }
    const url = `${this.apiUrl}/user/reset`;
    const dataResult = await fetchWithValidation(
      url,
      z.unknown(),
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.token}`,
        },
        body: JSON.stringify({ token: this.token, password }),
      },
      errorSchema
    );

    if (dataResult.isOk()) {
      return {
        ok: true,
        data: dataResult.value.data,
      } as const;
    } else {
      return {
        ok: false,
        message: dataResult.error.message,
      } as const;
    }
  };

  sendEmailForRecovery = async (email: string) => {
    const url = `${this.apiUrl}/user/recover`;
    const dataResult = await fetchWithValidation(
      url,
      z.unknown(),
      {
        method: "POST",
        body: JSON.stringify({ email }),
      },
      errorSchema
    );

    if (dataResult.isOk()) {
      return {
        ok: true,
        data: dataResult.value.data,
      } as const;
    } else {
      return {
        ok: false,
        message: dataResult.error.message,
      } as const;
    }
  };

  sendBackupMeta = async (
    metaId: string,
    restoreDateTimestamp?: number,
    revocationInitiateDateTimestamp?: number,
    dateTriggerTimestamp?: number,
    action?:
      | "initiateRestoreProcess"
      | "initiateRevocationProcess"
      | "abortRevocationProcess"
      | "abortRestoreProcess"
  ) => {
    if (this.token === undefined) {
      throw new Error("Token is undefined. Please, set token");
    }

    const url = `${this.apiUrl}/backupMeta`;
    const dataResult = await fetchWithValidation(
      url,
      z.object({
        metaId: z.string(),
        restoreDateTimestamp: z.number().optional(),
        revocationInitiateDateTimestamp: z.number().optional(),
        dateTriggerTimestamp: z.number().optional(),
        action: z
          .enum([
            "initiateRestoreProcess",
            "initiateRevocationProcess",
            "abortRevocationProcess",
            "abortRestoreProcess",
          ])
          .optional(),
      }),
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.token}`,
        },
        body: JSON.stringify({
          metaId,
          restoreDateTimestamp,
          revocationInitiateDateTimestamp,
          dateTriggerTimestamp,
          action,
        }),
      },
      errorSchema
    );

    if (dataResult.isOk()) {
      return {
        ok: true,
        data: dataResult.value.data,
      } as const;
    } else {
      return {
        ok: false,
        message: dataResult.error.message,
      } as const;
    }
  };

  getUserBackups = async () => {
    if (this.token === undefined) {
      throw new Error("Token is undefined. Please, set token");
    }

    const url = `${this.apiUrl}/user/backups`;
    const dataResult = await fetchWithValidation(
      url,
      backupSchema.array(),
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${this.token}`,
        },
      },
      errorSchema
    );

    if (dataResult.isOk()) {
      return {
        ok: true,
        data: dataResult.value.data,
      } as const;
    } else {
      return {
        ok: false,
        message: dataResult.error.message,
      } as const;
    }
  };

  getBackupById = async (id: string) => {
    if (this.token === undefined) {
      throw new Error("Token is undefined. Please, set token");
    }

    const url = `${this.apiUrl}/backup/${id}`;
    const dataResult = await fetchWithValidation(
      url,
      backupSchema,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${this.token}`,
        },
      },
      errorSchema
    );

    if (dataResult.isOk()) {
      return {
        ok: true,
        data: dataResult.value.data,
      } as const;
    } else {
      return {
        ok: false,
        message: dataResult.error.message,
      } as const;
    }
  };

  getUserProfile = async () => {
    if (this.token === undefined) {
      throw new Error("Token is undefined. Please, set token");
    }

    const url = `${this.apiUrl}/user/profile`;
    const dataResult = await fetchWithValidation(
      url,
      userSchema,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${this.token}`,
        },
      },
      errorSchema
    );

    if (dataResult.isOk()) {
      return {
        ok: true,
        data: dataResult.value.data,
      } as const;
    } else {
      return {
        ok: false,
        message: dataResult.error.message,
      } as const;
    }
  };

  register = async (email: string, password: string) => {
    const url = `${this.apiUrl}/user`;
    const dataResult = await fetchWithValidation(
      url,
      userSchema,
      {
        method: "POST",
        body: JSON.stringify({
          email,
          password,
        }),
      },
      errorSchema
    );

    if (dataResult.isOk()) {
      return {
        ok: true,
        data: dataResult.value.data,
      } as const;
    } else {
      return {
        ok: false,
        message: dataResult.error.message,
      } as const;
    }
  };

  login = async (email: string, password: string) => {
    const url = `${this.apiUrl}/user/login`;
    const dataResult = await fetchWithValidation(
      url,
      userSchema,
      {
        method: "POST",
        body: JSON.stringify({
          email,
          password,
        }),
      },
      errorSchema
    );

    if (dataResult.isOk()) {
      return {
        ok: true,
        data: dataResult.value.data,
      } as const;
    } else {
      return {
        ok: false,
        message: dataResult.error.message,
      } as const;
    }
  };

  getCurrentFees = async () => {
    const url = `${this.apiUrl}/currentFees`;
    const dataResult = await fetchWithValidation(
      url,
      currentFeesSchema,
      {
        method: "GET",
      },
      errorSchema
    );

    if (dataResult.isOk()) {
      return {
        ok: true,
        data: dataResult.value.data,
      } as const;
    } else {
      return {
        ok: false,
        message: dataResult.error.message,
      } as const;
    }
  };

  initiateRestoreProcess = async (backupContractAddress: string) => {
    if (this.token === undefined) {
      throw new Error("Token is undefined. Please, set token");
    }

    const url = `${this.apiUrl}/writeContract`;

    const dataResult = await fetchWithValidation(
      url,
      z.unknown(),
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.token}`,
        },
        body: JSON.stringify({
          backupAddress: backupContractAddress,
          action: "changeState",
          params: { _state: 1 },
        }),
      },
      errorSchema
    );

    if (dataResult.isOk()) {
      return {
        ok: true,
        data: dataResult.value.data,
      } as const;
    } else {
      return {
        ok: false,
        message: dataResult.error.message,
      } as const;
    }
  };

  initiateRevocationProcess = async (backupContractAddress: string) => {
    if (this.token === undefined) {
      throw new Error("Token is undefined. Please, set token");
    }

    const url = `${this.apiUrl}/writeContract`;
    const dataResult = await fetchWithValidation(
      url,
      z.unknown(),
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.token}`,
        },
        body: JSON.stringify({
          backupAddress: backupContractAddress,
          action: "changeState",
          params: { _state: 2 },
        }),
      },
      errorSchema
    );

    if (dataResult.isOk()) {
      return {
        ok: true,
        data: dataResult.value.data,
      } as const;
    } else {
      return {
        ok: false,
        message: dataResult.error.message,
      } as const;
    }
  };

  abortRestoreProcess = async (backupContractAddress: string) => {
    if (this.token === undefined) {
      throw new Error("Token is undefined. Please, set token");
    }

    const url = `${this.apiUrl}/writeContract`;
    const dataResult = await fetchWithValidation(
      url,
      z.unknown(),
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.token}`,
        },
        body: JSON.stringify({
          backupAddress: backupContractAddress,
          action: "changeState",
          params: { _state: 0 },
        }),
      },
      errorSchema
    );

    if (dataResult.isOk()) {
      return {
        ok: true,
        data: dataResult.value.data,
      } as const;
    } else {
      return {
        ok: false,
        message: dataResult.error.message,
      } as const;
    }
  };

  abortRevocationProcess = async (backupContractAddress: string) => {
    if (this.token === undefined) {
      throw new Error("Token is undefined. Please, set token");
    }

    const url = `${this.apiUrl}/writeContract`;

    const dataResult = await fetchWithValidation(
      url,
      z.unknown(),
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.token}`,
        },
        body: JSON.stringify({
          backupAddress: backupContractAddress,
          action: "changeState",
          params: { _state: 0 },
        }),
      },
      errorSchema
    );

    if (dataResult.isOk()) {
      return {
        ok: true,
        data: dataResult.value.data,
      } as const;
    } else {
      return {
        ok: false,
        message: dataResult.error.message,
      } as const;
    }
  };

  restore = async (backupContractAddress: string) => {
    if (this.token === undefined) {
      throw new Error("Token is undefined. Please, set token");
    }

    const url = `${this.apiUrl}/writeContract`;

    const dataResult = await fetchWithValidation(
      url,
      z.unknown(),
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.token}`,
        },
        body: JSON.stringify({
          backupAddress: backupContractAddress,
          action: "changeState",
          params: { _state: 3 },
        }),
      },
      errorSchema
    );

    if (dataResult.isOk()) {
      return {
        ok: true,
        data: dataResult.value.data,
      } as const;
    } else {
      return {
        ok: false,
        message: dataResult.error.message,
      } as const;
    }
  };

  getMetaId = async (
    beneficiaries: Beneficiary[],
    dateTriggerTimestamp: number,
    amount: number,
    executor: string,
    inactivePeriod?: number
  ) => {
    if (this.token === undefined) {
      throw new Error("Token is undefined. Please, set token");
    }

    const url = `${this.apiUrl}/backupMeta`;

    const dataResult = await fetchWithValidation(
      url,
      backupMetaResponseSchema,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.token}`,
        },
        body: JSON.stringify({
          beneficiaries,
          dateTriggerTimestamp,
          isManualAvailable: true,
          amount,
          inactiveMonthPeriod: inactivePeriod,
          executor: executor === zeroAddress ? undefined : executor,
        }),
      },
      errorSchema
    );

    if (dataResult.isOk()) {
      return {
        ok: true,
        data: dataResult.value.data,
      } as const;
    } else {
      return {
        ok: false,
        message: dataResult.error.message,
      } as const;
    }
  };

  deployMessage = async () => {
    if (this.token === undefined) {
      throw new Error("Token is undefined. Please, set token");
    }

    const url = `${this.apiUrl}/deployMessage`;

    const dataResult = await fetchWithValidation(
      url,
      z.unknown(),
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${this.token}`,
        },
      },
      errorSchema
    );

    if (dataResult.isOk()) {
      return {
        ok: true,
        data: dataResult.value.data,
      };
    } else {
      return {
        ok: false,
        message: dataResult.error.message,
      };
    }
  };
}

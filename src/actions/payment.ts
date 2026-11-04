"use server";

import { asaasApi } from "@/lib/asaas";
import { prisma } from "@/lib/prisma";
import {
  calculateInstallmentOptions,
  formatName,
  unMockValue,
} from "@/lib/utils";
import { ServerError } from "@/server/error";
import {
  creditCardCheckoutSchema,
  CreditCardCheckoutSchema,
  pixCheckoutSchema,
  PixCheckoutSchema,
} from "@/server/schemas/payment";
import axios, { isAxiosError } from "axios";
import { headers } from "next/headers";
import { getUser } from "./user";

type AsaasErrorResponse = {
  errors?: { code?: string; description?: string }[];
};

type PixCheckoutResult =
  | { success: true; invoiceId: string }
  | { success: false; message: string };

const getAsaasErrorMessage = (error: unknown, endpoint: string) => {
  if (!axios.isAxiosError<AsaasErrorResponse>(error)) {
    throw error;
  }

  const apiErrors = error.response?.data?.errors ?? [];
  const message = apiErrors
    .map(({ description }) => description)
    .filter((description): description is string => Boolean(description))
    .join(" ");

  console.error("Asaas request failed", {
    endpoint,
    status: error.response?.status,
    errorCodes: apiErrors.map(({ code }) => code).filter(Boolean),
  });

  return (
    message ||
    (error.response
      ? `O Asaas respondeu com erro HTTP ${error.response.status}.`
      : "Não foi possível conectar ao Asaas. Tente novamente.")
  );
};

export const createPixCheckout = async (payload: PixCheckoutSchema) => {
  const input = pixCheckoutSchema.safeParse(payload);

  if (!input.success) {
    throw new ServerError({
      message: "Falha ao processar o pagamento",
      code: "INVALID_DATA",
    });
  }

  const {
    courseId,
    cpf: rawCpf,
    name,
    postalCode: rawPostalCode,
    addressNumber,
  } = input.data;

  const cpf = unMockValue(rawCpf);
  const postalCode = unMockValue(rawPostalCode);

  const { userId, user } = await getUser();

  const course = await prisma.course.findUnique({
    where: { id: courseId },
  });

  if (!course) {
    throw new ServerError({
      message: "Curso não encontrado",
      code: "NOT_FOUND",
    });
  }

  const userHasCourse = await prisma.coursePurchase.findFirst({
    where: {
      courseId,
      userId,
    },
  });

  if (userHasCourse) {
    throw new ServerError({
      message: "Você já possui acesso a este curso",
      code: "CONFLICT",
    });
  }

  let customerId = user?.asaasId;

  if (customerId) {
    try {
      await asaasApi.put(`/customers/${customerId}`, {
        cpfCnpj: cpf,
      });
    } catch (error) {
      return {
        success: false,
        message: getAsaasErrorMessage(error, "/customers/:id"),
      } satisfies PixCheckoutResult;
    }
  } else {
    let newCustomer: { id: string };

    try {
      const { data } = await asaasApi.post<{ id: string }>("/customers", {
        name: name ?? formatName(user.firstName, user.lastName),
        email: user.email,
        cpfCnpj: cpf,
        postalCode,
        addressNumber,
      });
      newCustomer = data;
    } catch (error) {
      return {
        success: false,
        message: getAsaasErrorMessage(error, "/customers"),
      } satisfies PixCheckoutResult;
    }

    customerId = newCustomer.id;

    await prisma.user.update({
      where: { id: userId },
      data: { asaasId: customerId },
    });
  }

  const price = course?.discountPrice ?? course?.price;

  const paymentPayload = {
    customer: customerId,
    billingType: "PIX",
    value: price,
    dueDate: new Date().toISOString().split("T")[0],
    description: `Compra do curso "${course.title}"`,
    externalReference: courseId,
  };

  try {
    const { data } = await asaasApi.post<{ id: string }>(
      "/payments",
      paymentPayload,
    );

    return {
      success: true,
      invoiceId: data.id,
    } satisfies PixCheckoutResult;
  } catch (error) {
    return {
      success: false,
      message: getAsaasErrorMessage(error, "/payments"),
    } satisfies PixCheckoutResult;
  }
};

export const createCreditCardCheckout = async (
  payload: CreditCardCheckoutSchema,
) => {
  const input = creditCardCheckoutSchema.safeParse(payload);

  if (!input.success) {
    throw new ServerError({
      message: "Falha ao processar pagamento",
      code: "INVALID_DATA",
    });
  }

  const {
    courseId,
    name,
    cardCvv,
    cardNumber,
    cardValidThru,
    installments,
    cpf: rawCpf,
    addressNumber,
    phone,
    postalCode: rawPostalCode,
  } = input.data;

  const cpf = unMockValue(rawCpf);
  const postalCode = unMockValue(rawPostalCode);

  const { userId, user } = await getUser();

  const course = await prisma.course.findUnique({
    where: { id: courseId },
  });

  if (!course) {
    throw new ServerError({
      message: "Curso não encontrado",
      code: "NOT_FOUND",
    });
  }

  const userHasCourse = await prisma.coursePurchase.findFirst({
    where: { courseId, userId },
  });

  if (userHasCourse) {
    throw new ServerError({
      message: "Você já possui acesso a este curso",
      code: "CONFLICT",
    });
  }

  let customerId = user?.asaasId;

  if (customerId) {
    try {
      await asaasApi.put(`/customers/${customerId}`, {
        cpfCnpj: cpf,
      });
    } catch (error) {
      return {
        success: false,
        message: getAsaasErrorMessage(error, "/customers/:id"),
      } satisfies PixCheckoutResult;
    }
  } else {
    let newCustomer: { id: string };

    try {
      const { data } = await asaasApi.post<{ id: string }>("/customers", {
        name: name ?? formatName(user.firstName, user.lastName),
        email: user.email,
        cpfCnpj: cpf,
        postalCode,
        addressNumber,
      });
      newCustomer = data;
    } catch (error) {
      return {
        success: false,
        message: getAsaasErrorMessage(error, "/customers"),
      } satisfies PixCheckoutResult;
    }

    customerId = newCustomer.id;

    await prisma.user.update({
      where: { id: userId },
      data: { asaasId: customerId },
    });
  }

  const price = course?.discountPrice ?? course?.price;
  const installmentsOptions = calculateInstallmentOptions(price);
  const installmentData = installmentsOptions.find(
    (item) => item.installments === installments,
  );

  const installmentsTotal = installmentData?.total ?? price;

  const nextHeader = await headers();

  const remoteIp =
    nextHeader.get("x-real-ip") ||
    nextHeader.get("x-forwarded-for") ||
    nextHeader.get("x-client-ip");

  const paymentPayload = {
    customer: customerId,
    billingType: "CREDIT_CARD",
    value: installmentsTotal,
    dueDate: new Date().toISOString().split("T")[0],
    description: `Compra do curso "${course.title}"`,
    externalReference: course.id,
    creditCard: {
      holderName: name,
      number: unMockValue(cardNumber),
      expiryMonth: cardValidThru.split("/")[0],
      expiryYear: cardValidThru.split("/")[1],
      ccv: cardCvv,
    },
    creditCardHolderInfo: {
      name,
      email: user.email,
      cpfCnpj: cpf,
      postalCode,
      addressNumber,
      phone,
    },
    remoteIp,
    installmentCount: installments > 1 ? installments : undefined,
    installmentValue:
      installments > 1 ? installmentData?.installmentValue : undefined,
  };

  try {
    await asaasApi.post("/payments", paymentPayload);
  } catch (error) {
    if (!isAxiosError(error)) {
      throw new ServerError({
        message: "Falha ao processar o pagamento",
        code: "FAILED_TO_CREATE_PAYMENT",
      });
    }

    console.error(error?.response?.data);

    const firstErrorDescription =
      (error?.response?.data?.errors?.[0]?.description as string) ?? "";

    if (firstErrorDescription.includes("não autorizada")) {
      throw new ServerError({
        message: "NOT_AUTHORIZED",
        code: "Transação não autorizada. Verifique os dados do cartão de crédito e tente novamente.",
      });
    }

    throw new ServerError({
      message: "Falha ao processar o pagamento",
      code: "FAILED_TO_CREATE_PAYMENT",
    });
  }
};

export const getPixQrCode = async (invoiceId: string) => {
  await getUser();

  const { data } = await asaasApi.get<PixResponse>(
    `/payments/${invoiceId}/pixQrCode`,
  );

  return data;
};

export const getInvoiceStatus = async (invoiceId: string) => {
  await getUser();

  const { data } = await asaasApi.get(`/payments/${invoiceId}`);

  return {
    status: data.status as string,
  };
};

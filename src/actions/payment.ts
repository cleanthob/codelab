"use server";

import axios from "axios";
import { asaasApi } from "@/lib/asaas";
import { prisma } from "@/lib/prisma";
import { formatName, unMockValue } from "@/lib/utils";
import { ServerError } from "@/server/error";
import { pixCheckoutSchema, PixCheckoutSchema } from "@/server/schemas/payment";
import { getUser } from "./user";
import { PixResponse } from "@/components/pages/courses/course-details/checkout-dialog/pix";

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
      message: "Você já possui este curso",
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

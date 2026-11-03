import { CourseDifficulty } from "@/generated/prisma/enums";

export { cn } from "cn";

export const formatDuration = (durationInMs: number, showHours = false) => {
  const hours = Math.floor(durationInMs / (1000 * 60 * 60));
  const minutes = Math.floor((durationInMs % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((durationInMs % (1000 * 60)) / 1000);

  const formatNumber = (num: number) => num.toString().padStart(2, "0");

  if (hours > 0 || showHours) {
    return `${formatNumber(hours)}:${formatNumber(minutes)}:${formatNumber(seconds)}`;
  }

  return `${formatNumber(minutes)}:${formatNumber(seconds)}`;
};

export const formatDifficulty = (difficulty: CourseDifficulty) => {
  switch (difficulty) {
    case CourseDifficulty.EASY:
      return "Iniciante";

    case CourseDifficulty.MEDIUM:
      return "Intermediário";

    case CourseDifficulty.HARD:
      return "Avançado";
  }
};

export const formatPrice = (price: number) => {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(price);
};

export const formatName = (firstName: string, lastName?: string | null) => {
  if (!lastName) return firstName;

  return `${firstName} ${lastName}`;
};

export const unMockValue = (value: string) => {
  return value.replace(/[^0-9a-z]/gi, "");
};

export const calculateInstallmentOptions = (price: number) => {
  const gatewayFeePercentage = 0.0399; // 3.99% Asaas;
  const gatewayFixedFee = 0.8; // 0.49 Asaas;
  const maxInstallments = 12;
  const noInterestInstallments = 6;

  const installmentsOptions: InstallmentOption[] = [];

  for (let i = 1; i <= maxInstallments; i++) {
    let total = price;

    if (i > noInterestInstallments) {
      total += total * gatewayFeePercentage + gatewayFixedFee;
    }

    total = Math.round(total * 100) / 100;
    const installmentValue = Math.round((total / i) * 100) / 100;

    installmentsOptions.push({
      installments: i,
      total,
      installmentValue,
      hasInterest: i > noInterestInstallments,
    });
  }

  return installmentsOptions;
};

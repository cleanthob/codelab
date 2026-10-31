"use client";

import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { cn } from "cn";

import PixIcon from "@/assets/pix.svg";
import { ArrowRight, CreditCard } from "lucide-react";
import { useState } from "react";
import { CreditCardForm } from "./credit-card";
import { PixForm } from "./pix";

type CheckoutDialogProps = {
  open: boolean;
  setOpen: (open: boolean) => void;
  course: Course;
};

const paymentMethods = [
  {
    label: "Pix",
    value: "PIX" as const,

    icon: PixIcon,
  },
  {
    label: "Cartão de crédito",
    value: "CREDIT_CARD" as const,
    icon: CreditCard,
  },
];

export const CheckoutDialog = ({
  open,
  setOpen,
  course,
}: CheckoutDialogProps) => {
  const [step, setStep] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState<"PIX" | "CREDIT_CARD">(
    "PIX",
  );

  const handleContinue = () => {
    setStep(2);
  };

  return (
    <Dialog
      open={open}
      setOpen={setOpen}
      height="95vh"
      title="Concluir compra"
      preventOutsideClick
      content={
        <div className="pt-4">
          {step === 1 && (
            <div className="flex flex-col">
              <h2 className="mb-3">Métodos de pagamento</h2>

              <div className="grid sm:grid-cols-2 gap-4">
                {paymentMethods.map((method) => (
                  <Button
                    key={method.value}
                    variant="outline"
                    onClick={() => setPaymentMethod(method.value)}
                    className={cn(
                      "h-auto w-full flex items-center p-4 justfiy-center gap-4 rounded-xl text-lg font-semibold disabled:opacity-50",
                      paymentMethod === method.value &&
                        "!bg-primary/10 text-primary !border-primary hover:text-primary",
                    )}
                  >
                    <method.icon className="w-6 min-w-6 h-6 min-h-6" />
                    {method.label}
                  </Button>
                ))}
              </div>

              <Button className="ml-auto mt-6" onClick={handleContinue}>
                Continuar <ArrowRight />
              </Button>
            </div>
          )}

          {step === 2 && paymentMethod === "CREDIT_CARD" && <CreditCardForm />}

          {step === 2 && paymentMethod === "PIX" && <PixForm />}
        </div>
      }
    />
  );
};

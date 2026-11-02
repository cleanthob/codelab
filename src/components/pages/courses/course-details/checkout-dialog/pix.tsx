"use client";

import { createPixCheckout } from "@/actions/payment";
import { Button } from "@/components/ui/button";
import { FormField } from "@/components/ui/form/field";
import { InputField } from "@/components/ui/form/input-field";
import { Form } from "@/components/ui/form/primitives";
import { Input } from "@/components/ui/input";
import { pixCheckoutFormSchema } from "@/server/schemas/payment";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

type FormData = z.infer<typeof pixCheckoutFormSchema>;

type PixFormProps = {
  onBack: () => void;
  course: Course;
};

export const PixForm = ({ onBack, course }: PixFormProps) => {
  const [step, setStep] = useState(1);

  const form = useForm<FormData>({
    resolver: zodResolver(pixCheckoutFormSchema),
    mode: "onSubmit",
    reValidateMode: "onChange",
    defaultValues: {
      cpf: "",
      name: "",
      postalCode: "",
      addressNumber: "",
    },
  });

  const { handleSubmit } = form;

  const { mutate: handleCreateInvoice, isPending: isCreatingInvoice } =
    useMutation({
      mutationFn: createPixCheckout,
      onSuccess: (result) => {
        if (!result.success) {
          toast.error(result.message);
          return;
        }

        setStep(2);
      },
      onError: () => {
        toast.error("Não foi possível gerar a cobrança. Tente novamente.");
      },
    });

  const onSubmit = (data: FormData) => {
    handleCreateInvoice({
      courseId: course.id,
      cpf: data.cpf,
      postalCode: data.postalCode,
      name: data.name,
      addressNumber: data.addressNumber,
    });
  };

  const handleBack = () => {
    if (step === 1) {
      onBack();
      return;
    }

    setStep(1);
  };

  return (
    <Form {...form}>
      <form className="flex flex-col" onSubmit={handleSubmit(onSubmit)}>
        {step === 1 ? (
          <div className="w-full">
            <h2 className="mt-2 mb-3 text-center">
              Para gerar o QR Code, por favor informe os dados abaixo:
              <span className="text-sm block opacity-50">
                (Serão utilizados apenas para emissão de nota fiscal)
              </span>
            </h2>

            <div className="w-full grid sm:grid-cols-2 gap-2">
              <InputField
                name="name"
                control={form.control}
                placeholder="Nome completo"
              />
              <InputField
                name="cpf"
                control={form.control}
                mask="___.___.___-__"
                placeholder="CPF"
              />
              <InputField
                name="postalCode"
                control={form.control}
                mask="_____-___"
                placeholder="CEP"
              />
              <FormField name="addressNumber" control={form.control}>
                {({ field }) => (
                  <Input
                    {...field}
                    onChange={({ target }) => {
                      const value = target.value.replace(/\D/g, "");
                      field.onChange(value);
                    }}
                    placeholder="Número da residência"
                  />
                )}
              </FormField>
            </div>
          </div>
        ) : (
          <div>
            <p>QR CODE DO PIX!</p>
          </div>
        )}

        <div className="mt-6 flex items-center justify-between">
          <Button variant="outline" onClick={handleBack} type="button">
            <ArrowLeft />
            Voltar
          </Button>

          {step === 1 ? (
            <Button type="submit" disabled={isCreatingInvoice}>
              Continuar
              <ArrowRight />
            </Button>
          ) : (
            <Button type="button">
              Confirmar pagamento
              <Check />
            </Button>
          )}
        </div>
      </form>
    </Form>
  );
};

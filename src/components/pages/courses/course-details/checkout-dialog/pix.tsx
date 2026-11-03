"use client";

import {
  createPixCheckout,
  getInvoiceStatus,
  getPixQrCode,
} from "@/actions/payment";
import { Button } from "@/components/ui/button";
import { FormField } from "@/components/ui/form/field";
import { InputField } from "@/components/ui/form/input-field";
import { Form } from "@/components/ui/form/primitives";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { unMockValue } from "@/lib/utils";
import { pixCheckoutFormSchema } from "@/server/schemas/payment";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { ArrowLeft, ArrowRight, Check, Copy } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

type FormData = z.infer<typeof pixCheckoutFormSchema>;

type PixFormProps = {
  onBack: () => void;
  onClose: () => void;
  course: Course;
};

export const PixForm = ({ onBack, onClose, course }: PixFormProps) => {
  const router = useRouter();
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

  const { handleSubmit, watch, setError } = form;

  const [isGenerating, setIsGenerating] = useState(true);
  const [invoiceId, setInvoiceId] = useState<string | null>(null);
  const [pixData, setPixData] = useState<PixResponse | null>(null);

  const [checkStatusIsDisabled, setCheckStatusIsDisabled] = useState(false);

  const rawCep = watch("postalCode");

  const { mutateAsync: validateCep, isPending: isValidatingCep } = useMutation({
    mutationFn: async () => {
      try {
        const cep = unMockValue(rawCep);
        const response = await axios.get(
          `https://viacep.com.br/ws/${cep}/json`,
        );

        if (response.data.erro) {
          setError("postalCode", { type: "manual", message: "CEP inválido" });
          return false;
        }

        return true;
      } catch {
        setError("postalCode", {
          type: "manual",
          message: "Erro ao validar o CEP",
        });
      }
    },
  });

  const { mutate: handleGetQrCode } = useMutation({
    mutationFn: getPixQrCode,
    onSuccess: (data) => {
      setIsGenerating(false);
      setPixData(data);
    },
  });

  const { mutateAsync: handleGetStatus, isPending: isLoading } = useMutation({
    mutationFn: getInvoiceStatus,
  });

  const { mutate: handleCreateInvoice, isPending: isCreatingInvoice } =
    useMutation({
      mutationFn: createPixCheckout,
      onSuccess: (response) => {
        if (!response.success) {
          toast.error(response.message);
          return;
        }

        setStep(2);
        setInvoiceId(response.invoiceId);
        handleGetQrCode(response.invoiceId);
      },
      onError: () => {
        toast.error("Não foi possível gerar a cobrança. Tente novamente.");
      },
    });

  const onSubmit = async (data: FormData) => {
    const isValidateCep = await validateCep();

    if (!isValidateCep) return;

    handleCreateInvoice({
      courseId: course.id,
      cpf: data.cpf,
      postalCode: data.postalCode,
      name: data.name,
      addressNumber: data.addressNumber,
    });
  };

  const handleCopy = () => {
    if (!pixData) return;

    navigator.clipboard.writeText(pixData.payload);
    toast.success("Código copiado para a área de transferência!");
  };

  const handleConfirmPayment = async () => {
    if (!invoiceId) return;

    if (checkStatusIsDisabled) {
      toast.error(
        "Aguarde alguns instantes antes de verificar novamente o status do pagamento.",
      );
      return;
    }

    setCheckStatusIsDisabled(true);
    setTimeout(() => setCheckStatusIsDisabled(false), 5000);

    const { status } = await handleGetStatus(invoiceId);

    switch (status) {
      case "PENDING":
        toast.info(
          "Pagameto em processamento. Caso o pagamento já tenha sido realizado, aguarde alguns instantes.",
        );
        break;
      case "RECEIVED":
        toast.success("Pagamento confirmado! Você já pode acessar o curso.");
        onClose();

        toast.success(
          "Agradecemos a sua compra! Você será redirecionado para o curso em instantes.",
        );
        await new Promise((resolve) => setTimeout(resolve, 4000));
        router.push(`/courses/${course.slug}`);
        break;
    }
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
          <>
            <div className="bg-primary w-[300px] aspect-square rounded-xl p-3 flex items-center justify-center mt-2 mx-auto">
              {pixData?.encodedImage && (
                <img
                  src={`data:image/png;base64,${pixData.encodedImage}`}
                  className="w-full h-full rounded-lg object-contain"
                  alt="QR Code"
                />
              )}

              {isGenerating && <Skeleton className="w-full flex-1" />}
            </div>

            <p className="my-4 px-12 text-center">
              Escaneie o QR Code acima ou copie e cole o código no aplicativo do
              seu banco para efetuar o pagamento.
            </p>

            <div className="flex gap-2 w-full max-w-[500px]">
              <Input
                placeholder="Gerando QR Code..."
                value={pixData?.payload ?? ""}
                readOnly
              />
              <Button disabled={!pixData} onClick={handleCopy}>
                Copiar
                <Copy />
              </Button>
            </div>
          </>
        )}

        <div className="mt-6 flex items-center justify-between">
          <Button variant="outline" onClick={handleBack} type="button">
            <ArrowLeft />
            Voltar
          </Button>

          {step === 1 ? (
            <Button
              type="submit"
              disabled={isCreatingInvoice || isValidatingCep}
            >
              Continuar
              <ArrowRight />
            </Button>
          ) : (
            <Button
              type="button"
              disabled={!pixData || isLoading}
              onClick={handleConfirmPayment}
            >
              Confirmar pagamento
              <Check />
            </Button>
          )}
        </div>
      </form>
    </Form>
  );
};

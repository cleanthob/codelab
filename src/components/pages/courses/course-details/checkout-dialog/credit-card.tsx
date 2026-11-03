import { createCreditCardCheckout } from "@/actions/payment";
import { Button } from "@/components/ui/button";
import { FormField } from "@/components/ui/form/field";
import { InputField } from "@/components/ui/form/input-field";
import { Form } from "@/components/ui/form/primitives";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import {
  calculateInstallmentOptions,
  formatPrice,
  unMockValue,
} from "@/lib/utils";
import { creditCardCheckoutFormSchema } from "@/server/schemas/payment";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo } from "react";
import Cards from "react-credit-cards-2";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

type FormData = z.infer<typeof creditCardCheckoutFormSchema>;

type CreditCardFormProps = {
  onBack: () => void;
  onClose: () => void;
  course: Course;
};

export const CreditCardForm = ({
  onBack,
  onClose,
  course,
}: CreditCardFormProps) => {
  const form = useForm<FormData>({
    resolver: zodResolver(creditCardCheckoutFormSchema),
    mode: "onSubmit",
    reValidateMode: "onChange",
    defaultValues: {
      installments: 1,
      cardCvv: "",
      cardNumber: "",
      cardValidThru: "",
      name: "",
      addressNumber: "",
      cpf: "",
      phone: "",
      postalCode: "",
    },
  });

  const { handleSubmit, watch, setError } = form;

  const router = useRouter();
  const formValues = watch();
  const rawCep = watch("postalCode");

  const installmentsOptions = useMemo(() => {
    return calculateInstallmentOptions(
      course?.discountPrice ?? course.price,
    ).map((option) => ({
      label: `${option.installments}x ${formatPrice(option.installmentValue)}${option.hasInterest ? "" : "(sem juros)"}`,
      value: String(option.installments),
    }));
  }, [course?.discountPrice, course.price]);

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

  const { mutateAsync: handleCheckout, isPending: isLoading } = useMutation({
    mutationFn: createCreditCardCheckout,
    onSuccess: async () => {
      toast.success("Pagamento confirmado! Você já pode acessar o curso.");
      onClose();

      toast.success(
        "Agradecemos a sua compra! Você será redirecionado para o curso em instantes.",
      );
      await new Promise((resolve) => setTimeout(resolve, 4000));
      router.push(`/courses/${course.slug}`);
    },
    onError: (error) => {
      if (error?.message.includes("NOT_AUTHORIZED")) {
        toast.error(
          "Transação não autorizada. Verifique os dados do cartão de crédito.",
        );
        return;
      }

      if (error?.message.includes("CONFLICT")) {
        toast.error("Você já possui acesso a este curso!");
        onClose();
        return;
      }

      toast.error(
        "Ocorreu um erro ao processar o pagamento. Tente novamente ou entre em contato com o suporte.",
      );
    },
  });

  const onSubmit = async (data: FormData) => {
    const isValidCep = await validateCep();

    if (!isValidCep) return;

    toast.promise(
      handleCheckout({
        ...data,
        courseId: course.id,
      }),
      {
        loading: "Processando pagamento...",
      },
    );
  };

  return (
    <Form {...form}>
      <form className="flex flex-col" onSubmit={handleSubmit(onSubmit)}>
        <div className="flex items-center gap-4 flex-col">
          <div>
            <Cards
              number={formValues.cardNumber}
              expiry={formValues.cardValidThru}
              cvc={formValues.cardCvv}
              name={formValues.name}
              placeholders={{ name: "NOME COMPLETO" }}
              locale={{ valid: "Válido até" }}
            />
          </div>

          <div className="w-full grid sm:grid-cols-2 gap-2 flex-1">
            <div className="col-span-full">
              <InputField name="name" placeholder="Nome impresso no cartão" />
            </div>
            <InputField
              name="cpf"
              placeholder="CPF do titular"
              mask="___.___.___-__"
            />
            <FormField name="phone">
              {({ field }) => (
                <Input
                  {...field}
                  onChange={({ target }) => {
                    const value = target.value.replace(/\D/g, "");
                    field.onChange(value);
                  }}
                  placeholder="Telefone do titular com DDD"
                />
              )}
            </FormField>
            <Separator className="col-span-full my-1 sm:my-2" />

            <InputField
              name="cardNumber"
              placeholder="Número do cartão"
              mask="____ ____ ____ ____"
            />
            <InputField
              name="cardValidThru"
              placeholder="Validade"
              mask="__/__"
            />
            <InputField name="cardCvv" placeholder="CVV" mask="___" />

            <FormField name="installments">
              {({ field }) => (
                <Select
                  value={String(field.value)}
                  onChange={(value) => field.onChange(Number(value))}
                  options={installmentsOptions}
                  placeholder="Parcelas"
                />
              )}
            </FormField>
            <Separator className="col-span-full my-1 sm:my-2" />
            <div className="col-span-full grid sm:grid-cols-[1.4fr]_1fr_1fr gap-2">
              <InputField name="address" placeholder="Endereço (opcional)" />
              <InputField name="addressNumber" placeholder="Número" />
              <InputField
                name="postalCode"
                placeholder="CEP"
                mask="_____-___"
              />
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between mt-6">
          <Button variant="outline" type="button" onClick={onBack}>
            <ArrowLeft />
            Voltar
          </Button>

          <Button type="submit" disabled={isLoading || isValidatingCep}>
            Confirmar
            <ArrowRight />
          </Button>
        </div>
      </form>
    </Form>
  );
};

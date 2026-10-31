import { Button } from "@/components/ui/button";
import { FormField } from "@/components/ui/form/field";
import { InputField } from "@/components/ui/form/input-field";
import { Form } from "@/components/ui/form/primitives";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { creditCardCheckoutFormSchema } from "@/server/schemas/payment";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import Cards from "react-credit-cards-2";

type FormData = z.infer<typeof creditCardCheckoutFormSchema>;

export const CreditCardForm = () => {
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

  const { handleSubmit, watch } = form;

  const formValues = watch();

  const onSubmit = (data: FormData) => {
    console.log(data);
  };

  const installmentsOptions = Array.from({ length: 12 }, (_, i) => ({
    label: `${i + 1}x`,
    value: `${i + 1}`,
  }));

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
            <InputField
              name="name"
              placeholder="Nome impresso no cartão"
              className="col-span-full"
            />
            <InputField name="cpf" placeholder="CPF do titular" />
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

            <InputField name="cardNumber" placeholder="Número do cartão" />
            <InputField name="cardValidThru" placeholder="Validade" />
            <InputField name="cardCvv" placeholder="CVV" />

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
              <InputField name="postalCode" placeholder="CEP" />
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between mt-6">
          <Button variant="outline">
            <ArrowLeft />
            Voltar
          </Button>

          <Button type="submit">
            Continuar
            <ArrowRight />
          </Button>
        </div>
      </form>
    </Form>
  );
};

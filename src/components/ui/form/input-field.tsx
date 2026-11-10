"use client";

import { ComponentProps } from "react";
import { FieldPath, FieldValues, Control } from "react-hook-form";

import { Input } from "../input";
import { FormField } from "./field";
import { InputMask } from "@react-input/mask";

type InputFieldProps<T extends FieldValues> = Omit<
  ComponentProps<typeof Input>,
  "name"
> & {
  name: FieldPath<T>;
  control?: Control<T>;
  label?: string;
  required?: boolean;
  className?: string;
  mask?: string;
};

export const InputField = <T extends FieldValues>({
  name,
  className,
  mask,
  ...props
}: InputFieldProps<T>) => {
  return (
    <FormField<T> name={name} className={className} {...props}>
      {({ field }) =>
        mask ? (
          <InputMask
            mask={mask}
            component={Input}
            replacement={{ _: /\d/ }}
            {...field}
            {...props}
          />
        ) : (
          <Input {...field} {...props} />
        )
      }
    </FormField>
  );
};

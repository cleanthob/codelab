"use client";

import type { ComponentProps } from "react";
import type { Control, FieldPath, FieldValues } from "react-hook-form";

import { InputMask } from "@react-input/mask";
import { Input } from "../input";
import { FormField } from "./field";

type InputFieldProps<T extends FieldValues> = Omit<
  ComponentProps<typeof Input>,
  "name"
> & {
  name: FieldPath<T>;
  control: Control<T>;
  mask?: string;
};

export const InputField = <T extends FieldValues>({
  name,
  className,
  mask,
  control,
  ...props
}: InputFieldProps<T>) => {
  return (
    <FormField<T> name={name} className={className} control={control}>
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

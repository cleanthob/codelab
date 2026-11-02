"use client";

import { ReactElement } from "react";
import {
  Control,
  ControllerFieldState,
  ControllerRenderProps,
  FieldPath,
  FieldValues,
} from "react-hook-form";
import { Input } from "../input";
import {
  FormControl,
  FormField as FormFieldPrimitive,
  FormItem,
  FormLabel,
  FormMessage,
} from "./primitives";

export type FormFieldProps<TFieldValues extends FieldValues> = {
  name: FieldPath<TFieldValues>;
  label?: string;
  required?: boolean;
  className?: string;
  control: Control<TFieldValues>;
  children?: (params: {
    field: ControllerRenderProps<TFieldValues, FieldPath<TFieldValues>>;
    fieldState: ControllerFieldState;
  }) => ReactElement;
};

export const FormField = <TFieldValues extends FieldValues>({
  name,
  label,
  control,
  children,
  ...props
}: FormFieldProps<TFieldValues>) => {
  return (
    <FormFieldPrimitive<TFieldValues, FieldPath<TFieldValues>>
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <FormItem>
          {label && <FormLabel htmlFor={name}>{label}</FormLabel>}
          <FormControl>
            {children ? (
              children({ field, fieldState })
            ) : (
              <Input {...field} {...props} id={name} />
            )}
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

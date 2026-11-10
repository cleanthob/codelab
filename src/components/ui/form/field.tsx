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

export type FormFieldProps<T extends FieldValues> = {
  name: FieldPath<T>;
  label?: string;
  required?: boolean;
  className?: string;
  control?: Control<T>;
  children?: (params: {
    field: ControllerRenderProps<T, FieldPath<T>>;
    fieldState: ControllerFieldState;
  }) => ReactElement;
};

export const FormField = <T extends FieldValues>({
  name,
  label,
  className,
  control,
  children,
  ...props
}: FormFieldProps<T>) => {
  return (
    <FormFieldPrimitive
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <FormItem className={className}>
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

import { Field, Input, type InputProps } from '@chakra-ui/react';
import { type ChangeEventHandler, type FocusEventHandler, type ReactNode } from 'react';
import {
  useController,
  type Control,
  type FieldPath,
  type FieldValues,
  type RegisterOptions,
} from 'react-hook-form';
import FormFieldMeta from './FormFieldMeta';

type ValidationRules<
  TFieldValues extends FieldValues,
  TName extends FieldPath<TFieldValues>,
> = Omit<
  RegisterOptions<TFieldValues, TName>,
  'disabled' | 'setValueAs' | 'valueAsNumber' | 'valueAsDate'
>;

export interface InputFieldProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> extends Omit<InputProps, 'name' | 'defaultValue' | 'value'> {
  name: TName;
  control?: Control<TFieldValues>;
  label?: ReactNode;
  helperText?: ReactNode;
  rules?: ValidationRules<TFieldValues, TName>;
  isRequired?: boolean;
}

const InputField = <
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({
  name,
  control,
  label,
  helperText,
  rules,
  isRequired = false,
  onChange,
  onBlur,
  ...inputProps
}: InputFieldProps<TFieldValues, TName>) => {
  const {
    field: { name: fieldName, value, ref, onChange: onFieldChange, onBlur: onFieldBlur },
    fieldState: { invalid, error },
  } = useController({
    name,
    control,
    rules,
  });

  const fieldId = String(name);

  const handleChange: ChangeEventHandler<HTMLInputElement> = (event) => {
    onFieldChange(event);
    onChange?.(event);
  };

  const handleBlur: FocusEventHandler<HTMLInputElement> = (event) => {
    onFieldBlur();
    onBlur?.(event);
  };

  return (
    <Field.Root
      invalid={invalid}
      required={isRequired}
    >
      {label ? <Field.Label htmlFor={fieldId}>{label}</Field.Label> : null}
      <Input
        {...inputProps}
        id={fieldId}
        name={fieldName}
        value={value ?? ''}
        onChange={handleChange}
        onBlur={handleBlur}
        ref={ref}
      />
      <FormFieldMeta
        error={error}
        helperText={helperText}
      />
    </Field.Root>
  );
};

export default InputField;

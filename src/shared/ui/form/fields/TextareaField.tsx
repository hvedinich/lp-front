import { Field, Textarea, type TextareaProps } from '@chakra-ui/react';
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

export interface TextareaFieldProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> extends Omit<TextareaProps, 'name' | 'defaultValue' | 'value'> {
  name: TName;
  control?: Control<TFieldValues>;
  label?: ReactNode;
  helperText?: ReactNode;
  rules?: ValidationRules<TFieldValues, TName>;
  isRequired?: boolean;
}

const TextareaField = <
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
  ...textareaProps
}: TextareaFieldProps<TFieldValues, TName>) => {
  const {
    field: { name: fieldName, value, ref, onChange: onFieldChange, onBlur: onFieldBlur },
    fieldState: { invalid, error },
  } = useController({
    name,
    control,
    rules,
  });

  const fieldId = String(name);

  const handleChange: ChangeEventHandler<HTMLTextAreaElement> = (event) => {
    onFieldChange(event);
    onChange?.(event);
  };

  const handleBlur: FocusEventHandler<HTMLTextAreaElement> = (event) => {
    onFieldBlur();
    onBlur?.(event);
  };

  return (
    <Field.Root
      invalid={invalid}
      required={isRequired}
    >
      {label ? <Field.Label htmlFor={fieldId}>{label}</Field.Label> : null}
      <Textarea
        {...textareaProps}
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

export default TextareaField;

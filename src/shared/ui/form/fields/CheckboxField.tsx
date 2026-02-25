import { Checkbox, Field, type CheckboxCheckedChangeDetails } from '@chakra-ui/react';
import { type ReactNode } from 'react';
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

export interface CheckboxFieldProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> {
  name: TName;
  control?: Control<TFieldValues>;
  label: ReactNode;
  helperText?: ReactNode;
  rules?: ValidationRules<TFieldValues, TName>;
  isRequired?: boolean;
}

const CheckboxField = <
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({
  name,
  control,
  label,
  helperText,
  rules,
  isRequired = false,
}: CheckboxFieldProps<TFieldValues, TName>) => {
  const {
    field: { name: fieldName, value, ref, onChange, onBlur },
    fieldState: { invalid, error },
  } = useController({
    name,
    control,
    rules,
  });

  const fieldId = String(name);
  const checked = value === true;

  const handleCheckedChange = ({ checked: nextChecked }: CheckboxCheckedChangeDetails) => {
    onChange(nextChecked === true);
  };

  return (
    <Field.Root
      invalid={invalid}
      required={isRequired}
    >
      <Checkbox.Root
        checked={checked}
        onCheckedChange={handleCheckedChange}
      >
        <Checkbox.HiddenInput
          id={fieldId}
          name={fieldName}
          onBlur={onBlur}
          ref={ref}
        />
        <Checkbox.Control>
          <Checkbox.Indicator />
        </Checkbox.Control>
        <Checkbox.Label>{label}</Checkbox.Label>
      </Checkbox.Root>
      <FormFieldMeta
        error={error}
        helperText={helperText}
      />
    </Field.Root>
  );
};

export default CheckboxField;

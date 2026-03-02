import {
  Checkbox,
  Field,
  type FieldRootProps,
  type CheckboxCheckedChangeDetails,
} from '@chakra-ui/react';
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
> extends Omit<FieldRootProps, 'children'> {
  name: TName;
  control?: Control<TFieldValues>;
  label: ReactNode;
  helperText?: ReactNode;
  rules?: ValidationRules<TFieldValues, TName>;
  isRequired?: boolean;
  checkboxProps?: Omit<React.ComponentProps<typeof Checkbox.Root>, 'checked' | 'onCheckedChange'>;
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
  checkboxProps,
  ...rest
}: CheckboxFieldProps<TFieldValues, TName>) => {
  const {
    field: { name: fieldName, value, ref, onChange, onBlur },
    fieldState: { invalid, error },
  } = useController({
    name,
    control,
    rules,
  });

  const checked = value === true;

  const handleCheckedChange = ({ checked: nextChecked }: CheckboxCheckedChangeDetails) => {
    onChange(nextChecked === true);
  };

  return (
    <Field.Root
      invalid={invalid}
      required={isRequired}
      {...rest}
    >
      <Checkbox.Root
        checked={checked}
        onCheckedChange={handleCheckedChange}
        {...checkboxProps}
      >
        <Checkbox.HiddenInput
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

import { Field, NativeSelect } from '@chakra-ui/react';
import { type ChangeEventHandler, type ComponentProps, type ReactNode } from 'react';
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

export interface SelectOption {
  label: string;
  value: string;
  disabled?: boolean;
}

type NativeSelectRootProps = ComponentProps<typeof NativeSelect.Root>;
type NativeSelectFieldProps = ComponentProps<typeof NativeSelect.Field>;

export interface SelectFieldProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> extends Omit<NativeSelectFieldProps, 'name' | 'defaultValue' | 'value'> {
  name: TName;
  control?: Control<TFieldValues>;
  label?: ReactNode;
  helperText?: ReactNode;
  rules?: ValidationRules<TFieldValues, TName>;
  isRequired?: boolean;
  placeholder?: string;
  options: readonly SelectOption[];
  rootProps?: Omit<NativeSelectRootProps, 'invalid' | 'required'>;
}

const SelectField = <
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({
  name,
  control,
  label,
  helperText,
  rules,
  isRequired = false,
  options,
  placeholder,
  rootProps,
  onChange,
  ...selectProps
}: SelectFieldProps<TFieldValues, TName>) => {
  const {
    field: { name: fieldName, value, ref, onChange: onFieldChange, onBlur: onFieldBlur },
    fieldState: { invalid, error },
  } = useController({
    name,
    control,
    rules,
  });

  const fieldId = String(name);

  const handleChange: ChangeEventHandler<HTMLSelectElement> = (event) => {
    onFieldChange(event);
    onChange?.(event);
  };

  return (
    <Field.Root
      invalid={invalid}
      required={isRequired}
    >
      {label ? <Field.Label htmlFor={fieldId}>{label}</Field.Label> : null}
      <NativeSelect.Root
        invalid={invalid}
        {...rootProps}
      >
        <NativeSelect.Field
          {...selectProps}
          id={fieldId}
          name={fieldName}
          value={value ?? ''}
          onChange={handleChange}
          onBlur={onFieldBlur}
          ref={ref}
        >
          {placeholder ? <option value=''>{placeholder}</option> : null}
          {options.map((option) => (
            <option
              key={option.value}
              disabled={option.disabled}
              value={option.value}
            >
              {option.label}
            </option>
          ))}
        </NativeSelect.Field>
        <NativeSelect.Indicator />
      </NativeSelect.Root>
      <FormFieldMeta
        error={error}
        helperText={helperText}
      />
    </Field.Root>
  );
};

export default SelectField;

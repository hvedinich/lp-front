import { Button, Field, Flex, Input, Menu } from '@chakra-ui/react';
import { type ChangeEvent, type ReactNode, useState } from 'react';
import {
  useController,
  type Control,
  type FieldPath,
  type FieldValues,
  type RegisterOptions,
} from 'react-hook-form';
import FormFieldMeta from './FormFieldMeta';
import ReactCountryFlag from 'react-country-flag';
import { applyPhoneMask, PHONE_COUNTRIES, maskDigitCount } from '@/shared/lib';

type ValidationRules<
  TFieldValues extends FieldValues,
  TName extends FieldPath<TFieldValues>,
> = Omit<
  RegisterOptions<TFieldValues, TName>,
  'disabled' | 'setValueAs' | 'valueAsNumber' | 'valueAsDate'
>;

export interface PhoneFieldProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> {
  name: TName;
  control?: Control<TFieldValues>;
  label?: ReactNode;
  helperText?: ReactNode;
  rules?: ValidationRules<TFieldValues, TName>;
  isRequired?: boolean;
  defaultCountry?: string;
}

const PhoneField = <
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({
  name,
  control,
  label,
  helperText,
  rules,
  isRequired = false,
  defaultCountry = 'us',
}: PhoneFieldProps<TFieldValues, TName>) => {
  const {
    field,
    fieldState: { invalid, error },
  } = useController({ name, control, rules });

  const [countryCode, setCountryCode] = useState(defaultCountry);
  const country = PHONE_COUNTRIES.find((c) => c.code === countryCode) ?? PHONE_COUNTRIES[0]!;

  const storedValue = String(field.value ?? '');
  const localDigits = storedValue.startsWith(`+${country.dialCode}`)
    ? storedValue.slice(country.dialCode.length + 1)
    : '';

  const displayValue = applyPhoneMask(localDigits, country.mask);

  const handleCountryChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const newCode = e.target.value;
    const newCountry = PHONE_COUNTRIES.find((c) => c.code === newCode)!;

    const trimmed = localDigits.slice(0, maskDigitCount(newCountry.mask));
    setCountryCode(newCode);
    field.onChange(trimmed ? `+${newCountry.dialCode}${trimmed}` : '');
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const digits = e.target.value.replace(/\D/g, '').slice(0, maskDigitCount(country.mask));
    field.onChange(digits ? `+${country.dialCode}${digits}` : '');
  };

  return (
    <Field.Root
      w='full'
      invalid={invalid}
      required={isRequired}
    >
      {label ? <Field.Label>{label}</Field.Label> : null}

      <Flex w='full'>
        <Menu.Root>
          <Menu.Trigger>
            <Button
              borderTopRightRadius='none'
              borderBottomRightRadius='none'
              variant='outline'
              bg='bg.input'
              borderColor='border.muted'
              px='3'
              alignItems='center'
            >
              <ReactCountryFlag
                svg
                countryCode={countryCode}
                style={{ marginTop: '2px' }}
              />
              {`+${country.dialCode}`}
            </Button>
          </Menu.Trigger>
          <Menu.Positioner>
            <Menu.Content>
              {PHONE_COUNTRIES.map((c) => (
                <Menu.Item
                  key={c.code}
                  value={c.code}
                  onSelect={() =>
                    handleCountryChange({
                      target: { value: c.code },
                    } as React.ChangeEvent<HTMLSelectElement>)
                  }
                >
                  <ReactCountryFlag
                    svg
                    countryCode={c.code}
                  />
                  {c.name} {`(+${c.dialCode})`}
                </Menu.Item>
              ))}
            </Menu.Content>
          </Menu.Positioner>
        </Menu.Root>

        <Input
          flexGrow={1}
          ref={field?.ref}
          type='tel'
          value={displayValue}
          onChange={handleInputChange}
          onBlur={field?.onBlur}
          flex={1}
          borderTopLeftRadius='none'
          borderBottomLeftRadius='none'
          borderLeft='[none]'
        />
      </Flex>

      <FormFieldMeta
        error={error}
        helperText={helperText}
      />
    </Field.Root>
  );
};

export default PhoneField;

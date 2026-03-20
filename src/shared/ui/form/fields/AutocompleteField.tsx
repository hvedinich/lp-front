import { Combobox, createListCollection, Field, InputProps, Spinner } from '@chakra-ui/react';
import { SearchIcon } from 'lucide-react';
import { useMemo, useRef, useState, type ReactNode } from 'react';
import {
  useController,
  type Control,
  type FieldError,
  type FieldPath,
  type FieldValues,
  type RegisterOptions,
} from 'react-hook-form';
import FormFieldMeta from './FormFieldMeta';
import { ArrowDownIcon } from '../../icons';

export interface AutocompleteOption {
  value: string;
  label: string;
}

export type ValidationRules<
  TFieldValues extends FieldValues,
  TName extends FieldPath<TFieldValues>,
> = Omit<
  RegisterOptions<TFieldValues, TName>,
  'disabled' | 'setValueAs' | 'valueAsNumber' | 'valueAsDate'
>;

export interface AutocompleteFieldProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> {
  name: TName;
  control?: Control<TFieldValues>;
  rules?: ValidationRules<TFieldValues, TName>;
  options: AutocompleteOption[];
  isLoading?: boolean;
  onSearch?: (query: string) => void;
  onSelect?: (option: AutocompleteOption) => void;
  id?: string;
  isRequired?: boolean;
  label?: ReactNode;
  helperText?: ReactNode;
  error?: FieldError;
  placeholder?: string;
  debounceMs?: number;
  minChars?: number;
  inputProps?: InputProps;
}

const AutocompleteField = <
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({
  options,
  isLoading = false,
  onSearch,
  onSelect,
  id,
  label,
  isRequired,
  helperText,
  placeholder,
  debounceMs = 300,
  minChars = 2,
  name,
  control,
  rules,
  inputProps,
}: AutocompleteFieldProps<TFieldValues, TName>) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const {
    field: { onChange, value, ref },
    fieldState: { invalid, error },
  } = useController({ name, control, rules });

  const collection = useMemo(() => createListCollection({ items: options }), [options]);

  // While open show what the user typed; once closed show the selected label.
  const inputValue = isOpen ? searchQuery : (value?.label ?? '');

  const handleInputValueChange = ({ inputValue: query }: { inputValue: string }) => {
    setSearchQuery(query);
    onChange({ value: value?.value ?? '', label: query });

    if (query.length < minChars) return;

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      onSearch?.(query);
    }, debounceMs);
  };

  const handleValueChange = ({ value: selected }: { value: string[] }) => {
    const option = options.find((o) => o.value === selected[0]);
    if (!option) return;
    onChange(option);
    onSelect?.(option);
    setSearchQuery('');
  };

  const handleOpenChange = ({ open }: { open: boolean }) => {
    setIsOpen(open);
    if (!open) setSearchQuery('');
  };

  return (
    <Field.Root
      invalid={invalid}
      required={isRequired}
      onClick={(e) => e.stopPropagation()}
    >
      {label ? <Field.Label htmlFor={id}>{label}</Field.Label> : null}

      <Combobox.Root
        collection={collection}
        value={value?.value ? [value.value] : []}
        inputValue={inputValue}
        open={isOpen}
        onInputValueChange={handleInputValueChange}
        onValueChange={handleValueChange}
        onOpenChange={handleOpenChange}
        closeOnSelect
        openOnChange
        variant='outline'
        w='full'
      >
        <Combobox.Control>
          <Combobox.Input
            id={id}
            ref={ref}
            placeholder={placeholder}
            w='full'
            value={inputValue}
            {...inputProps}
          />
          <Combobox.IndicatorGroup>
            {isLoading ? (
              <Spinner size='sm' />
            ) : onSearch ? (
              <SearchIcon
                width='16'
                height='16'
              />
            ) : (
              <Combobox.Trigger>
                <ArrowDownIcon boxSize='5' />
              </Combobox.Trigger>
            )}
          </Combobox.IndicatorGroup>
        </Combobox.Control>

        <Combobox.Positioner>
          <Combobox.Content borderRadius='2xl'>
            <Combobox.Empty />
            {options.map((option) => (
              <Combobox.Item
                key={option.value}
                item={option}
              >
                <Combobox.ItemText>{option.label}</Combobox.ItemText>
              </Combobox.Item>
            ))}
          </Combobox.Content>
        </Combobox.Positioner>
      </Combobox.Root>

      <FormFieldMeta
        error={error}
        helperText={helperText}
      />
    </Field.Root>
  );
};

export default AutocompleteField;

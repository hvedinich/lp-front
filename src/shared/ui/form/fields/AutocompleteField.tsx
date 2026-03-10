import {
  Box,
  Field,
  Input,
  InputGroup,
  InputGroupProps,
  InputProps,
  Spinner,
  Text,
} from '@chakra-ui/react';
import { SearchIcon } from 'lucide-react';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import {
  useController,
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
  rules?: ValidationRules<TFieldValues, TName>;
  options: AutocompleteOption[];
  isLoading?: boolean;
  onSearch?: (query: string) => void;
  onSelect?: (option: AutocompleteOption) => void;
  id?: string;
  invalid?: boolean;
  isRequired?: boolean;
  label?: ReactNode;
  helperText?: ReactNode;
  error?: FieldError;
  placeholder?: string;
  debounceMs?: number;
  minChars?: number;
  startElement?: ReactNode;
  inputProps?: InputProps;
  inputGroupProps?: Omit<InputGroupProps, 'children'>;
}

const AutocompleteField = ({
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
  rules,
  inputGroupProps,
  inputProps,
}: AutocompleteFieldProps) => {
  const [isClosed, setIsClosed] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const {
    field: { onChange, value, ref },
    fieldState: { invalid, error },
  } = useController({ name, rules });

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsClosed(true);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInputChange = (value: string) => {
    onChange(value);
    setIsClosed(false);

    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (value.length < minChars) {
      return;
    }

    debounceRef.current = setTimeout(() => {
      onSearch?.(value);
    }, debounceMs);
  };

  const handleSelect = (option: AutocompleteOption) => {
    setIsClosed(true);
    onChange(option);
    onSelect?.(option);
  };

  const rightIcon = onSearch ? (
    <SearchIcon
      width='16'
      height='16'
    />
  ) : (
    <ArrowDownIcon
      boxSize='5'
      transition='common'
      transform={`rotate(${isClosed ? '0deg' : '180deg'})`}
    />
  );

  return (
    <Field.Root
      invalid={invalid}
      required={isRequired}
      onClick={(e) => e.stopPropagation()}
    >
      {label ? <Field.Label htmlFor={id}>{label}</Field.Label> : null}
      <Box
        ref={containerRef}
        position='relative'
        w='full'
        onClick={() => setIsClosed((prev) => !prev)}
      >
        <InputGroup
          endElement={isLoading ? <Spinner size='sm' /> : rightIcon}
          {...inputGroupProps}
        >
          <Input
            id={id}
            ref={ref}
            value={value?.label}
            onChange={(e) => handleInputChange(e.target.value)}
            placeholder={placeholder}
            w='full'
            {...inputProps}
          />
        </InputGroup>

        {!isClosed && options.length > 0 && (
          <Box
            position='absolute'
            w='full'
            mt='1'
            bg='white'
            borderWidth='thin'
            borderColor='gray.200'
            borderRadius='2xl'
            zIndex='dropdown'
            shadow='md'
            maxH='60'
            overflowY='auto'
          >
            {options.map((option) => (
              <Box
                key={option.value}
                px='4'
                py='3'
                cursor='button'
                _hover={{ bg: 'gray.50' }}
                borderBottomWidth='thin'
                borderColor='gray.100'
                _last={{ borderBottomWidth: 'none' }}
                onClick={() => handleSelect(option)}
              >
                <Text
                  color={value.value === option.value ? 'fg.brand' : 'gray.900'}
                  fontWeight='medium'
                >
                  {option.label}
                </Text>
              </Box>
            ))}
          </Box>
        )}
      </Box>

      <FormFieldMeta
        error={error}
        helperText={helperText}
      />
    </Field.Root>
  );
};

export default AutocompleteField;

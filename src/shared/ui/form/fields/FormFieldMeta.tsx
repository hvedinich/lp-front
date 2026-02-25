import { Field } from '@chakra-ui/react';
import { type ReactNode } from 'react';
import { type FieldError } from 'react-hook-form';

interface FormFieldMetaProps {
  error?: FieldError;
  helperText?: ReactNode;
}

const getErrorMessage = (error?: FieldError): string | null => {
  if (!error) {
    return null;
  }

  if (typeof error.message === 'string') {
    return error.message;
  }

  return 'Invalid value';
};

const FormFieldMeta = ({ error, helperText }: FormFieldMetaProps) => {
  const errorMessage = getErrorMessage(error);

  if (errorMessage) {
    return <Field.ErrorText>{errorMessage}</Field.ErrorText>;
  }

  if (helperText) {
    return <Field.HelperText>{helperText}</Field.HelperText>;
  }

  return null;
};

export default FormFieldMeta;

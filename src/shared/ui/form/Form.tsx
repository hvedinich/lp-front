import { Stack, chakra, type StackProps } from '@chakra-ui/react';
import { type ReactNode } from 'react';
import {
  FormProvider,
  type FieldValues,
  type SubmitHandler,
  type UseFormReturn,
} from 'react-hook-form';

interface FormProps<TFormValues extends FieldValues> extends Omit<StackProps, 'onSubmit'> {
  children: ReactNode;
  methods: UseFormReturn<TFormValues>;
  onSubmit: SubmitHandler<TFormValues>;
  formId?: string;
}

const Form = <TFormValues extends FieldValues>({
  children,
  methods,
  onSubmit,
  formId,
  ...layoutProps
}: FormProps<TFormValues>) => {
  return (
    <FormProvider {...methods}>
      <chakra.form
        id={formId}
        noValidate
        onSubmit={methods.handleSubmit(onSubmit)}
      >
        <Stack
          width='full'
          gap={4}
          {...layoutProps}
        >
          {children}
        </Stack>
      </chakra.form>
    </FormProvider>
  );
};

export default Form;

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
  const submitHandler = methods.handleSubmit(onSubmit);

  return (
    <FormProvider {...methods}>
      <Stack
        asChild
        width='full'
        gap='4'
        {...layoutProps}
      >
        <chakra.form
          id={formId}
          noValidate
          onSubmit={(event) => {
            void submitHandler(event).catch(() => {
              // Submit errors are surfaced through RHF and mutation state in the UI.
            });
          }}
        >
          {children}
        </chakra.form>
      </Stack>
    </FormProvider>
  );
};

export default Form;

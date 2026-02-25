import { zodResolver } from '@hookform/resolvers/zod';
import {
  useForm,
  type FieldValues,
  type Resolver,
  type UseFormProps,
  type UseFormReturn,
} from 'react-hook-form';
import { z } from 'zod';

export interface UseZodFormOptions<TFormValues extends FieldValues>
  extends Omit<UseFormProps<TFormValues>, 'resolver'> {
  schema: z.ZodTypeAny;
}

export const useZodForm = <TFormValues extends FieldValues>({
  schema,
  ...formOptions
}: UseZodFormOptions<TFormValues>): UseFormReturn<TFormValues> => {
  const resolver = zodResolver(schema as never) as Resolver<TFormValues>;

  return useForm<TFormValues>({
    ...formOptions,
    resolver,
  });
};

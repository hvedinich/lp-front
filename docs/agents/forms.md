# LP Forms Architecture

## 1. Goal

Define one standard way to build forms in the LP application with:

- Chakra UI v3 inputs
- typed validation
- predictable API integration
- FSD-compliant boundaries

## 2. Chosen Stack

- `react-hook-form` for form state and submission lifecycle
- `zod` + `@hookform/resolvers/zod` for schema validation
- Chakra v3 primitives (`Field`, `Input`, `Textarea`, `NativeSelect`, `Checkbox`) for UI

## 3. Why This Option

- low re-render overhead (RHF controller pattern)
- strict runtime + compile-time validation from one schema
- reusable shared field wrappers without domain leakage
- easy integration with React Query mutations in `features`/`entities`

## 4. Standard File Template

```txt
src/
  shared/
    lib/
      form/
        useZodForm.ts
        index.ts
    ui/
      form/
        Form.tsx
        fields/
          InputField.tsx
          TextareaField.tsx
          SelectField.tsx
          CheckboxField.tsx
          FormFieldMeta.tsx
          index.ts
        index.ts
  features/
    <feature-name>/
      model/
        <feature-name>.schema.ts
        <feature-name>.types.ts
      api/
        <feature-name>.mutation.ts
      ui/
        <FeatureName>Form.tsx
      index.ts
```

## 5. Rules

1. Validation schema lives in `features/*/model` or `entities/*/model`, never in `shared/ui`.
2. `shared/ui/form` can contain only generic field logic and visual composition.
3. API calls are forbidden in field components and page components.
4. Submission handlers call feature/entity React Query mutations only.
5. All cross-slice imports must go through `index.ts` public APIs.
6. DTO-to-domain mapping stays in `entities/*/lib/*mapper.ts`.
7. After successful create/update mutation, show a success toast in form UI using i18n message keys.
8. If submit logic catches a mutation/navigation error for local cleanup, it must rethrow the error so `react-hook-form` preserves failed-submit state (`isSubmitSuccessful`, submit count, etc.).

## 6. Form Lifecycle Standard

1. Define `zod` schema and defaults.
2. Initialize form with `useZodForm({ schema, defaultValues })`.
3. Render fields from `@/shared/ui/form`.
4. Submit in `feature` UI and call mutation hook.
5. Map server errors to form errors with `setError` when needed.
6. Do not swallow rejected submit promises; rethrow after any local cleanup.

## 7. Example Usage

```tsx
const methods = useZodForm({
  schema: campaignSchema,
  defaultValues: {
    companyName: '',
    contactEmail: '',
  },
});

return (
  <Form
    methods={methods}
    onSubmit={onSubmit}
  >
    <InputField
      name='companyName'
      label='Company Name'
      isRequired
    />
    <InputField
      name='contactEmail'
      label='Contact Email'
      type='email'
      isRequired
    />
    <Button type='submit'>Save</Button>
  </Form>
);
```

## 8. Do / Do Not

Do:

- keep fields in `shared/ui/form` generic and typed
- keep domain behavior in `features`/`entities`
- keep query keys and mutations in domain slices
- rethrow submit errors after local cleanup so RHF can treat the submission as failed

Do not:

- import feature/entity modules inside shared form fields
- call `fetch`/`axios` inside page UI for form submission
- bypass schema validation with ad-hoc inline checks
- swallow mutation errors inside form submit handlers

import {
  createToaster,
  HStack,
  Stack,
  Toast,
  Toaster,
  type CreateToasterProps,
} from '@chakra-ui/react';

const toasterOptions: CreateToasterProps = {
  max: 5,
  overlap: false,
  placement: 'top',
};

export const toaster = createToaster(toasterOptions);

export function AppToaster() {
  return (
    <Toaster toaster={toaster}>
      {(toast) => (
        <Toast.Root width={{ base: 'xs', md: 'sm' }}>
          <HStack align='start'>
            <Toast.Indicator mt='0.5' />
            <Stack
              flex='1'
              gap='1'
            >
              {toast.title ? <Toast.Title>{toast.title}</Toast.Title> : null}
              {toast.description ? (
                <Toast.Description>{toast.description}</Toast.Description>
              ) : null}
            </Stack>
            <Toast.CloseTrigger />
          </HStack>
        </Toast.Root>
      )}
    </Toaster>
  );
}

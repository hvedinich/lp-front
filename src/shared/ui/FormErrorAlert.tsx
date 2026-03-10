import { Box, Text } from '@chakra-ui/react';

interface FormErrorAlertProps {
  message: string | null;
  testId?: string;
}

export function FormErrorAlert({ message, testId }: FormErrorAlertProps) {
  if (!message) {
    return null;
  }

  return (
    <Box
      data-testid={testId}
      borderWidth='thin'
      borderRadius='card'
      borderColor='border.error'
      bg='bg.error'
      p='4'
    >
      <Text color='fg.error'>{message}</Text>
    </Box>
  );
}

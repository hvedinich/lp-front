import { Box, Text } from '@chakra-ui/react';

interface FormErrorAlertProps {
  message: string | null;
}

export function FormErrorAlert({ message }: FormErrorAlertProps) {
  if (!message) {
    return null;
  }

  return (
    <Box
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

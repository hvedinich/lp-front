import { FlexProps, Flex, Heading, Text } from '@chakra-ui/react';

interface BlockHeadingProps extends FlexProps {
  title: string;
  description?: string;
}

export function BlockHeading({ title, description, ...props }: BlockHeadingProps) {
  return (
    <Flex
      flexDir='column'
      gap='2'
      textAlign='center'
      {...props}
    >
      <Heading size='2xl'>{title}</Heading>
      {description && <Text fontWeight='light'>{description} </Text>}
    </Flex>
  );
}

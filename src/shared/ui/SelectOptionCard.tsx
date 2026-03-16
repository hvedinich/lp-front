import { Box, Card, CardRootProps, Flex, Heading, Text, chakra } from '@chakra-ui/react';

type SelectOptionCardProps = {
  title?: string;
  description?: string;
  subDescription?: string;
  isSelected: boolean;
  onSelect: () => void;
} & Omit<CardRootProps, 'borderColor'>;

export function SelectOptionCard({
  title,
  description,
  isSelected,
  onSelect,
  subDescription,
  children,
  ...props
}: SelectOptionCardProps) {
  return (
    <chakra.button>
      <Card.Root
        borderColor={isSelected ? 'border.focus' : 'border.muted'}
        cursor='button'
        p='6'
        borderWidth='thin'
        transition='opacity'
        onClick={onSelect}
        {...props}
      >
        {children}
        <Flex
          flexDir='column'
          flexGrow={1}
          gap='1'
        >
          <Heading size='md'>{title}</Heading>
          <Box
            p='1'
            position='absolute'
            right='3'
            top='3'
            boxSize={4}
            display={isSelected ? 'block' : 'none'}
            borderRadius='full'
            bg='bg.inverted'
          >
            <Box
              bg='bg.subtle'
              boxSize={2}
              borderRadius='full'
            />
          </Box>

          {(description || subDescription) && (
            <Flex flexDir='column'>
              <Text
                lineHeight='short'
                fontWeight='light'
              >
                {description}
              </Text>
              {subDescription && (
                <Text
                  fontSize='sm'
                  fontWeight='light'
                >
                  {subDescription}
                </Text>
              )}
            </Flex>
          )}
        </Flex>
      </Card.Root>
    </chakra.button>
  );
}

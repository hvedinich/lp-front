import { Flex, Button } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';

interface StepsButtonsProps {
  onNext: () => void;
  onBack?: () => void;
  isDisabled?: boolean;
  isSubmitting?: boolean;
}

export function StepsButtons({ onBack, onNext, isDisabled, isSubmitting }: StepsButtonsProps) {
  const { t } = useTranslation('common');

  return (
    <Flex
      maxW='full'
      gap='4'
    >
      {onBack && (
        <Button
          flexGrow='1'
          onClick={onBack}
          fontWeight='normal'
          disabled={isSubmitting}
          variant='outline'
        >
          {t('addDevice.back')}
        </Button>
      )}
      <Button
        flexGrow='1'
        onClick={onNext}
        fontWeight='normal'
        loading={isSubmitting}
        disabled={isDisabled}
      >
        {t('addDevice.next')}
      </Button>
    </Flex>
  );
}

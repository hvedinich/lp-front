import { Flex, Text, useToken } from '@chakra-ui/react';
import { CheckboxField } from '@/shared/ui';
import { useTranslation } from 'react-i18next';
import Link from 'next/link';
import { envApp } from '@/shared/config';

const LANDING_URL = envApp.app.landingUrl;

const UserAgreementField = () => {
  const { t } = useTranslation('common');

  const [brandColor] = useToken('colors', ['fg.brand']);

  return (
    <CheckboxField
      isRequired={true}
      label={
        <Flex
          fontSize='sm'
          wrap='wrap'
        >
          <Text
            as='span'
            mr='1'
          >
            {t('addDevice.userInfo.accept')}
          </Text>
          <Link
            style={{ color: brandColor }}
            href={`${LANDING_URL}/terms`}
            target='_blank'
          >
            {t('addDevice.userInfo.terms')}
          </Link>
          <Text
            as='span'
            mx='1'
          >
            {t('addDevice.userInfo.and')}
          </Text>
          <Link
            style={{ color: brandColor }}
            href={`${LANDING_URL}/privacy`}
            target='_blank'
          >
            {t('addDevice.userInfo.policy')}
          </Link>
        </Flex>
      }
      name='isConsent'
    />
  );
};

export default UserAgreementField;

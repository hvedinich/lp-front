import { Box, Grid, Stack, Text, Flex } from '@chakra-ui/react';
import { useEffect } from 'react';
import { useFieldArray, useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import type { OnboardingFormValues } from '@/features/onboarding';
import { StepsButtons } from './StepsButtons';
import { BlockHeading } from './BlockHeading';
import PlatformInput from './PlatformInput';
import { PlatformCard } from './PlatformCard';
import { useHostedPage, type ContactPlatform, type ReviewPlatform } from '@/entities/hostedPage';
import PlatformCardsList from './PlatformCardsList';
import { useUiStore } from '@/shared/store';
import { DeviceModeEnum } from '@/entities/device';
import { locationSelectionSelectors } from '@/entities/location';
import { useHasActiveSession } from '@/entities/auth';
import { ALL_PLATFORMS, REVIEW_PLATFORMS } from '../lib/linkPlatform';

const reviewSet = new Set<string>(REVIEW_PLATFORMS);
interface PlatformLinksStepProps {
  onNext: () => void;
  onBack: () => void;
}

const PlatformLinksStep = ({ onNext, onBack }: PlatformLinksStepProps) => {
  const { t } = useTranslation('common');
  const { control, getValues, trigger, setValue } = useFormContext<OnboardingFormValues>();

  const sessionQuery = useHasActiveSession();
  const accountId = sessionQuery.data?.payload?.account.id ?? '';
  const selectedLocationId = useUiStore(locationSelectionSelectors.selectedLocationId(accountId));

  const hostedPageQuery = useHostedPage({ scope: { locationId: selectedLocationId } });

  const { mode, isNewLocation } = getValues();
  const isSingle = mode === DeviceModeEnum.SINGLE;
  const otherPlatforms = isSingle ? [] : ALL_PLATFORMS.filter((p) => !reviewSet.has(p));

  const { fields, append, remove, update, replace } = useFieldArray({
    control,
    name: 'links',
  });

  useEffect(() => {
    if (isSingle && fields.length > 1) {
      replace([{ type: fields[0]!.type, url: fields[0]!.url }]);
    }
  }, []);

  const selectedTypes = fields.map((f) => f.type).filter(Boolean) as ContactPlatform[];
  const availableReviewPlatforms = REVIEW_PLATFORMS.filter((p) => !selectedTypes.includes(p));
  const availableOtherPlatforms = otherPlatforms.filter(
    (p) => !selectedTypes.includes(p as ContactPlatform),
  );

  const existedLinks = hostedPageQuery?.data?.publishedConfig?.links?.filter(({ type }) =>
    REVIEW_PLATFORMS.includes(type as unknown as ReviewPlatform),
  );

  const togglePlatform = (platform: ContactPlatform) => {
    if (isSingle) {
      if (fields[0]?.type === platform) return;
      if (fields.length === 0) {
        append({ type: platform, url: '' });
      } else {
        update(0, { type: platform, url: '' });
      }
      return;
    }
    const index = fields.findIndex((f) => f.type === platform);
    if (index !== -1) {
      remove(index);
    } else {
      append({ type: platform, url: '' });
    }
  };

  const handleNext = async () => {
    const valid = await trigger('links');
    if (valid) onNext();
  };

  const onSelectSingleLink = (url: string) => {
    setValue('singleLinkUrl', url);
    handleNext();
  };

  const showAddedLinks = isNewLocation || isSingle ? !!existedLinks?.length || true : false;
  const showOrLine = isSingle && !isNewLocation && !!existedLinks?.length;

  return (
    <Stack gap='7'>
      <BlockHeading
        title={t(
          `addDevice.platformLinks.${!isSingle && !isNewLocation ? 'existedLinksTitle' : 'title'}`,
        )}
      />

      {!isNewLocation && existedLinks?.length && (
        <Flex
          flexDir='column'
          gap='2'
        >
          <Text
            fontWeight='semibold'
            fontSize='sm'
            color='fg.muted'
          >
            {t(`addDevice.platformLinks.sameLocation${!isSingle ? 'Multi' : 'Single'}`)}
          </Text>
          <Grid
            gap='4'
            gridTemplateColumns={{ base: '1fr', md: '1fr 1fr', lg: '1fr 1fr 1fr' }}
          >
            {existedLinks?.map(({ type, url }) => (
              <PlatformCard
                key={type}
                platform={type}
                url={url}
                onClick={() => isSingle && onSelectSingleLink(url)}
              />
            ))}
          </Grid>
        </Flex>
      )}

      {showAddedLinks && (
        <Stack gap='3'>
          {fields.map((field, index) => (
            <PlatformInput
              key={field.id}
              index={index}
              platform={field.type as ContactPlatform}
              onRemove={() => remove(index)}
              onUpdate={(url: string) => update(index, { type: field.type, url })}
            />
          ))}
        </Stack>
      )}

      {showOrLine && (
        <Flex
          alignItems='center'
          gap='4'
        >
          <Box
            bg='bg.muted'
            borderTopWidth='thin'
            w='full'
          />
          <Text
            fontWeight='semibold'
            fontSize='sm'
            color='fg.muted'
          >
            {t('addDevice.platformLinks.or')}
          </Text>
          <Box
            bg='bg.muted'
            borderTopWidth='thin'
            w='full'
          />
        </Flex>
      )}

      {showAddedLinks && availableReviewPlatforms?.length > 0 && (
        <PlatformCardsList
          platforms={availableReviewPlatforms}
          togglePlatform={togglePlatform}
          title={t('addDevice.platformLinks.reviews')}
        />
      )}

      {!isSingle && showAddedLinks && availableOtherPlatforms?.length > 0 && (
        <PlatformCardsList
          platforms={availableOtherPlatforms}
          togglePlatform={togglePlatform}
          title={t('addDevice.platformLinks.other')}
        />
      )}

      <StepsButtons
        onNext={handleNext}
        isDisabled={isNewLocation && (fields.length === 0 || !fields?.[0]?.url)}
        onBack={onBack}
      />
    </Stack>
  );
};

export default PlatformLinksStep;

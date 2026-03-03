import {
  Box,
  Button,
  Combobox,
  Stack,
  Text,
  createListCollection,
  type BoxProps,
} from '@chakra-ui/react';
import { ChevronDown, MapPin } from 'lucide-react';
import { useRouter } from 'next/router';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AppIcon } from '@/shared/ui';
import { useLocationSelection } from '../model/useLocationSelection';

export interface LocationSelectorProps extends BoxProps {
  onLocationSelect?: () => void;
}

export const LocationSelector = ({ onLocationSelect, ...rest }: LocationSelectorProps) => {
  const router = useRouter();
  const { t } = useTranslation('common');
  const [searchQuery, setSearchQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const { locations, locationsQuery, selectedLocationId, selectedLocation, onSelectLocation } =
    useLocationSelection();

  const inputValue = isOpen ? searchQuery : (selectedLocation?.name ?? '');

  const filteredLocations = useMemo(() => {
    const normalizedSearch = inputValue.trim().toLowerCase();
    if (!normalizedSearch) {
      return locations;
    }

    return locations.filter((location) => location.name.toLowerCase().includes(normalizedSearch));
  }, [inputValue, locations]);

  const locationOptions = useMemo(
    () =>
      filteredLocations.map((location) => ({
        label: location.name,
        value: location.id,
      })),
    [filteredLocations],
  );
  const collection = useMemo(
    () => createListCollection({ items: locationOptions }),
    [locationOptions],
  );

  const hasLocations = locations.length > 0;
  const isLoading = locationsQuery.isPending;

  return (
    <Box {...rest}>
      <Stack gap='2'>
        <Combobox.Root
          collection={collection}
          value={selectedLocationId ? [selectedLocationId] : []}
          inputValue={inputValue}
          onInputValueChange={(details) => setSearchQuery(details.inputValue)}
          onOpenChange={(details) => {
            setIsOpen(details.open);
            if (details.open) {
              setSearchQuery('');
            }
          }}
          onValueChange={(details) => {
            const locationId = details.value[0];
            if (!locationId) {
              return;
            }

            onSelectLocation(locationId);
            setSearchQuery('');
            onLocationSelect?.();
          }}
          closeOnSelect
        >
          <Combobox.Control>
            <Box
              color='fg.muted'
              position='absolute'
              insetY='1'
              insetStart='3'
              display='inline-flex'
              alignItems='center'
              justifyContent='center'
              pointerEvents='none'
            >
              <AppIcon
                icon={MapPin}
                size={16}
              />
            </Box>
            <Combobox.Input
              placeholder={
                selectedLocation?.name
                  ? t('workspace.locationSelector.searchPlaceholder')
                  : t('workspace.locationSelector.notSelected')
              }
              disabled={!hasLocations || isLoading}
              ps='10'
            />
            <Combobox.IndicatorGroup>
              <Combobox.Trigger>
                <AppIcon
                  icon={ChevronDown}
                  size={16}
                />
              </Combobox.Trigger>
            </Combobox.IndicatorGroup>
          </Combobox.Control>

          <Combobox.Positioner>
            <Combobox.Content maxH='40'>
              <Combobox.Empty>{t('workspace.locationSelector.noMatch')}</Combobox.Empty>
              {locationOptions.map((option) => (
                <Combobox.Item
                  key={option.value}
                  item={option}
                >
                  <Combobox.ItemText>{option.label}</Combobox.ItemText>
                  <Combobox.ItemIndicator>
                    {t('workspace.locationSelector.selected')}
                  </Combobox.ItemIndicator>
                </Combobox.Item>
              ))}
            </Combobox.Content>
          </Combobox.Positioner>
        </Combobox.Root>

        {!isLoading && !hasLocations ? (
          <Box>
            <Text
              fontSize='xs'
              color='fg.muted'
              mb='2'
            >
              {t('workspace.locationSelector.empty')}
            </Text>
            <Button
              size='sm'
              variant='subtle'
              width='full'
              onClick={() => {
                void router.push('/locations');
                onLocationSelect?.();
              }}
            >
              {t('workspace.locationSelector.manageLocations')}
            </Button>
          </Box>
        ) : null}
      </Stack>
    </Box>
  );
};

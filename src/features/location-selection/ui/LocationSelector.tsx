import {
  Box,
  Button,
  Combobox,
  Stack,
  Text,
  createListCollection,
  type ComboboxRootProps,
} from '@chakra-ui/react';
import { ChevronDown, MapPin } from 'lucide-react';
import { useRouter } from 'next/router';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AppIcon } from '@/shared/ui';
import { useLocationSelection } from '../model/useLocationSelection';

export interface LocationSelectorProps extends Omit<ComboboxRootProps, 'variant' | 'collection'> {
  onLocationSelect?: () => void;
  variant?: 'default' | 'card';
}

export const LocationSelector = ({
  onLocationSelect,
  variant = 'default',
  ...rest
}: LocationSelectorProps) => {
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
  const isDefaultUI = variant === 'default';

  return (
    <Stack gap='2'>
      <Combobox.Root
        size={isDefaultUI ? 'md' : 'lg'}
        open={isOpen}
        collection={collection}
        data-testid='location-selector-root'
        value={selectedLocationId ? [selectedLocationId] : []}
        inputValue={inputValue}
        onInputValueChange={(details) => setSearchQuery(details.inputValue)}
        onOpenChange={(details) => {
          setIsOpen(details.open);
          if (details.open) {
            setSearchQuery('');
          }
        }}
        variant='outline'
        onClick={(e) => {
          setIsOpen(true);
          e.stopPropagation();
        }}
        closeOnSelect
        {...rest}
      >
        <Combobox.Control>
          <Box
            color='fg.muted'
            position='absolute'
            insetY='1'
            insetStart={isDefaultUI ? '3' : '2'}
            display='inline-flex'
            alignItems='center'
            justifyContent='center'
            pointerEvents='none'
          >
            <AppIcon
              icon={MapPin}
              size={isDefaultUI ? 16 : 24}
            />
          </Box>
          <Combobox.Input
            borderRadius='2xl'
            data-testid='location-selector-input'
            placeholder={
              selectedLocation?.name
                ? t('workspace.locationSelector.searchPlaceholder')
                : t('workspace.locationSelector.notSelected')
            }
            disabled={!hasLocations || isLoading}
            ps='10'
            layerStyle={isDefaultUI ? 'none' : 'emptyInput'}
          />
          <Combobox.IndicatorGroup>
            <Combobox.Trigger data-testid='location-selector-trigger'>
              <AppIcon
                icon={ChevronDown}
                size={16}
              />
            </Combobox.Trigger>
          </Combobox.IndicatorGroup>
        </Combobox.Control>

        <Combobox.Positioner>
          <Combobox.Content
            maxH='40'
            borderRadius='2xl'
          >
            <Combobox.Empty>{t('workspace.locationSelector.noMatch')}</Combobox.Empty>
            {locationOptions.map((option) => (
              <Combobox.Item
                key={option.value}
                item={option}
                borderRadius='2xl'
                onClick={() => {
                  const locationId = option.value;
                  if (!locationId) {
                    return;
                  }

                  onSelectLocation(locationId);
                  setSearchQuery('');
                  onLocationSelect?.();
                }}
                data-testid={`location-selector-option-${option.value}`}
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
            data-testid='location-selector-manage-button'
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
  );
};

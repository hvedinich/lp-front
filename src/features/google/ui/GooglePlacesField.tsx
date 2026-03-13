import { useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { normalizeLocationFromPlace, useGetPlaceDetails, useSearchPlaces } from '../lib';
import {
  AutocompleteField,
  type AutocompleteFieldProps,
  type AutocompleteOption,
} from '@/shared/ui';
import { LocationPayload } from '@/entities/location';

export interface GooglePlacesFieldProps extends Omit<
  AutocompleteFieldProps,
  'onSelect' | 'options'
> {
  region: string;
  onSelect?: (location: LocationPayload | null, placeId: string | null) => void;
  placeholder?: string;
}

const GooglePlacesField = ({
  name,
  label,
  helperText,
  rules,
  isRequired,
  region,
  onSelect,
  placeholder,
}: GooglePlacesFieldProps) => {
  const { t } = useTranslation('common');
  const sessionTokenRef = useRef<string | null>(null);

  const searchMutation = useSearchPlaces({ scope: { region } });
  const detailsMutation = useGetPlaceDetails();

  const handleSearch = (query: string) => {
    if (!sessionTokenRef.current) {
      sessionTokenRef.current = crypto.randomUUID();
    }
    void searchMutation.mutate({ input: query, sessionToken: sessionTokenRef.current });
  };

  const handleSelect = async (option: AutocompleteOption) => {
    if (!onSelect) return;

    try {
      const details = await detailsMutation.mutateAsync({
        placeId: option.value,
        sessionToken: sessionTokenRef.current ?? undefined,
      });
      sessionTokenRef.current = null;

      if (!details || !details.name) {
        onSelect(null, null);
        return;
      }

      const { placeId, ...location } = normalizeLocationFromPlace(details);
      onSelect(location, placeId);
    } finally {
      sessionTokenRef.current = crypto.randomUUID();
    }
  };

  const options: AutocompleteOption[] = (searchMutation.data ?? []).map((s) => ({
    value: s.placeId,
    label: s.name,
  }));

  return (
    <AutocompleteField
      name={name}
      rules={rules}
      id={String(name)}
      options={options}
      isLoading={searchMutation.isPending || detailsMutation.isPending}
      onSearch={handleSearch}
      onSelect={(option) => void handleSelect(option)}
      label={label}
      helperText={helperText}
      isRequired={isRequired}
      placeholder={placeholder ?? t('addDevice.platformLinks.googleSearchPlaceholder')}
    />
  );
};

export default GooglePlacesField;

import { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { getPlaceDetails, normalizeLocationFromPlace, searchPlaces } from '../lib';
import type { PlaceSuggestion } from '../lib';
import { AutocompleteField, AutocompleteFieldProps, type AutocompleteOption } from '@/shared/ui';
import type { LocationPayload } from '@/shared/lib';

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
  const [suggestions, setSuggestions] = useState<PlaceSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const sessionTokenRef = useRef<string | null>(null);

  const handleSearch = async (query: string) => {
    if (!sessionTokenRef.current) {
      sessionTokenRef.current = crypto.randomUUID();
    }
    setIsLoading(true);
    try {
      const results = await searchPlaces({
        input: query,
        sessionToken: sessionTokenRef.current,
        region,
      });
      setSuggestions(results);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelect = async (option: AutocompleteOption) => {
    if (!onSelect) return;
    setIsLoading(true);
    try {
      const details = await getPlaceDetails(option.value, sessionTokenRef.current ?? undefined);
      sessionTokenRef.current = null;

      if (!details || !details.name) {
        onSelect(null, null);
        return;
      }

      const { placeId, ...location } = normalizeLocationFromPlace(details);
      onSelect(location, placeId);
    } finally {
      sessionTokenRef.current = crypto.randomUUID();
      setIsLoading(false);
    }
  };

  const options: AutocompleteOption[] = suggestions.map((s) => ({
    value: s.placeId,
    label: s.name,
  }));

  return (
    <AutocompleteField
      name={name}
      rules={rules}
      id={String(name)}
      options={options}
      isLoading={isLoading}
      onSearch={(query) => void handleSearch(query)}
      onSelect={(option) => void handleSelect(option)}
      label={label}
      helperText={helperText}
      isRequired={isRequired}
      placeholder={placeholder ?? t('addDevice.platformLinks.googleSearchPlaceholder')}
    />
  );
};

export default GooglePlacesField;

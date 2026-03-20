import { Badge, Table } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import { type Device, DeviceModeEnum } from '@/entities/device';
import { Edit } from 'lucide-react';
import Link from 'next/link';

interface DevicesTableProps {
  devices: Device[];
  onOpen: (deviceId: string) => void;
  'data-testid'?: string;
}

export function DevicesTable({ devices, onOpen, 'data-testid': testId }: DevicesTableProps) {
  const { t } = useTranslation('common');

  const getModeLabel = (mode: DeviceModeEnum | null): string | null => {
    if (mode === DeviceModeEnum.SINGLE) return t('workspace.devicesPage.modeStatic');
    if (mode === DeviceModeEnum.MULTI) return t('workspace.devicesPage.modeMultilink');
    return null;
  };

  return (
    <Table.Root
      size='md'
      data-testid={testId}
    >
      <Table.Header>
        <Table.Row fontSize='xs'>
          <Table.ColumnHeader
            fontWeight='normal'
            color='fg.subtle'
            borderBottomColor='gray.emphasized'
          >
            {t('workspace.devicesPage.table.name')}
          </Table.ColumnHeader>

          <Table.ColumnHeader
            borderBottomColor='gray.emphasized'
            fontWeight='normal'
            color='fg.subtle'
          >
            {t('workspace.devicesPage.table.mode')}
          </Table.ColumnHeader>

          <Table.ColumnHeader
            fontWeight='normal'
            borderBottomColor='gray.emphasized'
            color='fg.subtle'
          >
            {t('workspace.devicesPage.table.targetUrl')}
          </Table.ColumnHeader>
          <Table.ColumnHeader
            fontWeight='normal'
            borderBottomColor='gray.emphasized'
            color='fg.subtle'
          >
            {t('workspace.devicesPage.table.shortCode')}
          </Table.ColumnHeader>
          <Table.ColumnHeader borderBottomColor='gray.emphasized'></Table.ColumnHeader>
        </Table.Row>
      </Table.Header>
      <Table.Body>
        {devices.map((device) => {
          const name = device.name?.trim() || device.shortCode;
          const modeLabel = getModeLabel(device.mode);

          return (
            <Table.Row
              key={device.id}
              data-testid={`devices-card-${device.id}`}
              style={{ cursor: 'pointer' }}
              role='button'
              tabIndex={0}
              onClick={() => onOpen(device.id)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onOpen(device.id);
                }
              }}
            >
              <Table.Cell
                fontSize='xs'
                fontWeight='medium'
                padding='2'
                truncate
                maxW={{ base: '24', md: 'full' }}
              >
                {name}
              </Table.Cell>

              <Table.Cell padding='2'>
                <Badge
                  borderRadius='xl'
                  variant='subtle'
                  colorPalette={device.mode === DeviceModeEnum.MULTI ? 'brand' : 'accent'}
                >
                  {modeLabel}
                </Badge>
              </Table.Cell>
              <Table.Cell
                color='fg.muted'
                maxW={{ base: '28', md: '48' }}
                padding='2'
                overflow='hidden'
                textOverflow='ellipsis'
                whiteSpace='nowrap'
                fontSize='xs'
                _hover={{ textDecoration: 'underline' }}
              >
                <Link
                  href={device.targetUrl!}
                  target='_blank'
                  onClick={(e) => e.stopPropagation()}
                >
                  {device.targetUrl ?? '—'}
                </Link>
              </Table.Cell>
              <Table.Cell
                fontSize='xs'
                padding='2'
                color='fg.muted'
              >
                {device.shortCode}
              </Table.Cell>
              <Table.Cell padding='2'>
                <Edit style={{ width: '12', color: 'gray' }} />
              </Table.Cell>
            </Table.Row>
          );
        })}
      </Table.Body>
    </Table.Root>
  );
}

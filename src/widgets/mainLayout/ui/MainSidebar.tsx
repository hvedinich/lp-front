import { Box, Button, Flex, Heading, Stack, Text } from '@chakra-ui/react';
import { useRouter } from 'next/router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { getWorkspaceSection, workspaceSections, type WorkspaceSection } from '../model/navigation';

const renderMenuButtons = (
  sections: readonly WorkspaceSection[],
  activeSection: WorkspaceSection,
  onSelectSection: (section: WorkspaceSection) => void,
  getLabel: (section: WorkspaceSection) => string,
) => {
  return sections.map((section) => {
    const isActive = section === activeSection;

    return (
      <Button
        key={section}
        variant={isActive ? 'solid' : 'ghost'}
        justifyContent='flex-start'
        width='full'
        onClick={() => onSelectSection(section)}
      >
        {getLabel(section)}
      </Button>
    );
  });
};

export function MainSidebar() {
  const router = useRouter();
  const { t } = useTranslation('common');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDesktopMenuOpen, setIsDesktopMenuOpen] = useState(true);

  const activeSection = getWorkspaceSection(
    typeof router.query.section === 'string' ? router.query.section : undefined,
  );

  const handleSelectSection = (section: WorkspaceSection) => {
    void router.push({
      pathname: '/',
      query: { section },
    });
    setIsMobileMenuOpen(false);
  };

  const getSectionLabel = (section: WorkspaceSection) => {
    return t(`workspace.menu.${section}`);
  };

  const menuButtons = renderMenuButtons(
    workspaceSections,
    activeSection,
    handleSelectSection,
    getSectionLabel,
  );

  return (
    <>
      <Box
        as='aside'
        display={{ base: 'none', md: 'block' }}
        width={isDesktopMenuOpen ? '[18rem]' : '[4rem]'}
        h='[100dvh]'
        overflowY='auto'
        borderRightWidth='[1px]'
        borderColor='border.muted'
        bg='bg.surface'
        p='3'
        transition='[width 0.2s ease]'
        flexShrink='[0]'
      >
        <Stack gap='3'>
          <Flex justify={isDesktopMenuOpen ? 'space-between' : 'center'}>
            {isDesktopMenuOpen ? <Heading size='lg'>{t('workspace.title')}</Heading> : null}
            <Button
              variant='ghost'
              size='sm'
              onClick={() => setIsDesktopMenuOpen((state) => !state)}
            >
              {isDesktopMenuOpen ? t('workspace.closeMenu') : t('workspace.openMenu')}
            </Button>
          </Flex>

          {isDesktopMenuOpen ? (
            <Stack gap='2'>
              <Text
                color='fg.muted'
                textTransform='uppercase'
                fontWeight='semibold'
                letterSpacing='widest'
                fontSize='xs'
              >
                {t('workspace.menuTitle')}
              </Text>
              <Stack gap='1'>{menuButtons}</Stack>
            </Stack>
          ) : null}
        </Stack>
      </Box>

      <Box
        display={{ base: 'block', md: 'none' }}
        borderBottomWidth='[1px]'
        borderColor='border.muted'
        bg='bg.surface'
      >
        <Flex
          px='4'
          py='3'
          align='center'
          justify='space-between'
          gap='3'
        >
          <Heading size='md'>{t('workspace.title')}</Heading>
          <Button
            variant='outline'
            size='sm'
            onClick={() => setIsMobileMenuOpen((state) => !state)}
          >
            {isMobileMenuOpen ? t('workspace.closeMenu') : t('workspace.openMenu')}
          </Button>
        </Flex>

        <Box
          px='4'
          pb={isMobileMenuOpen ? '4' : '[0]'}
          overflow='hidden'
          maxH={isMobileMenuOpen ? '[24rem]' : '[0px]'}
          opacity={isMobileMenuOpen ? '[1]' : '[0]'}
          transform={isMobileMenuOpen ? 'translateY(0)' : '[translateY(-0.5rem)]'}
          transition='[max-height 0.25s ease, opacity 0.25s ease, transform 0.25s ease, padding 0.25s ease]'
        >
          <Stack gap='1'>{menuButtons}</Stack>
        </Box>
      </Box>
    </>
  );
}

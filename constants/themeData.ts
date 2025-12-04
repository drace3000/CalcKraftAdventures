import { ImageSourcePropType } from 'react-native';

export type ThemeId = 'blockland' | 'princess' | 'unicorn';

export type ThemeDefinition = {
  id: ThemeId;
  title: string;
  image: ImageSourcePropType;
  accent: string;
};

const blocklandIcon = require('@/assets/images/buttons/calckraft-blockland-small.png');
const princessIcon = require('@/assets/images/buttons/calckraft-princess-castle-small.png');
const unicornIcon = require('@/assets/images/buttons/calckraft-unicorn-meadow-small.png');

export const THEME_DEFINITIONS: ThemeDefinition[] = [
  {
    id: 'blockland',
    title: 'Blockland',
    image: blocklandIcon,
    accent: '#FFB300',
  },
  {
    id: 'princess',
    title: 'Princess Castle',
    image: princessIcon,
    accent: '#EC407A',
  },
  {
    id: 'unicorn',
    title: 'Unicorn Meadow',
    image: unicornIcon,
    accent: '#7E57C2',
  },
];

export const THEME_DEFINITION_MAP = THEME_DEFINITIONS.reduce<
  Record<ThemeId, ThemeDefinition>
>((acc, theme) => {
  acc[theme.id] = theme;
  return acc;
}, {} as Record<ThemeId, ThemeDefinition>);


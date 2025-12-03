import { ImageSourcePropType } from 'react-native';

export type ThemeId = 'blockland' | 'princess' | 'unicorn';

export type ThemeDefinition = {
  id: ThemeId;
  title: string;
  image: ImageSourcePropType;
  accent: string;
  narration: string;
  voicePreference?: ThemeId;
};

const blocklandIcon = require('@/assets/images/buttons/calckraft-blockland-small.png');
const princessIcon = require('@/assets/images/buttons/calckraft-princess-castle-small.png');
const unicornIcon = require('@/assets/images/buttons/calckraft-unicorn-meadow-small.png');

const BLOCKLAND_NARRATION =
  "Welcome to Blockland—where every brick unlocks a new adventure! Build towering castles, solve clever puzzles, and collect gear that levels up your hero. Tap into redstone contraptions, hidden treasure rooms, and surprise quests crafted just for master builders. Ready to stack your way to victory? Single-tap and I’ll guide you through your custom Blockland journey! Double-tap any time to hear this tale again.";

const PRINCESS_NARRATION =
  "Welcome to Princess Castle, where enchanted chandeliers and secret hallways shimmer with magic. Your quests take you past singing portraits, dancing tea sets, and locked towers that only the bravest heroes can open. Collect sparkle gems, help royal friends, and unlock new wings of the castle with every victory. Ready for a royal challenge? Double-tap anytime, and I’ll remind you of your mission or single tap to begin your princess journey.";

const UNICORN_NARRATION =
  "Unicorn Meadow glows with pastel skies, floating lily pads, and crystal streams. Friendly unicorns leave trails of stardust for you to follow into hidden glades. Gather rainbow blossoms, craft potions, and calm mischievous sprites to earn new powers. When you need a guide, double-tap and the meadow will whisper your next adventure or single tap to begin your journey.";

export const THEME_DEFINITIONS: ThemeDefinition[] = [
  {
    id: 'blockland',
    title: 'Blockland',
    image: blocklandIcon,
    accent: '#FFB300',
    narration: BLOCKLAND_NARRATION,
    voicePreference: 'blockland',
  },
  {
    id: 'princess',
    title: 'Princess Castle',
    image: princessIcon,
    accent: '#EC407A',
    narration: PRINCESS_NARRATION,
    voicePreference: 'princess',
  },
  {
    id: 'unicorn',
    title: 'Unicorn Meadow',
    image: unicornIcon,
    accent: '#7E57C2',
    narration: UNICORN_NARRATION,
    voicePreference: 'unicorn',
  },
];

export const THEME_DEFINITION_MAP = THEME_DEFINITIONS.reduce<
  Record<ThemeId, ThemeDefinition>
>((acc, theme) => {
  acc[theme.id] = theme;
  return acc;
}, {} as Record<ThemeId, ThemeDefinition>);


import { Spell } from '../types/cards/index';

const {
  cardUtils,
  commonTypes,
  cards
} = globalThis.SpellmasonsAPI;
const { refundLastSpell } = cards;
const Unit = globalThis.SpellmasonsAPI.Unit;
const { playDefaultSpellSFX } = cardUtils;
const { CardCategory, probabilityMap, CardRarity } = commonTypes;

const animationPath = 'spellUndeadBlade';

const cardId = 'Consume';
export const spell1: Spell = {
  card: {
    id: cardId,
    category: CardCategory.Damage,
    supportQuantity: true,
    manaCost: 50,
    healthCost: 0,
    expenseScaling: 1,
    probability: probabilityMap[CardRarity.UNCOMMON],
    thumbnail: 'spellmasons-mods/custom_mod/Consume.png',
    animationPath,
    sfx: 'hurt',
    description: [`Instantly kills all targeted units with 50 health or less, and gives their blessings, curses and health to caster. (stacking raises threshold by 25)`],
    effect: async (state, card, quantity, underworld, prediction) => {
      const targets = state.targetedUnits.filter(u => u.alive).filter(u => u != state.casterUnit).filter(u => u.health <= 25 * (1 + quantity));
      for (let unit2 of targets) {
        Unit.takeDamage(state.casterUnit, -Math.max(unit2.health, 0), state.casterUnit, underworld, prediction, state);
        for (let modifier2_k in unit2.modifiers) {
          let modifier2 = unit2.modifiers[modifier2_k];
          Unit.addModifier(state.casterUnit, modifier2_k, underworld, prediction, modifier2.quantity);
        }
        Unit.die(unit2, underworld, prediction);
      }
      if (targets.length == 0) {
        refundLastSpell(state, prediction, 'no target, mana refunded');
      }
      if (!prediction) {
        playDefaultSpellSFX(card, prediction);
      }
      if (!prediction && !globalThis.headless) {
        await new Promise((resolve) => {
          setTimeout(resolve, 100);
        });
      }
      return state;
    },
  },
};

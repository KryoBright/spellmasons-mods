import { Spell } from '../types/cards/index';

const {
    cardUtils,
    cardsUtil,
    commonTypes,
    cards
} = globalThis.SpellmasonsAPI;
const { refundLastSpell } = cards;
const Unit = globalThis.SpellmasonsAPI.Unit;
const { playDefaultSpellSFX } = cardUtils;
const { CardCategory, probabilityMap, CardRarity } = commonTypes;

const animationPath = 'spellUndeadBlade';

const cardId_custom12 = 'Challenger';
export const spell12: Spell = {
  card: {
    id: cardId_custom12,
    category: CardCategory.Soul,
    supportQuantity: false,
    manaCost: 150,
    healthCost: 0,
    expenseScaling: 1,
    probability: probabilityMap[CardRarity.RARE],
    thumbnail: 'spellmasons-mods/custom_mod/Challenger.png',
    animationPath,
    sfx: 'hurt',
    description: [`Transforms one targeted friendly and one targeted enemy unit into minibosses.`],
    effect: async (state, card, quantity, underworld, prediction) => {
      const targets = state.targetedUnits.filter(u => u.alive);
      const friends = targets.filter(u => u.faction == 0).filter(u => !u.isMiniboss);
      const enemies = targets.filter(u => u.faction == 1).filter(u => !u.isMiniboss);
      if (friends.length > 0) {
        if (enemies.length > 0) {
          Unit.addModifier(friends[0], cardId_custom12, underworld, prediction, quantity);
          Unit.addModifier(enemies[0], cardId_custom12, underworld, prediction, quantity);
        }
      }

      if ((targets.length == 0) || (enemies.length == 0) || (friends.length == 0)) {
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
  modifiers: {
    add: add6,
    remove: remove
  },
  events: {
    onDamage: (unit, amount, prediction, underworld) => {
      return amount;
    }
  }
};
function add6(unit, underworld, prediction, quantity, extra) {
  let firstStack = !unit.onDamageEvents.includes(cardId_custom12);
  const modifier = cardsUtil.getOrInitModifier(unit, cardId_custom12, {
    isCurse: false, quantity, persistBetweenLevels: false,
  }, () => {
    if (firstStack) {
      unit.onDamageEvents.push(cardId_custom12);
      unit.isMiniboss = true;
      unit.health *= 2;
      unit.healthMax *= 2;
      unit.image.sprite.scale.x *= 1.5;
      unit.image.sprite.scale.y *= 1.5;
    }
  });
}
function remove(unit, underworld) {
  if (unit.modifiers && unit.modifiers[cardId_custom12]) {
    unit.isMiniboss = false;
    unit.health /= 2;
    unit.healthMax /= 2;
    unit.image.sprite.scale.x /= 1.5;
    unit.image.sprite.scale.y /= 1.5;
  }
}

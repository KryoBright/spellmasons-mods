import type { Spell } from '../types/cards/index';
import { Mod } from '../types/types/commonTypes';

const {
    PixiUtils,
    rand,
    cardUtils,
    commonTypes,
    cards,
    cardsUtil
} = globalThis.SpellmasonsAPI;
const { randFloat } = rand;
const { refundLastSpell } = cards;
const { containerSpells } = PixiUtils;
const Unit = globalThis.SpellmasonsAPI.Unit;
const { oneOffImage, playDefaultSpellSFX } = cardUtils;
const { CardCategory, probabilityMap, CardRarity } = commonTypes;

const cardId = 'Consume';
const damageDone = 60;
export interface UnitDamage {
    id: number;
    x: number;
    y: number;
    health: number;
    damageTaken: number;

}
const animationPath = 'spellUndeadBlade';
const delayBetweenAnimationsStart = 400;
const spell1: Spell = {
    card: {
        id: cardId,
        category: CardCategory.Damage,
        supportQuantity: true,
        manaCost: 50,
        healthCost: 0,
        expenseScaling: 1,
        probability: probabilityMap[CardRarity.UNCOMMON],
        thumbnail: 'spellmasons-mods/custom_mod/spellIconUndeadBlade.png',
        animationPath,
        sfx: 'hurt',
        description: [`Instantly kills all targeted units with 50 health or less, and gives their blessings, curses and health to caster. (stacking raises threshold by 25)`],
        effect: async (state, card, quantity, underworld, prediction) => {
			const targets = state.targetedUnits.filter(u => u.alive).filter( u => u != state.casterUnit).filter(u => u.health <= 25 * (1 + quantity));
			for (let unit2 of targets) {
					Unit.takeDamage(state.casterUnit, -Math.max(unit2.health,0), state.casterUnit, underworld, prediction, state)
					for (let modifier2_k in unit2.modifiers) {
						let modifier2 = unit2.modifiers[modifier2_k]
						Unit.addModifier(state.casterUnit, modifier2_k, underworld, prediction, modifier2.quantity)	
					}
					Unit.takeDamage(unit2, Math.max(unit2.health,0), state.casterUnit, underworld, prediction, state)
					unit2.health -= unit2.health % 1;
			}
			if (targets.length == 0) {
				refundLastSpell(state, prediction, 'no target, mana refunded')
			}
			
			state.casterUnit.health -= state.casterUnit.health % 1;
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

const cardId_custom2 = 'Essence Sap'
const spell2: Spell = {
    card: {
        id: cardId_custom2,
        category: CardCategory.Damage,
        supportQuantity: true,
        manaCost: 20,
        healthCost: 0,
        expenseScaling: 2,
        probability: probabilityMap[CardRarity.UNCOMMON],
        thumbnail: 'spellmasons-mods/custom_mod/spellIconUndeadBlade.png',
        animationPath,
        sfx: 'hurt',
        description: [`Deals 20 damage to first target for each target. Overkill carries to the next target`],
        effect: async (state, card, quantity, underworld, prediction) => {
			const targets = state.targetedUnits.filter(u => u.alive);
			let overallDamage = 20*targets.length*quantity
			for (let unit2 of targets) {
					let o_h = unit2.health 
					Unit.takeDamage(unit2, Math.min(overallDamage, unit2.health), state.casterUnit, underworld, prediction, state)
					overallDamage = Math.max(0, overallDamage-o_h)
			}
			if (targets.length == 0) {
				refundLastSpell(state, prediction, 'no target, mana refunded')
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

const cardId_custom3 = 'Apply Seal'
const spell3: Spell = {
    card: {
        id: cardId_custom3,
        category: CardCategory.Damage,
        supportQuantity: true,
        manaCost: 50,
        healthCost: 0,
        expenseScaling: 2,
        probability: probabilityMap[CardRarity.COMMON],
        thumbnail: 'spellmasons-mods/custom_mod/spellIconUndeadBlade.png',
        animationPath,
        sfx: 'hurt',
        description: [`Affected unit changes faction on damage`],
        effect: async (state, card, quantity, underworld, prediction) => {
			    const targets = state.targetedUnits.filter(u => u.alive);
          for (let unit2 of targets) {
            Unit.addModifier(unit2, cardId_custom3, underworld, prediction, 1, { amount: quantity });
          }
          if (targets.length == 0) {
            refundLastSpell(state, prediction, 'no target, mana refunded')
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
        add,
    },
    events: {
      onDamage: (unit, amount, prediction, underworld) => { 
        Unit.changeFaction(unit, 1 - unit.faction); 
        return amount;
      }
    }
};

function add(unit, underworld, prediction, quantity, extra) {
  let firstStack = !unit.onTurnStartEvents.includes(cardId_custom3);
  const modifier = cardsUtil.getOrInitModifier(unit, cardId_custom3, {
      isCurse: true, quantity, persistBetweenLevels: false,
  }, () => {
      if (firstStack) {
          unit.onDamageEvents.push(cardId_custom3);
      }
  });
}



const mod: Mod = {
    modName: 'custom_mod',
    author: 'KryoABright',
    description: 'A spell that does lots of damage to summons and resurrected units',
    screenshot: 'spellmasons-mods/custom_mod/spellIconUndeadBlade.png',
    spells: [
		spell1,
		spell2,
    spell3
	],
    // The spritesheet is created with TexturePacker: https://www.codeandweb.com/texturepacker
    spritesheet: 'spellmasons-mods/custom_mod/undead_blade.json'
};
export default mod;

import type { Spell } from '../types/cards/index';
import { Mod } from '../types/types/commonTypes';
import { amalgam_golem, absorb_golem } from './units';
import { cast_prism_ally, cast_prism_enemy, cast_prism_self, spell15, spell16, spell17 } from './prisms';
import { spell1 } from './Consume';
import { spell2 } from './Essence Sap';
import { spell3 } from './Shatter Soul';
import { spell4 } from './Borrow';
import { spell5 } from './Equalize';
import { spell6 } from './Stroll';
import { spell7 } from './Mana shield';
import { spell8 } from './Ritual';
import { spell9 } from './Channel';
import { spell10 } from './Haste';
import { spell11 } from './Small Respite';
import { spell12 } from './Challenger';
import { spell13 } from './Catalyst';
import { decoy_trap } from './Pickups';


const {
    cardUtils,
    commonTypes,
    cards,
    cardsUtil
} = globalThis.SpellmasonsAPI;
const { refundLastSpell } = cards;
export const Unit = globalThis.SpellmasonsAPI.Unit;
const { playDefaultSpellSFX } = cardUtils;
const { CardCategory, probabilityMap, CardRarity } = commonTypes;

const animationPath = 'spellUndeadBlade';

let weaknessCards = []
let unit_ids = ['golem', 'archer', 'glop', 'ancient', 'priest', 'poisoner', 'vampire', 'gripthulu', 'summoner', 'Blood Golem', 'Blood Archer', 'Ghost Archer', 'Green Glop', 'Mana Vampire', 'Dark Summoner', 'dark priest', 'Spellmason', 'Deathmason', 'decoy']
for (let unit_id of unit_ids) {
  let card_tmp_id = "Weak points: "+ Unit.unitSourceIdToName(unit_id)
  weaknessCards.push(
    {
      card: {
          id: card_tmp_id,
          category: CardCategory.Curses,
          supportQuantity: true,
          manaCost: 40,
          healthCost: 0,
          expenseScaling: 1,
          probability: 0,
          thumbnail: 'spellmasons-mods/custom_mod/AnalyzeWeakness.png',
          animationPath,
          sfx: 'hurt',
          description: [`Target `+unit_id+` takes 2x+(number of stacks) damage from all sources.`],
          effect: async (state, card, quantity, underworld, prediction) => {
            const targets = state.targetedUnits.filter(u => u.alive).filter(u=> u.unitSourceId == unit_id);
            for (let unit2 of targets) {
              Unit.addModifier(unit2, card_tmp_id, underworld, prediction, quantity);
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
        add: (unit, underworld, prediction, quantity, extra) => {
          let firstStack = !unit.onDamageEvents.includes(card_tmp_id);
          const modifier = cardsUtil.getOrInitModifier(unit, card_tmp_id, {
              isCurse: false, quantity, persistBetweenLevels: false,
          }, () => {
              if (firstStack) {
                  unit.onDamageEvents.push(card_tmp_id);
              }
          });
        }
      },
      events: {
        onDamage: (unit, amount, prediction, underworld) => {
          if ((amount>0)&&(unit.unitSourceId==unit_id)) {
            if ((unit.modifiers[card_tmp_id])&&(unit.modifiers[card_tmp_id].quantity>0)) {
              return amount * 2 + unit.modifiers[card_tmp_id].quantity;
            }
          }
          return amount;
        }
      }
  }
  )
}

const cardId_custom14 = 'Analyze weakness'
const spell14: Spell = {
      card: {
          id: cardId_custom14,
          category: CardCategory.Soul,
          supportQuantity: true,
          manaCost: 40,
          healthCost: 0,
          expenseScaling: 2,
          probability: probabilityMap[CardRarity.RARE],
          thumbnail: 'spellmasons-mods/custom_mod/AnalyzeWeakness.png',
          animationPath,
          sfx: 'hurt',
          description: [`Apply 1 "Analyze weakness" to target. At the end of each turn add one more. If target has 10 or more, at the end of turn cleanse it and give each player "Weak Points" spell, which increases damage on this type of enemy`],
          effect: async (state, card, quantity, underworld, prediction) => {
            const targets = state.targetedUnits.filter(u => u.alive).filter( u=> 
              !state.casterPlayer.inventory.includes("Weak points: " + Unit.unitSourceIdToName(u.unitSourceId))
            );
            for (let unit2 of targets) {
              Unit.addModifier(unit2, cardId_custom14, underworld, prediction, quantity);
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
        add: (unit, underworld, prediction, quantity, extra) => {
          let firstStack = !unit.onTurnEndEvents.includes(cardId_custom14);
          const modifier = cardsUtil.getOrInitModifier(unit, cardId_custom14, {
              isCurse: false, quantity, persistBetweenLevels: false,
          }, () => {
              if (firstStack) {
                  unit.onTurnEndEvents.push(cardId_custom14);
              }
          });
        }
      },
      events: {
        onTurnEnd: async (unit, prediction, underworld) => {
          if ((unit.modifiers[cardId_custom14])&&(unit.modifiers[cardId_custom14].quantity>=10)) {
            Unit.removeModifier(unit, cardId_custom14, underworld)
            if (!prediction) {
              const newCardId = "Weak points: " + Unit.unitSourceIdToName(unit.unitSourceId);
              for (let plr of underworld.players) {
                if (!plr.inventory.includes(newCardId)){
                  plr.inventory.push(newCardId)
                  let i = 0
                  while (i<9) {
                    if (plr.cardsInToolbar[i]=="") {
                      plr.cardsInToolbar[i] = newCardId
                      i = 10
                    }
                    i++
                  }
                }
              }
            }
          }
          else {
            if ((unit.modifiers[cardId_custom14])&&(unit.modifiers[cardId_custom14].quantity)) {
              unit.modifiers[cardId_custom14].quantity++
            }
          }
        }
      }
  };

const mod: Mod = {
    modName: 'custom_mod',
    author: 'KryoABright',
    description: 'A spell that does lots of damage to summons and resurrected units',
    screenshot: 'spellmasons-mods/custom_mod/spellIconUndeadBlade.png',
    spells: [
      spell1,
      spell2,
      spell3,
      spell4,
      spell5,
      spell6,
      spell7,
      spell8,
      spell9,
      spell10,
      spell11,
      spell12,
      spell13,
      spell14,
      spell15,
      spell16,
      spell17,
      ...weaknessCards
    ],
    pickups: [
      decoy_trap
    ],
    units: [
      amalgam_golem,
      absorb_golem,
      cast_prism_self,
      cast_prism_enemy,
      cast_prism_ally
    ],
    // The spritesheet is created with TexturePacker: https://www.codeandweb.com/texturepacker
    spritesheet: 'spellmasons-mods/custom_mod/undead_blade.json'
};
export default mod;

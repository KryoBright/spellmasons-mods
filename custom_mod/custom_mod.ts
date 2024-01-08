import type { Spell } from '../types/cards/index';
import { IPickupSource } from '../types/entity/Pickup';
import { HasSpace } from '../types/entity/Type';
import { Mod } from '../types/types/commonTypes';
import Underworld from '../types/Underworld';
import { cast_prism_ally, cast_prism_enemy, cast_prism_self, spell15, spell16, spell17 } from './prisms';


const {
    PixiUtils,
    rand,
    cardUtils,
    commonTypes,
    cards,
    cardsUtil,
    config,
    MultiColorReplaceFilter,
    FloatingText,
    Pickup,
    meleeAction
} = globalThis.SpellmasonsAPI;
const { randFloat } = rand;
const { refundLastSpell } = cards;
const { containerSpells } = PixiUtils;
export const Unit = globalThis.SpellmasonsAPI.Unit;
const { oneOffImage, playDefaultSpellSFX } = cardUtils;
const { CardCategory, probabilityMap, CardRarity } = commonTypes;

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

const cardId = 'Consume';
const spell1: Spell = {
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
			const targets = state.targetedUnits.filter(u => u.alive).filter( u => u != state.casterUnit).filter(u => u.health <= 25 * (1 + quantity));
			for (let unit2 of targets) {
					Unit.takeDamage(state.casterUnit, -Math.max(unit2.health,0), state.casterUnit, underworld, prediction, state)
					for (let modifier2_k in unit2.modifiers) {
						let modifier2 = unit2.modifiers[modifier2_k]
						Unit.addModifier(state.casterUnit, modifier2_k, underworld, prediction, modifier2.quantity)	
					}
					Unit.die(unit2,underworld,prediction)
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
        thumbnail: 'spellmasons-mods/custom_mod/Essence Sap.png',
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

const cardId_custom3 = 'Shatter Soul'
const spell3: Spell = {
    card: {
        id: cardId_custom3,
        category: CardCategory.Soul,
        supportQuantity: true,
        manaCost: 50,
        healthCost: 0,
        expenseScaling: 1,
        probability: probabilityMap[CardRarity.UNCOMMON],
        thumbnail: 'spellmasons-mods/custom_mod/Shatter Soul.png',
        animationPath,
        sfx: 'hurt',
        description: [`Affected unit changes faction on taking damage. Can only target resurrected or summoned units`],
        effect: async (state, card, quantity, underworld, prediction) => {
			    const targets = state.targetedUnits.filter(u => u.alive).filter(u => !u.originalLife);
          for (let unit2 of targets) {
            Unit.addModifier(unit2, cardId_custom3, underworld, prediction, 1);
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
        if (amount>0) { 
          Unit.changeFaction(unit, 1 - unit.faction); 
        }
        return amount;
      }
    }
};

function add(unit, underworld, prediction, quantity, extra) {
  let firstStack = !unit.onDamageEvents.includes(cardId_custom3);
  const modifier = cardsUtil.getOrInitModifier(unit, cardId_custom3, {
      isCurse: true, quantity, persistBetweenLevels: false,
  }, () => {
      if (firstStack) {
          unit.onDamageEvents.push(cardId_custom3);
      }
  });
}

const cardId_custom4 = 'Borrow'
const spell4: Spell = {
    card: {
        id: cardId_custom4,
        category: CardCategory.Blessings,
        supportQuantity: true,
        manaCost: 10,
        healthCost: 0,
        expenseScaling: 0.5,
        probability: probabilityMap[CardRarity.COMMON],
        thumbnail: 'spellmasons-mods/custom_mod/Borrow.png',
        animationPath,
        sfx: 'hurt',
        description: [`Borrows 10% of targets health and mana from next turn to this (with 100% interest!). This spell has no effect, if it will consume more than 80% of targets curent hp next turn`],
        effect: async (state, card, quantity, underworld, prediction) => {
			    const targets = state.targetedUnits.filter(u => u.alive);
          for (let unit2 of targets) {
            let sub_amount = 0;
            if (unit2.modifiers[cardId_custom4]) {
              if (unit2.modifiers[cardId_custom4].quantity>0) {
                sub_amount = unit2.modifiers[cardId_custom4].quantity
              }
            }
            let q1 = quantity
            q1 = Math.min(Math.floor(((unit2.health*0.4)/unit2.healthMax)/0.1),q1)
            Unit.addModifier(unit2, cardId_custom4, underworld, prediction, Math.min(10,Math.max(q1-sub_amount,0)));
            unit2.mana = Math.floor(Math.min(unit2.manaMax, unit2.mana + unit2.manaMax*0.1*q1))
            Unit.takeDamage(unit2, -Math.floor(q1 * 0.2 * unit2.healthMax), void 0, underworld, prediction)
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
        add: add2,
    },
    events: {
      onTurnStart: async (unit, prediction, underworld) => {
        if (unit.modifiers[cardId_custom4]) {
          if (unit.modifiers[cardId_custom4].quantity>0) {
            unit.mana = Math.floor(Math.max(0, unit.mana - unit.manaMax*0.2*unit.modifiers[cardId_custom4].quantity))
            Unit.takeDamage(unit, Math.floor(unit.modifiers[cardId_custom4].quantity * 0.2 * unit.healthMax), void 0, underworld, prediction)
            Unit.removeModifier(unit, cardId_custom4, underworld)
          }
        }
        return false;
      }
    }
};

function add2(unit, underworld, prediction, quantity, extra) {
  let firstStack = !unit.onTurnStartEvents.includes(cardId_custom4);
  const modifier = cardsUtil.getOrInitModifier(unit, cardId_custom4, {
      isCurse: false, quantity, persistBetweenLevels: false,
  }, () => {
      if (firstStack) {
          unit.onTurnStartEvents.push(cardId_custom4);
      }
  });
}

const cardId_custom5 = 'Equalize'
const spell5: Spell = {
    card: {
        id: cardId_custom5,
        category: CardCategory.Soul,
        supportQuantity: true,
        manaCost: 20,
        healthCost: 0,
        expenseScaling: 1,
        probability: probabilityMap[CardRarity.RARE],
        thumbnail: 'spellmasons-mods/custom_mod/Equalize.png',
        animationPath,
        sfx: 'hurt',
        description: [`Sets health of all targets to average (rounded down, does not give overheal)`],
        effect: async (state, card, quantity, underworld, prediction) => {
			const targets = state.targetedUnits.filter(u => u.alive);
			let overallHealth = 0
			for (let unit2 of targets) {
					overallHealth+=unit2.health
			}
			if (targets.length == 0) {
				refundLastSpell(state, prediction, 'no target, mana refunded')
			} 
      else {
        let goalHealth = Math.floor(overallHealth/targets.length)
        for (let unit2 of targets) {
          unit2.health = Math.min(unit2.healthMax, goalHealth)
        }
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
  }

  const cardId_custom6 = 'Stroll'
  const spell6: Spell = {
      card: {
          id: cardId_custom6,
          category: CardCategory.Curses,
          supportQuantity: true,
          manaCost: 10,
          healthCost: 0,
          expenseScaling: 0.5,
          probability: probabilityMap[CardRarity.UNCOMMON],
          thumbnail: 'spellmasons-mods/custom_mod/Stroll.png',
          animationPath,
          sfx: 'hurt',
          description: [`Curses target unit to be walk at random direction at the end of turn for one turn. Stacking increases strength and number of nodes in path. WARNING: Will be slow on big number of units`],
          effect: async (state, card, quantity, underworld, prediction) => {
            const targets = state.targetedUnits.filter(u => u.alive);
            for (let unit2 of targets) {
              Unit.addModifier(unit2, cardId_custom6, underworld, prediction, quantity);
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
          add: add3,
      },
      events: {
        onTurnEnd: async (unit, prediction, underworld) => {
          if (unit.modifiers[cardId_custom6]) {
            if (unit.modifiers[cardId_custom6].quantity>0) {
              unit.stamina = unit.staminaMax
              let quan = unit.modifiers[cardId_custom6].quantity
              let node_id = 42
              while((quan>0)&&(unit.stamina>1)){
                node_id = (node_id*node_id*underworld.turn_number-node_id)%521
                let diff_x = ((underworld.turn_number*31+quan*19+unit.id*29+node_id*97)%17+20)
                if ((underworld.turn_number*31+quan*23+unit.id*47+node_id*97)%2==1) {
                  diff_x=-diff_x
                }
                node_id = (node_id*node_id*underworld.turn_number-node_id)%521
                let diff_y = ((underworld.turn_number*23+quan*59+unit.id*47+node_id*97)%17+20)
                if ((underworld.turn_number*17+quan*29+unit.id*59+node_id*103)%2==1) {
                  diff_y=-diff_y
                }
                await Unit.moveTowards(unit, {x:unit.x+diff_x, y:unit.y+diff_y}, underworld)
                quan--
                node_id = (node_id*node_id*underworld.turn_number-node_id)%521
              }
              unit.modifiers[cardId_custom6].quantity--
              if (unit.modifiers[cardId_custom6].quantity<=0) {
                Unit.removeModifier(unit, cardId_custom6, underworld)
              }
            }
          }
        }
      }
  };
  
  function add3(unit, underworld, prediction, quantity, extra) {
    let firstStack = !unit.onTurnStartEvents.includes(cardId_custom6);
    const modifier = cardsUtil.getOrInitModifier(unit, cardId_custom6, {
        isCurse: true, quantity, persistBetweenLevels: false,
    }, () => {
        if (firstStack) {
            unit.onTurnEndEvents.push(cardId_custom6);
        }
    });
  }


  const cardId_custom7 = 'Mana shield'
  const spell7: Spell = {
      card: {
          id: cardId_custom7,
          category: CardCategory.Blessings,
          supportQuantity: true,
          manaCost: 20,
          healthCost: 0,
          expenseScaling: 1,
          probability: probabilityMap[CardRarity.UNCOMMON],
          thumbnail: 'spellmasons-mods/custom_mod/Mana shield.png',
          animationPath,
          sfx: 'hurt',
          description: [`When affected unit takes damage, it's mana is used to protect from it. Each point of damage is consumed by 2 mana`],
          effect: async (state, card, quantity, underworld, prediction) => {
            const targets = state.targetedUnits.filter(u => u.alive);
            for (let unit2 of targets) {
              Unit.addModifier(unit2, cardId_custom7, underworld, prediction, 1);
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
          add:add4,
      },
      events: {
        onDamage: (unit, amount, prediction, underworld) => {
          if (amount>0) { 
            if (amount>unit.mana/2) {
              unit.mana = 0
              return Math.floor(amount - unit.mana/2)
            }
            else {
              unit.mana = unit.mana - amount * 2
              return 0
            }
          }
          return amount;
        }
      }
  };
  
  function add4(unit, underworld, prediction, quantity, extra) {
    let firstStack = !unit.onDamageEvents.includes(cardId_custom7);
    const modifier = cardsUtil.getOrInitModifier(unit, cardId_custom7, {
        isCurse: false, quantity, persistBetweenLevels: false,
    }, () => {
        if (firstStack) {
            unit.onDamageEvents.push(cardId_custom7);
        }
    });
  }

  const cardId_custom8 = 'Ritual'
  const spell8: Spell = {
      card: {
          id: cardId_custom8,
          category: CardCategory.Mana,
          supportQuantity: true,
          manaCost: 40,
          healthCost: 0,
          expenseScaling: 2,
          probability: probabilityMap[CardRarity.RARE],
          thumbnail: 'spellmasons-mods/custom_mod/Ritual.png',
          animationPath,
          sfx: 'hurt',
          description: [`Apply 1 Ritual. If unit already has 6 Ritual, cleanse it and fully restore that unit's mana`],
          effect: async (state, card, quantity, underworld, prediction) => {
            const targets = state.targetedUnits.filter(u => u.alive);
            for (let unit2 of targets) {
              Unit.addModifier(unit2, cardId_custom8, underworld, prediction, quantity);
              if (unit2.modifiers[cardId_custom8]) {
                if (unit2.modifiers[cardId_custom8].quantity>=6) {
                  Unit.removeModifier(unit2, cardId_custom8, underworld)
                  unit2.mana = Math.max(unit2.manaMax, unit2.mana)
                  if (unit2 == state.casterUnit) {
                    refundLastSpell(state, prediction, 'Ritual mana restored')
                  }
                }
              }
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
          add:add5,
      },
      events: {
        onDamage: (unit, amount, prediction, underworld) => {
          return amount;
        }
      }
  };
  
  function add5(unit, underworld, prediction, quantity, extra) {
    let firstStack = !unit.onDamageEvents.includes(cardId_custom8);
    const modifier = cardsUtil.getOrInitModifier(unit, cardId_custom8, {
        isCurse: false, quantity, persistBetweenLevels: false,
    }, () => {
        if (firstStack) {
            unit.onDamageEvents.push(cardId_custom8);
        }
    });
  }

  
  const cardId_custom9 = 'Channel'
  const spell9: Spell = {
      card: {
          id: cardId_custom9,
          category: CardCategory.Mana,
          supportQuantity: true,
          manaCost: 10,
          healthCost: 0,
          expenseScaling: 2,
          probability: probabilityMap[CardRarity.UNCOMMON],
          thumbnail: 'spellmasons-mods/custom_mod/Channel.png',
          animationPath,
          sfx: 'hurt',
          description: [`If target's stamina is full, convert each 5 stamina into 1 mana`],
          effect: async (state, card, quantity, underworld, prediction) => {
            const targets = state.targetedUnits.filter(u => u.alive)
            .filter(u => u.stamina >= u.staminaMax).filter(u => u.stamina < Infinity);
            for (let unit2 of targets) {
              unit2.mana = unit2.mana + Math.ceil(unit2.stamina/5)
              unit2.stamina = 0
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
      },
      events: {
      }
  };

  const cardId_custom10 = 'Haste'
  const spell10: Spell = {
      card: {
          id: cardId_custom10,
          category: CardCategory.Movement,
          supportQuantity: true,
          manaCost: 30,
          healthCost: 0,
          expenseScaling: 10,
          probability: probabilityMap[CardRarity.UNCOMMON],
          thumbnail: 'spellmasons-mods/custom_mod/Haste.png',
          animationPath,
          sfx: 'hurt',
          description: [`Doubles target's stamina. Stackable`],
          effect: async (state, card, quantity, underworld, prediction) => {
            const targets = state.targetedUnits.filter(u => u.alive);
            for (let unit2 of targets) {
              unit2.stamina = unit2.stamina*Math.pow(2,quantity)
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
      },
      events: {
      }
  };

  const cardId_custom11 = 'Small Respite'
  const spell11: Spell = {
      card: {
          id: cardId_custom11,
          category: CardCategory.Movement,
          supportQuantity: true,
          manaCost: 10,
          healthCost: 0,
          expenseScaling: 0.5,
          probability: probabilityMap[CardRarity.UNCOMMON],
          thumbnail: 'spellmasons-mods/custom_mod/Small Respite.png',
          animationPath,
          sfx: 'hurt',
          description: [`Target gains 10 stamina. Stackable`],
          effect: async (state, card, quantity, underworld, prediction) => {
            const targets = state.targetedUnits.filter(u => u.alive);
            for (let unit2 of targets) {
              unit2.stamina = unit2.stamina+10*quantity
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
      },
      events: {
      }
  };

  const cardId_custom12 = 'Challenger'
  const spell12: Spell = {
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
            const friends = targets.filter(u=>u.faction==0).filter(u=>!u.isMiniboss)
            const enemies = targets.filter(u=>u.faction==1).filter(u=>!u.isMiniboss)
            if (friends.length>0) {
              if (enemies.length>0) {
                Unit.addModifier(friends[0], cardId_custom12, underworld, prediction, quantity);
                Unit.addModifier(enemies[0], cardId_custom12, underworld, prediction, quantity);
              }
            }

            if ((targets.length == 0)||(enemies.length == 0)||(friends.length == 0)) {
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
        add:add6,
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
          unit.health *= 2
          unit.healthMax *= 2
          unit.image.sprite.scale.x *= 1.5
          unit.image.sprite.scale.y *= 1.5
      }
  });
}

function remove(unit, underworld) {
  if (unit.modifiers && unit.modifiers[cardId_custom12]) {
    unit.isMiniboss = false;
    unit.health /= 2
    unit.healthMax /= 2
    unit.image.sprite.scale.x /= 1.5
    unit.image.sprite.scale.y /= 1.5
  }
}

const cardId_custom13 = 'Catalyst'
const spell13: Spell = {
    card: {
        id: cardId_custom13,
        category: CardCategory.Curses,
        supportQuantity: true,
        manaCost: 120,
        healthCost: 0,
        expenseScaling: 0.5,
        probability: probabilityMap[CardRarity.RARE],
        thumbnail: 'spellmasons-mods/custom_mod/Catalyst.png',
        animationPath,
        sfx: 'hurt',
        description: [`Add 1 to quantity of all curses on target. Stackable`],
        effect: async (state, card, quantity, underworld, prediction) => {
          const targets = state.targetedUnits.filter(u => u.alive);
          for (let unit2 of targets) {
            if (unit2.modifiers) {
              for (let m_k in unit2.modifiers){
                if ((unit2.modifiers[m_k])&&(unit2.modifiers[m_k].isCurse)) {
                  unit2.modifiers[m_k].quantity += quantity
                }
              }
            }
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
    },
    events: {
    }
};

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

//Pickups --------------
const decoy_trap: IPickupSource = {
  imagePath: 'pickups/trap',
  animationSpeed: -config.DEFAULT_ANIMATION_SPEED,
  playerOnly: false,
  name: 'Decoy Trap',
  probability: 70,
  scale: 1,
  description: ['Summons decoy on activation for unit\'s team'],
  init: ({pickup, underworld}) => {
    if (pickup.image && pickup.image.sprite) {
      if (!pickup.image.sprite.filters) {
        pickup.image.sprite.filters = []
      }
      pickup.image.sprite.filters.push(
        new MultiColorReplaceFilter(
          [
            [0xc4c4c4, 0x3ccbff], 
            [0xd4d4d4, 0x3ccbff], 
            [0xd8f009, 0x3ccbff] 
          ],
          0.05
        )
      );
    }
  },
  willTrigger: ({ unit, player, pickup, underworld }) => {
    return !!unit;
  },
  effect: ({ unit, player, pickup, prediction, underworld }) => {
    if (unit) {
      const unitId = 'decoy';
      const sourceUnit = globalThis.allUnits[unitId];
      if (sourceUnit) {
        const summonLocation = {
          x: pickup.x,
          y: pickup.y
        }
        const unit2 = Unit.create(
          sourceUnit.id,
          summonLocation.x,
          summonLocation.y,
          unit.faction,
          sourceUnit.info.image,
          1,
          sourceUnit.info.subtype,
          {
            ...sourceUnit.unitProps,
            strength: 1
          },
          underworld,
          prediction
        );
      } else {
        console.error(`Source unit ${unitId} is missing`);
      }
    }
  }
};
//Units------------------
export const AGOLEM_ID = 'Amalgam Golem';
const amalgam_golem = {
  id: AGOLEM_ID,
  info: {
    description: 'Consumes pickups to grow stronger. Prioritizes that over attacking',
    image: 'units/gruntIdle',
    subtype: 0,
  },
  unitProps: {
    attackRange: 15,
    manaMax: 0,
    damage: 10,
    healthMax: 40,
    bloodColor: 0x959595
  },
  spawnParams: {
    probability: 75,
    budgetCost: 4,
    unavailableUntilLevelIndex: 4,
  },
  animations: {
    idle: 'units/gruntIdle',
    hit: 'units/gruntHit',
    attack: 'units/gruntAttack',
    die: 'units/gruntDeath',
    walk: 'units/gruntWalk',
  },
  sfx: {
    damage: 'archerHurt',
    death: 'archerDeath',
  },
  init: (unit, underworld) => {
    if (unit.image && unit.image.sprite && unit.image.sprite.filters) {
      unit.image.sprite.filters.push(
        new MultiColorReplaceFilter(
          [
            [0x846464, 0x545454],
            [0xe42c04, 0x545454], 
            [0x7c5454, 0x416352]
          ],
          0.05
        )
      );
    }
  },
  action: async (unit, attackTargets, underworld, _canAttackTarget) => {
    let unitTarget = Unit.findClosestUnitInDifferentFaction(unit, underworld);
    unitTarget = unitTarget ? unitTarget : unit
    let closestPickup = getClosestPickup(unit, underworld)
    if (closestPickup != undefined) {
      if (distance(closestPickup, unit)<distance(unitTarget, unit)) {
        let vX = unit.x - closestPickup.x;
        let vY = unit.y - closestPickup.y;
        let magV = Math.sqrt(vX*vX + vY*vY);
        let aX = closestPickup.x + vX / magV * 7;
        let aY = closestPickup.y + vY / magV * 7;
        await Unit.moveTowards(unit, {x: aX, y: aY}, underworld)
      }
      else {
        await Unit.moveTowards(unit, {x: unitTarget.x, y: unitTarget.y}, underworld)
      }
      if (distance(closestPickup, unit)<100) {
        await Unit.playComboAnimation(unit, unit.animations.attack, async () =>
          Pickup.removePickup(closestPickup, underworld, false)
        )
        unit.health = Math.ceil(1.5*unit.health)
        unit.healthMax = Math.ceil(1.5*unit.healthMax)
        unit.damage = Math.ceil(1.5*unit.damage)
        unit.image.sprite.scale.x *= 1.15
        unit.image.sprite.scale.y *= 1.15
      }
      else if (distance(unitTarget, unit)<80) {
        await Unit.playComboAnimation(unit, unit.animations.attack, async () =>
          Unit.takeDamage(unitTarget, unit.damage, unit, underworld, false, undefined)
        )
      }
    }
    else {
      await Unit.moveTowards(unit, {x: unitTarget.x, y: unitTarget.y}, underworld)
      if (distance(unitTarget, unit)<80) {
        await Unit.playComboAnimation(unit, unit.animations.attack, async () =>
          Unit.takeDamage(unitTarget, unit.damage, unit, underworld, false, undefined)
        )
      }
    }
  },
  getUnitAttackTargets: (unit, underworld: Underworld) => {
    let closestPickup = getClosestPickup(unit, underworld)
    let unitTarget = Unit.findClosestUnitInDifferentFaction(unit, underworld);
    if (distance(closestPickup, unit)<distance(unitTarget, unit)) {
      return []
    } 
    else {
      if (unitTarget) {
        return [unitTarget];
      } else {
        return [];
      }
    }
  }
};

const ABSORB_GOLEM_ID = 'Absorbing Golem';
const absorb_golem = {
  id: ABSORB_GOLEM_ID,
  info: {
    description: 'At the start of each turn heal up to 25% health (unaffected by blood curse). Gains stamina and damage equal to amount healed. Gains half as much max health. Kill it as fast as you can',
    image: 'units/gruntIdle',
    subtype: 0,
  },
  unitProps: {
    damage: 10,
    staminaMax: Math.ceil(config.UNIT_BASE_STAMINA * 0.7),
    healthMax: 60,
    manaMax: 0,
    bloodColor: 0x8a2e2e,
  },
  spawnParams: {
    probability: 90,
    budgetCost: 4,
    unavailableUntilLevelIndex: 4,
  },
  animations: {
    idle: 'units/gruntIdle',
    hit: 'units/gruntHit',
    attack: 'units/gruntAttack',
    die: 'units/gruntDeath',
    walk: 'units/gruntWalk',
  },
  sfx: {
    damage: 'archerHurt',
    death: 'golemDeath'
  },
  init: (unit, underworld: Underworld) => {
    if (unit.image && unit.image.sprite && unit.image.sprite.filters) {
      unit.image.sprite.filters.push(
        new MultiColorReplaceFilter(
          [
            [0x846464, 0xbdad04], 
            [0x7c5454, 0xbdad04] 
          ],
          0.05
        )
      );
    }
  },
  action: async (unit, attackTargets, underworld: Underworld, canAttackTarget: boolean) => {
    let healthToRestore = Math.min(Math.max(0, unit.healthMax - unit.health),Math.ceil(unit.healthMax*0.25))
    unit.health += healthToRestore
    unit.damage += healthToRestore
    unit.stamina += healthToRestore
    unit.staminaMax += healthToRestore
    unit.healthMax += Math.floor(healthToRestore*0.5)
    await meleeAction.meleeAction(unit, attackTargets, underworld, canAttackTarget, async (attackTarget) => {
      await Unit.playComboAnimation(unit, unit.animations.attack, async () =>
        Unit.takeDamage(attackTarget, unit.damage, unit, underworld, false, undefined)
      );
    })
  },
  getUnitAttackTargets: (unit, underworld: Underworld) => {
    const closestUnit = Unit.findClosestUnitInDifferentFaction(unit, underworld);
    if (closestUnit) {
      return [closestUnit];
    } else {
      return [];
    }
  }
}

function distance(a, b) {
  if ((a == undefined)||(b == undefined)) {
    return 999999
  }
  return Math.sqrt(Math.pow(a.x-b.x,2)+Math.pow(a.y-b.y, 2))
}

function getClosestPickup(unit, underworld) {
  let closestPickup = undefined
  let closestDistance = Infinity
  for (let tmp_pickup of underworld.pickups) {
    if (distance(tmp_pickup, unit)<=closestDistance) {
      closestDistance = distance(tmp_pickup, unit)
      closestPickup = tmp_pickup
    }
  }
  return closestPickup
}

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

import { Spell } from '../types/cards/index';
import Underworld from '../types/Underworld';

const {
  commonTypes,
  MultiColorReplaceFilter,
} = globalThis.SpellmasonsAPI;
const Unit = globalThis.SpellmasonsAPI.Unit;
const { CardCategory, probabilityMap, CardRarity } = commonTypes;

const animationPath = 'spellUndeadBlade';

const cardId_custom15 = 'Spell Prism(self)';
export const spell15: Spell = {
  card: {
    id: cardId_custom15,
    category: CardCategory.Targeting,
    supportQuantity: true,
    manaCost: 120,
    healthCost: 0,
    expenseScaling: 0.5,
    probability: probabilityMap[CardRarity.RARE],
    thumbnail: 'spellmasons-mods/custom_mod/Prism.png',
    animationPath,
    sfx: 'hurt',
    description: [`Summons spell prism, which will cast spell for you, targeting itself. Prism has 100 mana. MUltiple casts add 50 per cast`],
    requiresFollowingCard: true,
    effect: async (state, card, quantity, underworld, prediction) => {
      let remainingSpells = [];
      let toAdd = false;
      for (let spellCard of state.cardIds) {
        if ((toAdd) && (spellCard != cardId_custom15)) {
          remainingSpells.push(spellCard);
        }
        if (spellCard == cardId_custom15) {
          toAdd = true;
        }
      }
      state.cardIds = [];
      const unit2 = Unit.create(
        CAST_PRISM_SELF_ID,
        state.casterUnit.x,
        state.casterUnit.y,
        state.casterUnit.faction,
        cast_prism_self.info.image,
        1,
        cast_prism_self.info.subtype,
        {
          ...cast_prism_self.unitProps,
          strength: 1
        },
        underworld,
        prediction
      );
      unit2.spellPrismSpell = remainingSpells;
      unit2.manaMax = 50 + 50 * quantity;
      unit2.mana = 50 + 50 * quantity;
      if (!prediction && !globalThis.headless) {
        await new Promise((resolve) => {
          setTimeout(resolve, 100);
        });
      }
      return state;
    },
  },
  modifiers: {},
  events: {}
};
const cardId_custom16 = 'Spell Prism(Closest Enemy)';
export const spell16: Spell = {
  card: {
    id: cardId_custom16,
    category: CardCategory.Targeting,
    supportQuantity: true,
    manaCost: 120,
    healthCost: 0,
    expenseScaling: 0.5,
    probability: probabilityMap[CardRarity.RARE],
    thumbnail: 'spellmasons-mods/custom_mod/PrismEnemy.png',
    animationPath,
    sfx: 'hurt',
    description: [`Summons spell prism, which will cast spell for you, targeting closest enemy. Prism has 100 mana. MUltiple casts add 50 per cast`],
    requiresFollowingCard: true,
    requires: [cardId_custom15],
    effect: async (state, card, quantity, underworld, prediction) => {
      let remainingSpells = [];
      let toAdd = false;
      for (let spellCard of state.cardIds) {
        if ((toAdd) && (spellCard != cardId_custom16)) {
          remainingSpells.push(spellCard);
        }
        if (spellCard == cardId_custom16) {
          toAdd = true;
        }
      }
      state.cardIds = [];
      const unit2 = Unit.create(
        CAST_PRISM_ENEMY_ID,
        state.casterUnit.x,
        state.casterUnit.y,
        state.casterUnit.faction,
        cast_prism_self.info.image,
        1,
        cast_prism_self.info.subtype,
        {
          ...cast_prism_self.unitProps,
          strength: 1
        },
        underworld,
        prediction
      );
      unit2.spellPrismSpell = remainingSpells;
      unit2.manaMax = 50 + 50 * quantity;
      unit2.mana = 50 + 50 * quantity;
      unit2.attackRange = 100 + state.aggregator.radius;
      if (!prediction && !globalThis.headless) {
        await new Promise((resolve) => {
          setTimeout(resolve, 100);
        });
      }
      return state;
    },
  },
  modifiers: {},
  events: {}
};
const cardId_custom17 = 'Spell Prism(Closest Ally)';
export const spell17: Spell = {
  card: {
    id: cardId_custom17,
    category: CardCategory.Targeting,
    supportQuantity: true,
    manaCost: 120,
    healthCost: 0,
    expenseScaling: 0.5,
    probability: probabilityMap[CardRarity.RARE],
    thumbnail: 'spellmasons-mods/custom_mod/PrismAlly.png',
    animationPath,
    sfx: 'hurt',
    description: [`Summons spell prism, which will cast spell for you, targeting closest ally. Prism has 100 mana. MUltiple casts add 50 per cast`],
    requiresFollowingCard: true,
    requires: [cardId_custom15],
    effect: async (state, card, quantity, underworld, prediction) => {
      let remainingSpells = [];
      let toAdd = false;
      for (let spellCard of state.cardIds) {
        if ((toAdd) && (spellCard != cardId_custom17)) {
          remainingSpells.push(spellCard);
        }
        if (spellCard == cardId_custom17) {
          toAdd = true;
        }
      }
      state.cardIds = [];
      const unit2 = Unit.create(
        CAST_PRISM_ALLY_ID,
        state.casterUnit.x,
        state.casterUnit.y,
        state.casterUnit.faction,
        cast_prism_self.info.image,
        1,
        cast_prism_self.info.subtype,
        {
          ...cast_prism_self.unitProps,
          strength: 1
        },
        underworld,
        prediction
      );
      unit2.spellPrismSpell = remainingSpells;
      unit2.manaMax = 50 + 50 * quantity;
      unit2.mana = 50 + 50 * quantity;
      unit2.attackRange = 100 + state.aggregator.radius;
      if (!prediction && !globalThis.headless) {
        await new Promise((resolve) => {
          setTimeout(resolve, 100);
        });
      }
      return state;
    },
  },
  modifiers: {},
  events: {}
};

export const CAST_PRISM_SELF_ID = 'Cast prism (self)';
export const cast_prism_self = {
  id: CAST_PRISM_SELF_ID,
  info: {
    description: 'Casts spell on itsel instead of attacking.',
    image: 'units/gruntIdle',
    subtype: 0,
  },
  unitProps: {
    damage: 10,
    staminaMax: 0,
    healthMax: 100,
    manaMax: 0,
    bloodColor: 0x8a2e2e,
  },
  spawnParams: {
    probability: 0,
    budgetCost: 2,
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
    unit.spellPrismSpell = ["Slash"]
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
    if (attackTargets&&canAttackTarget) {
      if (unit.mana<0) {
        unit.mana = 0
      }
      let state = await underworld.castCards({
        casterCardUsage: {},
        casterUnit: unit,
        casterPositionAtTimeOfCast: {x: unit.x, y: unit.y},
        cardIds: unit.spellPrismSpell,
        castLocation: {x: unit.x, y: unit.y},
        prediction: false,
        initialTargetedUnitId: unit.id
      })
      await new Promise((resolve) => {
        setTimeout(resolve, 200);
      });
      if (unit.mana<0) {
        unit.mana = 0
      }
    }
    else {
      if (attackTargets) {
        let state = await underworld.castCards({
          casterCardUsage: {},
          casterUnit: unit,
          casterPositionAtTimeOfCast: {x: unit.x, y: unit.y},
          cardIds: unit.spellPrismSpell,
          castLocation: {x: unit.x, y: unit.y},
          prediction: true,
          initialTargetedUnitId: unit.id
        })
      }
    }
  },
  getUnitAttackTargets: (unit, underworld: Underworld) => {
    let tmpMana = unit.mana
    if (unit.mana>0) {
      let k = false
      underworld.castCards({
        casterCardUsage: {},
        casterUnit: unit,
        casterPositionAtTimeOfCast: {x: unit.x, y: unit.y},
        cardIds: unit.spellPrismSpell,
        castLocation: {x: unit.x, y: unit.y},
        prediction: true
      }).then(() => {
        k = true;
        if (unit.mana>0) {
          unit.mana = tmpMana
        }
      })
      while (!k) {let p = 0; p++}
      if (unit.mana<0) {
        unit.mana = 0
        return undefined
      }
      unit.mana = tmpMana
      return [unit];
    }
    unit.mana = 0
    return undefined
  }
}

export const CAST_PRISM_ENEMY_ID = 'Cast prism (Closest enemy)';
export const cast_prism_enemy = {
  id: CAST_PRISM_ENEMY_ID,
  info: {
    description: 'Casts spell on closest enemy in range instead of attacking.',
    image: 'units/gruntIdle',
    subtype: 2,
  },
  unitProps: {
    damage: 10,
    staminaMax: 0,
    healthMax: 100,
    manaMax: 0,
    bloodColor: 0x8a2e2e,
    attackRange: 400
  },
  spawnParams: {
    probability: 0,
    budgetCost: 2,
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
    unit.spellPrismSpell = ["Slash"]
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
    if (attackTargets&&canAttackTarget) {
      let unitTarget = Unit.findClosestUnitInDifferentFaction(unit, underworld);
      if (distance(unitTarget, unit)<unit.attackRange) {
        let state = await underworld.castCards({
          casterCardUsage: {},
          casterUnit: unit,
          casterPositionAtTimeOfCast: {x: unit.x, y: unit.y},
          cardIds: unit.spellPrismSpell,
          castLocation: unitTarget ? {x: unitTarget.x, y: unitTarget.y} : {x: unit.x, y: unit.y},
          prediction: false
        })
      }
      await new Promise((resolve) => {
        setTimeout(resolve, 200);
      });
    }
    else {
      if (attackTargets) {
        let unitTarget = Unit.findClosestUnitInDifferentFaction(unit, underworld);
        if (distance(unitTarget, unit)<unit.attackRange) {
          let state = await underworld.castCards({
            casterCardUsage: {},
            casterUnit: unit,
            casterPositionAtTimeOfCast: {x: unit.x, y: unit.y},
            cardIds: unit.spellPrismSpell,
            castLocation: unitTarget ? {x: unitTarget.x, y: unitTarget.y} : {x: unit.x, y: unit.y},
            prediction: true
          })
        }
      }
    }
  },
  getUnitAttackTargets: (unit, underworld: Underworld) => {
    let tmpMana = unit.mana
    if (unit.mana<=0) {
      unit.mana = 0
      return undefined
    }
    let k = false
    let unitTarget = Unit.findClosestUnitInDifferentFaction(unit, underworld);
    if (distance(unitTarget, unit)<unit.attackRange) {
      underworld.castCards({
        casterCardUsage: {},
        casterUnit: unit,
        casterPositionAtTimeOfCast: {x: unit.x, y: unit.y},
        cardIds: unit.spellPrismSpell,
        castLocation: unitTarget ? {x: unitTarget.x, y: unitTarget.y} : {x: unit.x, y: unit.y},
        prediction: true,
        outOfRange: distance(unitTarget, unit)>unit.attackRange
      }).then(() => {
        k = true;
        if (unit.mana>0) {
          unit.mana = tmpMana
        }
      })
    }
    while(!k) {}
    if (unit.mana<0) {
      unit.mana = 0
      return undefined
    }
    unit.mana = tmpMana
    return [unitTarget ? unitTarget : unit];
  }
}

export const CAST_PRISM_ALLY_ID = 'Cast prism (Closest ally)';
export const cast_prism_ally = {
  id: CAST_PRISM_ALLY_ID,
  info: {
    description: 'Casts spell on closest ally in range instead of attacking.',
    image: 'units/gruntIdle',
    subtype: 2,
  },
  unitProps: {
    damage: 10,
    staminaMax: 0,
    healthMax: 100,
    manaMax: 0,
    bloodColor: 0x8a2e2e,
    attackRange: 400
  },
  spawnParams: {
    probability: 0,
    budgetCost: 2,
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
    unit.spellPrismSpell = ["Slash"]
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
    if (attackTargets&&canAttackTarget) {
      let unitTarget = Unit.findClosestUnitInSameFaction(unit, underworld);
      if (distance(unitTarget, unit)<unit.attackRange) {
        let state = await underworld.castCards({
          casterCardUsage: {},
          casterUnit: unit,
          casterPositionAtTimeOfCast: {x: unit.x, y: unit.y},
          cardIds: unit.spellPrismSpell,
          castLocation: unitTarget ? {x: unitTarget.x, y: unitTarget.y} : {x: unit.x, y: unit.y},
          prediction: false
        })
      }
      await new Promise((resolve) => {
        setTimeout(resolve, 200);
      });
    }
    else {
      if (attackTargets) {
        let unitTarget = Unit.findClosestUnitInSameFaction(unit, underworld);
        if (distance(unitTarget, unit)<unit.attackRange) {
          let state = await underworld.castCards({
            casterCardUsage: {},
            casterUnit: unit,
            casterPositionAtTimeOfCast: {x: unit.x, y: unit.y},
            cardIds: unit.spellPrismSpell,
            castLocation: unitTarget ? {x: unitTarget.x, y: unitTarget.y} : {x: unit.x, y: unit.y},
            prediction: true
          })
        }
      }
    }
  },
  getUnitAttackTargets: (unit, underworld: Underworld) => {
    let tmpMana = unit.mana
    if (unit.mana<=0) {
      unit.mana = 0
      return undefined
    }
    let k =false
    let unitTarget = Unit.findClosestUnitInSameFaction(unit, underworld);
    if (distance(unitTarget, unit)<unit.attackRange) {
      underworld.castCards({
        casterCardUsage: {},
        casterUnit: unit,
        casterPositionAtTimeOfCast: {x: unit.x, y: unit.y},
        cardIds: unit.spellPrismSpell,
        castLocation: unitTarget ? {x: unitTarget.x, y: unitTarget.y} : {x: unit.x, y: unit.y},
        prediction: true,
        outOfRange: distance(unitTarget, unit)>unit.attackRange
      }).then(() => {
        k = true;
        if (unit.mana>0) {
          unit.mana = tmpMana
        }
      })
    }
    while (!k) {}
    if (unit.mana<0) {
      unit.mana = tmpMana
      return undefined
    }
    unit.mana = tmpMana
    return [unitTarget ? unitTarget : unit];
  }
}

function distance(a, b) {
  if ((a == undefined)||(b == undefined)) {
    return 999999
  }
  return Math.sqrt(Math.pow(a.x-b.x,2)+Math.pow(a.y-b.y, 2))
}
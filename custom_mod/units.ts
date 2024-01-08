import Underworld from '../types/Underworld';

const {
  config,
  MultiColorReplaceFilter,
  Pickup,
  meleeAction
} = globalThis.SpellmasonsAPI;
export const Unit = globalThis.SpellmasonsAPI.Unit;

//Units------------------
export const AGOLEM_ID = 'Amalgam Golem';
export const amalgam_golem = {
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
    unitTarget = unitTarget ? unitTarget : unit;
    let closestPickup = getClosestPickup(unit, underworld);
    if (closestPickup != undefined) {
      if (distance(closestPickup, unit) < distance(unitTarget, unit)) {
        let vX = unit.x - closestPickup.x;
        let vY = unit.y - closestPickup.y;
        let magV = Math.sqrt(vX * vX + vY * vY);
        let aX = closestPickup.x + vX / magV * 7;
        let aY = closestPickup.y + vY / magV * 7;
        await Unit.moveTowards(unit, { x: aX, y: aY }, underworld);
      }
      else {
        await Unit.moveTowards(unit, { x: unitTarget.x, y: unitTarget.y }, underworld);
      }
      if (distance(closestPickup, unit) < 100) {
        await Unit.playComboAnimation(unit, unit.animations.attack, async () => Pickup.removePickup(closestPickup, underworld, false)
        );
        unit.health = Math.ceil(1.5 * unit.health);
        unit.healthMax = Math.ceil(1.5 * unit.healthMax);
        unit.damage = Math.ceil(1.5 * unit.damage);
        unit.image.sprite.scale.x *= 1.15;
        unit.image.sprite.scale.y *= 1.15;
      }
      else if (distance(unitTarget, unit) < 80) {
        await Unit.playComboAnimation(unit, unit.animations.attack, async () => Unit.takeDamage(unitTarget, unit.damage, unit, underworld, false, undefined)
        );
      }
    }
    else {
      await Unit.moveTowards(unit, { x: unitTarget.x, y: unitTarget.y }, underworld);
      if (distance(unitTarget, unit) < 80) {
        await Unit.playComboAnimation(unit, unit.animations.attack, async () => Unit.takeDamage(unitTarget, unit.damage, unit, underworld, false, undefined)
        );
      }
    }
  },
  getUnitAttackTargets: (unit, underworld: Underworld) => {
    let closestPickup = getClosestPickup(unit, underworld);
    let unitTarget = Unit.findClosestUnitInDifferentFaction(unit, underworld);
    if (distance(closestPickup, unit) < distance(unitTarget, unit)) {
      return [];
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
export const absorb_golem = {
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
    let healthToRestore = Math.min(Math.max(0, unit.healthMax - unit.health), Math.ceil(unit.healthMax * 0.25));
    unit.health += healthToRestore;
    unit.damage += healthToRestore;
    unit.stamina += healthToRestore;
    unit.staminaMax += healthToRestore;
    unit.healthMax += Math.floor(healthToRestore * 0.5);
    await meleeAction.meleeAction(unit, attackTargets, underworld, canAttackTarget, async (attackTarget) => {
      await Unit.playComboAnimation(unit, unit.animations.attack, async () => Unit.takeDamage(attackTarget, unit.damage, unit, underworld, false, undefined)
      );
    });
  },
  getUnitAttackTargets: (unit, underworld: Underworld) => {
    const closestUnit = Unit.findClosestUnitInDifferentFaction(unit, underworld);
    if (closestUnit) {
      return [closestUnit];
    } else {
      return [];
    }
  }
};
function distance(a, b) {
  if ((a == undefined) || (b == undefined)) {
    return 999999;
  }
  return Math.sqrt(Math.pow(a.x - b.x, 2) + Math.pow(a.y - b.y, 2));
}
function getClosestPickup(unit, underworld) {
  let closestPickup = undefined;
  let closestDistance = Infinity;
  for (let tmp_pickup of underworld.pickups) {
    if (distance(tmp_pickup, unit) <= closestDistance) {
      closestDistance = distance(tmp_pickup, unit);
      closestPickup = tmp_pickup;
    }
  }
  return closestPickup;
}

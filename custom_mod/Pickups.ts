import { IPickupSource } from '../types/entity/Pickup';

const {
    config,
    MultiColorReplaceFilter
} = globalThis.SpellmasonsAPI;
const Unit = globalThis.SpellmasonsAPI.Unit;
//Pickups --------------
export const decoy_trap: IPickupSource = {
  imagePath: 'pickups/trap',
  animationSpeed: -config.DEFAULT_ANIMATION_SPEED,
  playerOnly: false,
  name: 'Decoy Trap',
  probability: 70,
  scale: 1,
  description: ['Summons decoy on activation for unit\'s team'],
  init: ({ pickup, underworld }) => {
    if (pickup.image && pickup.image.sprite) {
      if (!pickup.image.sprite.filters) {
        pickup.image.sprite.filters = [];
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
        };
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

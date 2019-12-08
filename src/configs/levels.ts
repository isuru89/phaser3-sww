import { ILevelConfig, ItemType, BallConfigs } from "./config-models";

export const LEVELS: Array<ILevelConfig> = [
  {
    id: 1,
    ammoCount: 20,
    initialPlayerPosition: 300,
    balls: [
      { id: 1, x: 50, y: 300 , size: 3, initVelocityX: 120, initVelocityY: 275 } as BallConfigs
    ],
    itemAvailability: {
      [ItemType.NOTHING]: .3,
      [ItemType.BONUS_POINTS]: .1,
      [ItemType.BOMB]: .2,
      [ItemType.INVINCIBLE]: .05,
      [ItemType.ONE_UP]: .05,
      [ItemType.RUN_SPEED]: .3
    }
  } as ILevelConfig,
  {
    id: 2,
    ammoCount: 20,
    initialPlayerPosition: 400,
    balls: [
      { id: 1, x: 50, y: 300 , size: 3, initVelocityX: 120, initVelocityY: 275 } as BallConfigs,
      { id: 1, x: 550, y: 300 , size: 3, initVelocityX: 120, initVelocityY: 275 } as BallConfigs
    ],
    itemAvailability: {
      [ItemType.NOTHING]: .3,
      [ItemType.BONUS_POINTS]: .1,
      [ItemType.BOMB]: .2,
      [ItemType.INVINCIBLE]: .05,
      [ItemType.ONE_UP]: .05,
      [ItemType.RUN_SPEED]: .3
    },
    robotAvailability: {
      initialRobotDelay: 2000,
      intervalRange: [2000, 5000]
    }
  } as ILevelConfig
];
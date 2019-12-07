
export interface BallConfigs {
  id: number;
  size: number;
  x: number;
  y: number;
  initVelocityX: number;
  initVelocityY: number;
};

export enum ItemType {
  ONE_UP = 1,
  BULLET_DAMAGE,
  BULLET_SPEED,
  BONUS_POINTS,
  INVINCIBLE,
  DAMAGE_ALL,
  RUN_SPEED,
  BOMB,
  NOTHING
};

export interface IItemDef {
  points: number,
  collectible: boolean,
  name: string,
  aliveTime: number,
  explosive?: boolean,
  sprite: string,
};

export interface IRobotConfigs {
  initialRobotDelay: number,
  intervalRange: Array<number>,
  nextSpawnOnlyAfterKill?: boolean
}

export interface ILevelConfig {
  id: number,
  initialPlayerPosition: number,
  ammoCount: number,
  balls: Array<BallConfigs>,
  itemAvailability: Array<{[key: number]: number}>,
  robotAvailability?: IRobotConfigs
}
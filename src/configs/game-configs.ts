import { IItemDef, ItemType } from "./config-models";

// player configurations
// ---------------------------------------------
export const PLAYER_INITIAL_POSITION_Y = 450;
export const PLAYER_GRAVITY = 650;

// default running speed of the player
export const PLAYER_DEFAULT_RUN_SPEED = 220;
// default speed increment when an speed item picked it up
export const PLAYER_RUN_SPEED_INCREMENT = 200;
export const PLAYER_JUMP_VELOCITY = -400;

// Ball configs
// --------------------------------------------------
export const BALL_BOUNCE_LOSS = 0.985;
export const BALL_MASS = 100;

export const BALL_DEFAULT_VELOCITY_Y = 120;
export const BALL_DEFAULT_VELOCITY_X = 120;

// Bullets Configurations
// --------------------------------------------------
// range must be 0.2 to 0.8
export const BULLETS_DEFAULT_SHOOTING_SPEED = 0.2;
export const BULLETS_SHOOTING_SPEED_INCREMENT = 0.2;
export const BULLETS_MAX_SHOOTING_SPEED = 0.8;

export const BULLETS_TIME_INTERVAL = 500;
export const BULLET_UPWARD_SPEED = -700;

export const BULLET_DEFAULT_DAMAGE_POWER = 1;
export const BULLET_DAMAGE_POWER_INCREMENT = 1;

// Robot Configurations
// --------------------------------------------------

export const ROBOT_GENERATION_MIN_X = 50;
export const ROBOT_GENERATION_MAX_X = 700;

export const ROBOT_DEFAULT_HEALTH = 3;
export const ROBOT_DEFAULT_SPEED = Phaser.Math.GetSpeed(600, 6);

export const ROBOT_HALT_WHEN_HIT = true;

// Points
// --------------------------------------------------
export const POINTS_ROBOT_HIT_WHILE_ADJUSTING = 500;
export const POINTS_ROBOT_KILL = 200;
export const POINTS_MULTIPLIER_FACTOR_WHEN_JUMPING = 2;

// power items
// --------------------------------------------------

// specify the default time range which the collected
// power should be activated. After this much of time
// the power will be over.
export const POWER_ITEM_DEFAULT_ACTIVE_TIME = 8000;
export const POWER_ITEM_FALLING_SPEED = 120;

export const ITEM_DEFS: { [key: number]: IItemDef } = {
  [ItemType.ONE_UP]: {
    name: 'One up',
    sprite: 'item_oneup',
    points: 10,
    collectible: true,
    aliveTime: 4000,
  },
  [ItemType.BULLET_DAMAGE]: {
    name: 'Bullet Damage',
    sprite: 'item_bulletdamage',
    points: 10,
    collectible: true,
    aliveTime: 4000,
  },
  [ItemType.BULLET_SPEED]: {
    name: 'Bullet Speed',
    sprite: 'item_bulletspeed',
    points: 10,
    collectible: true,
    aliveTime: 4000,
  },
  [ItemType.BONUS_POINTS]: {
    name: 'One up',
    sprite: 'item_bonuspoints',
    points: 250,
    collectible: true,
    aliveTime: 4000,
  },
  [ItemType.DAMAGE_ALL]: {
    name: 'Damage All',
    sprite: 'item_damageall',
    points: 100,
    collectible: true,
    aliveTime: 4000,
  },
  [ItemType.INVINCIBLE]: {
    name: 'Invincible',
    sprite: 'item_invincible',
    points: 50,
    collectible: true,
    aliveTime: 4000,
  },
  [ItemType.RUN_SPEED]: {
    name: 'Run Speed',
    sprite: 'item_runspeed',
    points: 10,
    collectible: true,
    aliveTime: 4000,
  },
  [ItemType.BOMB]: {
    name: 'Bomb',
    sprite: 'item_bomb',
    points: 0,
    collectible: false,
    aliveTime: 1000,
    explosive: true
  },
  [ItemType.NOTHING]: {
    sprite: 'item_none',
    name: 'none',
    points: 0,
    collectible: false,
    aliveTime: 0,
  }
};
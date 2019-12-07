import { Scene } from "phaser";
import { Balls } from "./balls";
import { PLAYER_DEFAULT_RUN_SPEED, PLAYER_RUN_SPEED_INCREMENT, PLAYER_GRAVITY, POWER_ITEM_DEFAULT_ACTIVE_TIME } from "../configs/game-configs";
import ExpandingTimer from "../utils/expandingTimer";

export class Player extends Phaser.Physics.Arcade.Sprite {

  public runningSpeed: number = PLAYER_DEFAULT_RUN_SPEED;

  private invincibleTimer: ExpandingTimer;
  private speedingTimer: ExpandingTimer;

  public invincible = false;

  constructor(scene: Scene, x: number, y: number) {
    super(scene, x, y, 'dude');
    
    this.invincibleTimer = new ExpandingTimer(scene);
    this.speedingTimer = new ExpandingTimer(scene);
    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.setSize(16, 40)
      .setOffset(8, 8)
      .setBounce(0)
      .setCollideWorldBounds(true)
      .setGravityY(PLAYER_GRAVITY);
  }

  private clearInvincibility(colliders: Phaser.Physics.Arcade.Collider[]) {
    colliders.forEach(col => col.active = true);
    this.invincible = false;
    this.setAlpha(1);
  }

  makeInvincibleFor(colliders: Phaser.Physics.Arcade.Collider[], expireIn: number = POWER_ITEM_DEFAULT_ACTIVE_TIME) {
    colliders.forEach(col => col.active = false);
    this.invincible = true;
    this.setAlpha(0.4);

    this.invincibleTimer.expandTo({
      delay: expireIn,
      callback: this.clearInvincibility,
      args: [colliders],
      callbackScope: this,
    });
  }

  private clearRunningSpeed() {
    this.runningSpeed = Math.max(PLAYER_DEFAULT_RUN_SPEED, this.runningSpeed - PLAYER_RUN_SPEED_INCREMENT);
  }

  increaseRunSpeed(expireIn: number = POWER_ITEM_DEFAULT_ACTIVE_TIME) {
    this.runningSpeed += PLAYER_RUN_SPEED_INCREMENT;
    this.speedingTimer.expandTo({
      delay: expireIn,
      callbackScope: this,
      callback: this.clearRunningSpeed,
      args: []
    });
  }

}
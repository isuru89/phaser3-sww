import { Scene } from "phaser";
import { BULLETS_DEFAULT_SHOOTING_SPEED, BULLETS_SHOOTING_SPEED_INCREMENT, BULLETS_MAX_SHOOTING_SPEED, BULLETS_TIME_INTERVAL, BULLET_UPWARD_SPEED, BULLET_DEFAULT_DAMAGE_POWER, BULLET_DAMAGE_POWER_INCREMENT, POWER_ITEM_DEFAULT_ACTIVE_TIME } from "../configs/game-configs";

export class Bullets extends Phaser.Physics.Arcade.Group {
  private shootingSpeed: number;
  private bulletPower: number = BULLET_DEFAULT_DAMAGE_POWER;

  private lastFireTime: number = 0;
  private prevTimer: Phaser.Time.TimerEvent;

  constructor(scene: Scene) {
    super(scene.physics.world, scene, {
      allowGravity: false
    });

    this.shootingSpeed = BULLETS_DEFAULT_SHOOTING_SPEED;
  }

  increaseBulletPower(expireIn: number = POWER_ITEM_DEFAULT_ACTIVE_TIME) {
    this.bulletPower += BULLET_DAMAGE_POWER_INCREMENT;
    this.scene.time.delayedCall(expireIn, () => {
      this.bulletPower = BULLET_DEFAULT_DAMAGE_POWER;
    }, [this], this);
  }

  increaseShootingSpeed(expireIn: number = POWER_ITEM_DEFAULT_ACTIVE_TIME) {
    this.shootingSpeed += BULLETS_SHOOTING_SPEED_INCREMENT;
    this.shootingSpeed = Math.min(this.shootingSpeed, BULLETS_MAX_SHOOTING_SPEED);

    if (this.prevTimer && !this.prevTimer.hasDispatched) {
      this.prevTimer.remove();
    }
    this.prevTimer = this.scene.time.delayedCall(expireIn, () => {
      this.shootingSpeed = BULLETS_DEFAULT_SHOOTING_SPEED;
      this.prevTimer = null;
    }, [this], this);
  }

  fire(x: number, y: number) {
    const time = this.scene.time.now;
    if (this.lastFireTime < time - ((1 - this.shootingSpeed) * BULLETS_TIME_INTERVAL)) {
      const bullet = this.create(x, y, 'bullet') as Phaser.Physics.Arcade.Sprite;
      this.scene.sound.playAudioSprite('sfx', 'shot');
      bullet.setData('damage', this.bulletPower);
      bullet.setVelocityY(BULLET_UPWARD_SPEED);
      this.lastFireTime = time;
      return true;
    }
    return false;
  }

}
import { Scene } from "phaser";

export class Bullets extends Phaser.Physics.Arcade.Group {
  private readonly DEFAULT_SHOOTING_SPEED = 0.2;
  private readonly SHOOTING_SPEED_INCREMENT = 0.1;
  private readonly MAX_SHOOTING_SPEED = 0.8;
  private shootingSpeed: number;
  private bulletPower = 1;

  private lastFireTime: number = 0;
  private prevTimer: Phaser.Time.TimerEvent;

  constructor(scene: Scene) {
    super(scene.physics.world, scene, {
      allowGravity: false
    });

    this.shootingSpeed = this.DEFAULT_SHOOTING_SPEED;
  }

  increaseBulletPower(expireIn: number = 8000) {
    this.bulletPower += 1;
    this.scene.time.delayedCall(expireIn, () => {
      this.bulletPower = 1;
    }, [this], this);
  }

  increaseShootingSpeed(expireIn: number = 8000) {
    this.shootingSpeed += this.SHOOTING_SPEED_INCREMENT;
    this.shootingSpeed = Math.min(this.shootingSpeed, this.MAX_SHOOTING_SPEED);

    if (this.prevTimer && !this.prevTimer.hasDispatched) {
      this.prevTimer.remove();
    }
    this.prevTimer = this.scene.time.delayedCall(expireIn, () => {
      this.shootingSpeed = this.DEFAULT_SHOOTING_SPEED;
      this.prevTimer = null;
    }, [this], this);
  }

  fire(x: number, y: number) {
    const time = this.scene.time.now;
    if (this.lastFireTime < time - ((1 - this.shootingSpeed) * 500)) {
      const bullet = this.create(x, y, 'bullet') as Phaser.Physics.Arcade.Sprite;
      this.scene.sound.playAudioSprite('sfx', 'shot');
      bullet.setData('damage', this.bulletPower);
      bullet.setVelocityY(-700);
      this.lastFireTime = time;
    }
  }

}
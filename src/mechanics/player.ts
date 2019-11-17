import { Scene } from "phaser";
import { Balls } from "./balls";

export class Player extends Phaser.Physics.Arcade.Sprite {

  invincible = false;

  constructor(scene: Scene, x: number, y: number) {
    super(scene, x, y, 'dude');
    
    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.setSize(24, 40)
      .setOffset(4, 8)
      .setBounce(0)
      .setCollideWorldBounds(true)
      .setGravityY(650);
  }

  makeInvincibleFor(colliders: Phaser.Physics.Arcade.Collider[], expireIn: number = 8000) {
    colliders.forEach(col => col.active = false);
    this.setAlpha(0.5);
    this.invincible = true;
    this.scene.time.delayedCall(expireIn, 
      (colliders: Phaser.Physics.Arcade.Collider[]) => {
        this.invincible = false;
        colliders.forEach(col => col.active = true);
        this.setAlpha(1);
      }, 
      [colliders], this);
  }
}
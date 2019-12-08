import { EventEmitter } from "events";
import { Items } from "./items";
import { ALL_BALLS_CLEARED } from "./events";
import { BallConfigs } from "../configs/config-models";
import { BALL_BOUNCE_LOSS, BALL_MASS, BALL_DEFAULT_VELOCITY_X, BALL_DEFAULT_VELOCITY_Y } from "../configs/game-configs";

export class Balls extends Phaser.Physics.Arcade.Group {

  private emitter: EventEmitter = new EventEmitter();
  private items: Items;

  constructor(scene: Phaser.Scene, ballsArray: Array<BallConfigs> = []) {
    super(scene.physics.world, scene, {
      collideWorldBounds: true
    });

    for (let index = 0; index < ballsArray.length; index++) {
      const b = ballsArray[index];
      const ball = this.createBall(b.x, b.y, b.size);
      ball.body.setCircle(ball.body.width / 2);
      ball.setVelocity(b.initVelocityX, b.initVelocityY);
    }
  }

  private createBall(x: number, y: number, size: number): Phaser.Physics.Arcade.Sprite {
    const ball = this.create(x, y, 'ball') as Phaser.Physics.Arcade.Sprite;
    ball.play('ballspin');
    ball.setScale(0.3*size)
    ball.setBounce(1, BALL_BOUNCE_LOSS);
    ball.setMass(BALL_MASS);
    ball.setData('size', size);
    const { width } = ball.body;
    ball.setCircle(width / 2)
    return ball;
  }

  explodeWhenHitWith(bullets: Phaser.Physics.Arcade.Group): Balls {
    this.scene.physics.add.overlap(bullets, this, this.hitBullet, null, this);
    return this;
  }

  dropOneOfItemRandomly(items: Items): Balls {
    this.items = items;
    return this;
  }

  private explodeSingle(ball: Phaser.Physics.Arcade.Sprite) {
    const size: number = ball.getData('size') as number;
    if (size > 1) {
      this.scene.sound.playAudioSprite('sfx', 'alien_death');
      const leftBall = this.createBall(ball.body.position.x + ball.body.width / 2, ball.body.position.y, size - 1) as Phaser.Physics.Arcade.Sprite;
      leftBall.setVelocity(-1 * BALL_DEFAULT_VELOCITY_X, -1 * BALL_DEFAULT_VELOCITY_Y);
      const rightBall = this.createBall(ball.body.position.x + ball.body.width / 2, ball.body.position.y, size - 1)as Phaser.Physics.Arcade.Sprite;
      rightBall.setVelocity(BALL_DEFAULT_VELOCITY_X, -1 * BALL_DEFAULT_VELOCITY_Y);
    }
  }

  private explodeUntilSmallest(ball: Phaser.Physics.Arcade.Sprite) {
    if (!ball.active) return;
    const size: number = ball.getData('size') as number;
    if (size > 1) {
      const diff = size - 1;
      for (let idx = 0; idx < diff; idx++) {
        const leftBall = this.createBall(ball.body.position.x + ball.body.width / 2, ball.body.position.y, 1);
        leftBall.setVelocity(-1 * BALL_DEFAULT_VELOCITY_X, -1 * BALL_DEFAULT_VELOCITY_Y);
        const rightBall = this.createBall(ball.body.position.x + ball.body.width / 2, ball.body.position.y, 1);
        rightBall.setVelocity(BALL_DEFAULT_VELOCITY_X, -1 * BALL_DEFAULT_VELOCITY_Y);
      }
      ball.disableBody(true, true);
    } 
  }


  private hitBullet(bullet: Phaser.Physics.Arcade.Sprite, ball: Phaser.Physics.Arcade.Sprite) {
    ball.disableBody(true, true); 
    bullet.disableBody(true, true);
    
    const airBullet = bullet.getData('air_bullet') as boolean || false;
    const x = ball.body.x + ball.body.width / 2;
    const y = ball.body.y + ball.body.height;
    airBullet ? this.items.generateItem(x, y) : this.items.generateRandomItem(x, y);

    this.explodeSingle(ball);

    if (this.countActive(true) === 0) {
      this.emitter.emit(ALL_BALLS_CLEARED);
    }
  } 

  explodeAll() {
    Phaser.Actions.Call(this.getChildren(), (ball: Phaser.Physics.Arcade.Sprite) => {
      this.explodeUntilSmallest(ball);
    }, this);
  }

  on(eventName: string | symbol, listener: (...args: any[]) => void) {
    this.emitter.on(eventName, listener);
  }
}
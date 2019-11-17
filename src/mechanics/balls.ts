import { EventEmitter } from "events";
import { Items } from "./items";

export class BallConfigs {
  id: number;
  size: number = 2;
  x: number;
  y: number;
}

export class Balls extends Phaser.Physics.Arcade.Group {

  private emitter: EventEmitter = new EventEmitter();
  private items: Items;

  constructor(scene: Phaser.Scene, ballsArray: Array<BallConfigs> = []) {
    super(scene.physics.world, scene, {
      collideWorldBounds: true
    });

    for (let index = 0; index < ballsArray.length; index++) {
      const b = ballsArray[index];
      const ball = this.create(b.x, b.y, 'dude') as Phaser.Physics.Arcade.Sprite;
      ball.play('ballspin');
      ball.body.setCircle(22, 2, 2 );
      ball.setBounce(1, 0.985);
      ball.setVelocity(120);
      ball.setData('size', b.size);
    }
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
      const leftBall = this.create(ball.body.position.x + ball.body.width / 2, ball.body.position.y, 'ball')as Phaser.Physics.Arcade.Sprite;
      leftBall.setScale(0.5);
      leftBall.play('ballspin');
      leftBall.setData('size', size - 1);
      leftBall.setVelocity(-120, ball.body.velocity.y);
      leftBall.setBounce(1, 0.985)
      const rightBall = this.create(ball.body.position.x + ball.body.width / 2, ball.body.position.y, 'ball')as Phaser.Physics.Arcade.Sprite;
      rightBall.setScale(0.5);
      rightBall.play('ballspin');
      rightBall.setData('size', size - 1);
      rightBall.setVelocity(120, ball.body.velocity.y);
      rightBall.setBounce(1, 0.985)
    }
  }

  private explodeUntilSmallest(ball: Phaser.Physics.Arcade.Sprite) {
    const size: number = ball.getData('size') as number;
    if (size > 1) {
      const diff = size - 1;
      ball.disableBody(true, true);
      console.log(diff, size)
      for (let idx = 0; idx < diff; idx++) {
        const leftBall = this.create(ball.body.position.x + ball.body.width / 2, ball.body.position.y, 'ball')as Phaser.Physics.Arcade.Sprite;
        leftBall.setData('size', 1);
        leftBall.setVelocity(-120, ball.body.velocity.y);
        leftBall.setBounce(1, 0.985)
        const rightBall = this.create(ball.body.position.x + ball.body.width / 2, ball.body.position.y, 'ball')as Phaser.Physics.Arcade.Sprite;
        rightBall.setData('size', 1);
        rightBall.setVelocity(120, ball.body.velocity.y);
        rightBall.setBounce(1, 0.985)
      }
    }
  }


  private hitBullet(bullet: Phaser.Physics.Arcade.Sprite, ball: Phaser.Physics.Arcade.Sprite) {
    ball.disableBody(true, true); 
    bullet.disableBody(true, true);
    
    const x = ball.body.x + ball.body.width / 2;
    const y = ball.body.y + ball.body.height;
    this.items.generateRandomItem(x, y);

    this.explodeSingle(ball);

    if (this.countActive(true) === 0) {
      this.emitter.emit('allballscleared');
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
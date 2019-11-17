import { EventEmitter } from "events";

export class Robots extends EventEmitter {

  private ROBO_SPEED: number;
  private readonly INITIAL_HEALTH = 3;

  private robots: Phaser.Physics.Arcade.Group;
  private explosions: Phaser.Physics.Arcade.Group;

  constructor(private scene: Phaser.Scene, private player: Phaser.Physics.Arcade.Sprite) {
    super();
    this.ROBO_SPEED = Phaser.Math.GetSpeed(600, 6);
    this.robots = scene.physics.add.group({ allowGravity: false, collideWorldBounds: true });
    this.explosions = scene.physics.add.group({ allowGravity: false, collideWorldBounds: true });
    this.scene.physics.add.overlap(this.player, this.explosions, (player: Phaser.Physics.Arcade.Sprite, explode: Phaser.Physics.Arcade.Sprite) => {
      this.emit('explodewithplayer', player, explode)
    }, null, this);
  } 

  private generateRobot() {
    const robo = this.robots.create(Phaser.Math.Between(50, 700), 0, 'robot') as Phaser.Physics.Arcade.Sprite;
    robo.anims.play('robotfly');
    robo.setData('health', this.INITIAL_HEALTH);
    return robo;
  }

  private reduceHealthOrKill(robo: Phaser.Physics.Arcade.Sprite, damage: number = 1) {
    let health = robo.getData('health') as number;
    health -= damage;
    this.scene.sound.playAudioSprite('sfx', 'squit');
    robo.anims.play('robothit');
    robo.once('animationcomplete', () => {
      robo.anims.play('robotfly');
    });
    if (health <= 0) {
      this.scene.sound.playAudioSprite('sfx', 'boss hit');
      this.emit('robotkill', robo);
      robo.disableBody(true, true);
    }
    robo.setData('health', health);
  }

  doDamageAll(damage: number = 1) {
    if (this.robots.countActive(true) === 0) return
    Phaser.Actions.Call(this.robots.getChildren(), (robo: Phaser.Physics.Arcade.Sprite) => {
      this.reduceHealthOrKill(robo, damage);
    }, this.scene);
  }

  damage(bullets: Phaser.Physics.Arcade.Group) : Robots {
    this.scene.physics.add.overlap(this.robots, bullets, (robo: Phaser.Physics.Arcade.Sprite, bullet: Phaser.Physics.Arcade.Sprite) => {
      const bulDamage = bullet.getData('damage') || 1;
      this.reduceHealthOrKill(robo, bulDamage);
      bullet.disableBody(true, true);
      this.emit('bullethit', robo, bullet);
    })
    return this;
  }

  explodeWhenTouched(otherObjects: Phaser.Physics.Arcade.StaticGroup) : Robots {
    this.scene.physics.add.collider(this.robots, otherObjects, (robo: Phaser.Physics.Arcade.Sprite) => {
      robo.disableBody(true, true);
      const explode = this.explosions.create(robo.x, robo.y, 'explosion') as Phaser.Physics.Arcade.Sprite;
      explode.anims.play('robotexplosion');
      explode.setSize(80, 80);
      this.scene.time.delayedCall(1000, (explode: Phaser.Physics.Arcade.Sprite) => {
        explode.disableBody(true, true)
      }, [explode], this);
    });
    return this;
  };

  begin() : Robots {
    this.scene.time.delayedCall(1000, (player: Phaser.Physics.Arcade.Sprite) => {
      const robot = this.generateRobot();
      robot.setData('straight', player.body.position.x === robot.x);
    }, [this.player], this);
    return this;
  }

  update(time, delta, cursors) {
    if (this.robots.countActive(true) === 0) return;

    Phaser.Actions.Call(this.robots.getChildren(), (robo: Phaser.Physics.Arcade.Sprite) => {
      if (robo.getData('straight') === false) {
        const playerX = this.player.body.position.x;
        const playerW = this.player.body.width;
        const sign = playerX + playerW / 2 > robo.x ? 1 : -1;
        robo.x += this.ROBO_SPEED * delta * sign;
        if (!cursors.left.isDown 
          && !cursors.right.isDown 
          && robo.x > playerX + (playerW * 0.3) 
          && robo.x <= playerX + (playerW * 0.6)) {
          robo.setData('straight', true);
        }
      }

      //robo.x += this.roboSpeed * delta;
      robo.y += this.ROBO_SPEED * delta;
    }, this.scene);

  }
}
import { EventEmitter } from "events";
import { ROBOT_EXPLODE_ONTO_PLAYER, ROBOT_KILL, ROBOT_BULLET_HIT } from "./events";
import Explosions from "./explosions";
import { ROBOT_DEFAULT_HEALTH, ROBOT_DEFAULT_SPEED, ROBOT_GENERATION_MIN_X, ROBOT_GENERATION_MAX_X, ROBOT_HALT_WHEN_HIT } from "../configs/game-configs";
import { IRobotConfigs } from "../configs/config-models";

export class Robots extends EventEmitter {

  private robots: Phaser.Physics.Arcade.Group;

  private robotTimeEvent: Phaser.Time.TimerEvent;
  private robotGeneration: IRobotConfigs;

  constructor(private scene: Phaser.Scene, private player: Phaser.Physics.Arcade.Sprite, private explosions: Explosions) {
    super();
    this.robots = scene.physics.add.group({ allowGravity: false, collideWorldBounds: true });
    this.scene.physics.add.overlap(this.player, this.explosions, (player: Phaser.Physics.Arcade.Sprite, explode: Phaser.Physics.Arcade.Sprite) => {
      this.emit(ROBOT_EXPLODE_ONTO_PLAYER, player, explode)
    }, null, this);
  } 

  private scheduleRobotGeneration() {
    if (this.robotTimeEvent !== null) {
      let rangeStart = 2000, rangeEnd = 5000;
      if (this.robotGeneration && this.robotGeneration.intervalRange && this.robotGeneration.intervalRange.length >= 2) {
        rangeStart = this.robotGeneration.intervalRange[0];
        rangeEnd = this.robotGeneration.intervalRange[1];
      }
      const activeCount = this.robots.countActive(true);
      const nextTick = Phaser.Math.Between(rangeStart, rangeEnd);
      console.log(this.robotGeneration.nextSpawnOnlyAfterKill, activeCount, nextTick)
      if (this.robotGeneration.nextSpawnOnlyAfterKill && activeCount > 0) {
        console.log("Return")
        return;
      }

      this.robotTimeEvent = this.robotTimeEvent.reset({
        delay: nextTick,
        callback: this.generateRobot,
        callbackScope: this,
        repeat: 1
      })
    }
  }

  private generateRobot(doScheduleNext: boolean = false) {
    console.log("GENERATE ROBOT")
    const robo = this.robots.create(Phaser.Math.Between(ROBOT_GENERATION_MIN_X, ROBOT_GENERATION_MAX_X), 0, 'robot') as Phaser.Physics.Arcade.Sprite;
    robo.anims.play('robotfly');
    robo.setData('health', ROBOT_DEFAULT_HEALTH);
    robo.setData('speed', ROBOT_DEFAULT_SPEED);
    robo.setData('straight', this.player.body.position.x === robo.x);
    doScheduleNext && this.scheduleRobotGeneration();
    return robo;
  }

  private reduceHealthOrKill(robo: Phaser.Physics.Arcade.Sprite, damage: number = 1) {
    let health = robo.getData('health') as number;
    health -= damage;
    ROBOT_HALT_WHEN_HIT && robo.setData('speed', 0);
    this.scene.sound.playAudioSprite('sfx', 'squit');
    robo.anims.play('robothit');
    robo.once('animationcomplete', () => {
      robo.anims.play('robotfly');
      robo.setData('speed', ROBOT_DEFAULT_SPEED);
    });
    if (health <= 0) {
      this.scene.sound.playAudioSprite('sfx', 'boss hit');
      this.emit(ROBOT_KILL, robo);
      robo.disableBody(true, true);
      this.scheduleRobotGeneration();
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
      this.emit(ROBOT_BULLET_HIT, robo, bullet);
    })
    return this;
  }

  explodeWhenTouched(otherObjects: Phaser.Physics.Arcade.StaticGroup) : Robots {
    this.scene.physics.add.collider(this.robots, otherObjects, (robo: Phaser.Physics.Arcade.Sprite) => {
      robo.disableBody(true, true);
      this.explosions.createExplosion(robo.x, robo.y);
    });
    return this;
  };

  begin(availability: IRobotConfigs) : Robots {
    this.robotGeneration = availability;
    // no robots
    if (!availability) {
      return this;
    }

    this.robotTimeEvent = this.scene.time.addEvent({
      delay: availability.initialRobotDelay ,
      callback: this.generateRobot,
      callbackScope: this,
      args: [availability.nextSpawnOnlyAfterKill]
    });
    return this;
  }

  destroy() {
    this.robotTimeEvent && this.robotTimeEvent.destroy();
  }

  update(time, delta, cursors) {
    if (this.robots.countActive(true) === 0) return;

    Phaser.Actions.Call(this.robots.getChildren(), (robo: Phaser.Physics.Arcade.Sprite) => {
      const speed = robo.getData('speed') as number;
      if (robo.getData('straight') === false) {
        const playerX = this.player.body.position.x;
        const playerW = this.player.body.width;
        const sign = playerX + playerW / 2 > robo.x ? 1 : -1;
        robo.x += speed * delta * sign;
        if (!cursors.left.isDown 
          && !cursors.right.isDown 
          && robo.x > playerX + (playerW * 0.3) 
          && robo.x <= playerX + (playerW * 0.6)) {
          robo.setData('straight', true);
        }
      }

      //robo.x += this.roboSpeed * delta;
      robo.y += speed * delta;
    }, this.scene);

  }
}
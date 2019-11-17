import { GameObjects, Physics } from "phaser";
import { Bullet } from "../ui/bullet";
import { Robots } from "../mechanics/robots";
import { Items, ItemType } from "../mechanics/items";
import { Bullets } from "../mechanics/bullets";
import { Scoring } from "../mechanics/scores";
import { Balls, BallConfigs } from "../mechanics/balls";
import { Player } from "../mechanics/player";

const sceneConfig: Phaser.Types.Scenes.SettingsConfig = {
  active: false,
  visible: false,
  key: 'Game'
};

export class GameScene extends Phaser.Scene {

  private platforms: Phaser.Physics.Arcade.StaticGroup;
  private player: Player;
  private cursors: Phaser.Types.Input.Keyboard.CursorKeys;
  private balls: Balls;
  private items: Items;
  private robotsRef: Robots;
  private bullets: Bullets;
  private scoring: Scoring;
  private playerBallCollider: Phaser.Physics.Arcade.Collider;

  private playerPos = 120;
  private inactive = false;

  constructor() {
    super(sceneConfig);

    this.scoring = new Scoring(this);
  }

  public create() {
    this.cameras.main.setBackgroundColor('#000000');
    //this.add.image(400, 300, 'sky');

    this.playerPos = this.cameras.main.width / 2;

    this.platforms = this.physics.add.staticGroup();
    this.platforms.create(400, 568, 'ground').setScale(2).refreshBody();

    // const bls = this.physics.add.group({
    //   key: 'dude',
    //   repeat: 0,   
    //   collideWorldBounds: true,
    //   velocityX: 120,
    //   velocityY: 120,
    //   bounceX: 1,
    //   bounceY: 0.985,
    //   mass: 50,
    //   setXY: { x: 50, y: 400, stepX: 36, stepY: -30 }
    // });

    this.anims.create({
      key: 'ballspin',
      frames: this.anims.generateFrameNumbers('ball', { start: 0, end: 7 }),
      frameRate: 8,
      repeat: -1
    }); 

    this.balls = new Balls(this, [
      { id: 1, x: 50, y: 400, size: 3 } as BallConfigs,
      { id: 2, x: 550, y: 400, size: 3 } as BallConfigs,
    ]); 
    this.physics.add.collider(this.balls, this.platforms);
    
    // this.physics.world.on('worldbounds', (body) => {
    //   const { left, right } = body;
    //   const { width } = this.cameras.main;
    //   if (right === width || left === 0) {
    //     const ball = body.gameObject as Phaser.Physics.Arcade.Sprite;
    //     const ballBody = ball.body as Phaser.Physics.Arcade.Body;
    //     const step = ballBody.velocity.y > 0 ? -30 : 30;
    //     //ballBody.setVelocityY(this.velY + step);
    //   }
    // })

    
    this.player = new Player(this, this.playerPos, 450);
    this.bullets = new Bullets(this);

    this.anims.create({
      key: 'robotfly',
      frames: this.anims.generateFrameNumbers('robot', { start: 0, end: 1 }),
      frameRate: 2,
      repeat: -1
    });
    this.anims.create({
      key: 'robothit',
      frames: this.anims.generateFrameNumbers('robot', { start: 2, end: 3 }),
      frameRate: 6,
      repeat: 1,
    });
    this.anims.create({
      key: 'left',
      frames: this.anims.generateFrameNumbers('dude', { start: 0, end: 3 }),
      frameRate: 10,
      repeat: -1
    });
    this.anims.create({
      key: 'turn',
      frames: [ { key: 'dude', frame: 4 } ],
      frameRate: 20
    });
    this.anims.create({
      key: 'right',
      frames: this.anims.generateFrameNumbers('dude', { start: 5, end: 8 }),
      frameRate: 10,
      repeat: -1
    });
    this.anims.create({
      key: 'robotexplosion',
      frames: this.anims.generateFrameNumbers('explosion', { start: 0, end: 41 }),
      frameRate: 60
    });

    this.physics.add.collider(this.player, this.platforms);
    this.playerBallCollider = this.physics.add.collider(this.player, this.balls, this.playerKilled, null, this);

    this.items = new Items(this, this.player).collideWith(this.platforms);
    this.items.on('collectitem', this.collectItem.bind(this));

    this.balls.explodeWhenHitWith(this.bullets)
      .dropOneOfItemRandomly(this.items)
      .on('allballscleared', () => this.scene.restart())

    this.robotsRef = new Robots(this, this.player).explodeWhenTouched(this.platforms)
      .damage(this.bullets)
      .begin();
    this.robotsRef.on('explodewithplayer', this.playerKilled.bind(this));
    this.robotsRef.on('robotkill', this.whenRobotKilled.bind(this));

    this.scoring.render();
    this.cursors = this.input.keyboard.createCursorKeys();
  }

  private whenRobotKilled() {
    this.scoring.updatePointsBy(100);
  }

  private resetGame() {
    this.scoring.updateLivesBy(-1);
    // this.scoring.reset();
    if (this.scoring.hasLives()) {
      this.scene.restart();
      this.inactive = false;
    }
  }

  private collectItem(item: Phaser.Physics.Arcade.Sprite, player: Phaser.Physics.Arcade.Sprite) {
    const type = item.getData('type') as ItemType;
    
    this.sound.playAudioSprite('sfx', 'ping');
    const multiplier = !this.player.body.touching.down ? 2 : 1;
    let points = item.getData('points');
    switch (type) {
      case ItemType.BULLET_SPEED:
        this.bullets.increaseShootingSpeed();
        break;
      case ItemType.DAMAGE_ALL:
        this.robotsRef.doDamageAll(2);
        break;
      case ItemType.ONE_UP:
        this.scoring.updateLivesBy(1);
        break;
      case ItemType.BULLET_DAMAGE:
        this.bullets.increaseBulletPower();
        break;
      case ItemType.INVINCIBLE:
        this.player.makeInvincibleFor([this.playerBallCollider]);
        break;  
    }
    this.scoring.updatePointsBy(points * multiplier);
  }

  private playerKilled(player: Player) {
    if (player.invincible) {
      return;
    }
    this.sound.playAudioSprite('sfx', 'death');
    this.physics.pause();
    this.inactive = true;
    player.setTint(0xff0000);
    player.anims.play('turn');
    this.time.delayedCall(3000, () => this.resetGame(), [this], null)
  }

  public update(time, delta) {
    if (this.inactive) return;
    this.robotsRef.update(time, delta, this.cursors);

    if (this.cursors.left.isDown) {
      this.player.setVelocityX(-220);
      this.player.anims.play('left', true);
    } else if (this.cursors.right.isDown) {
      this.player.setVelocityX(220);
      this.player.anims.play('right', true);
    } else if (this.cursors.left.isUp && this.cursors.right.isUp) {
      this.player.setVelocityX(0);
      this.player.anims.play('turn');
    }

    if (this.cursors.up.isDown && this.player.body.touching.down) {
      this.player.setVelocityY(-400);
    }

    if (this.cursors.space.isDown) {
      const { x, y } = this.player.body.position;
      this.bullets.fire(x + this.player.body.width / 2, y);
    }
  }
}
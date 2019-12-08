import { GameObjects, Physics, Input } from "phaser";
import { Bullet } from "../ui/bullet";
import { Robots } from "../mechanics/robots";
import { Items } from "../mechanics/items";
import { Bullets } from "../mechanics/bullets";
import { Scoring } from "../mechanics/scores";
import { Balls } from "../mechanics/balls";
import { Player } from "../mechanics/player";
import { ALL_BALLS_CLEARED, ROBOT_KILL, ROBOT_EXPLODE_ONTO_PLAYER, ITEM_COLLECTED, ITEM_EXPLODE_ONTO_PLAYER, ROBOT_BULLET_HIT } from "../mechanics/events";
import Explosions from "../mechanics/explosions";
import { BallConfigs, ItemType, IItemDef, IRobotConfigs, ILevelConfig } from "../configs/config-models";
import { POINTS_ROBOT_KILL, POINTS_MULTIPLIER_FACTOR_WHEN_JUMPING, PLAYER_JUMP_VELOCITY, POINTS_ROBOT_HIT_WHILE_ADJUSTING, PLAYER_INITIAL_POSITION_Y } from "../configs/game-configs";
import { LEVELS } from "../configs/levels";

const { W, S, A, D, SPACE } = Input.Keyboard.KeyCodes;

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
  private explosions: Explosions;
  private bullets: Bullets;
  private scoring: Scoring;
  private playerBallCollider: Phaser.Physics.Arcade.Collider;

  private playerPos = 120;
  private inactive = false;

  private currentLevel: number;
  private levelData: ILevelConfig;

  constructor() {
    super(sceneConfig);
  }

  init(props: any) {
    const { level, score = 0 } = props;
    this.currentLevel = level;
    this.levelData = LEVELS[this.currentLevel - 1];
    console.log("Level", this.currentLevel);
    this.scoring = new Scoring(this, score, this.levelData.ammoCount);
  }

  private createAnimations() {
    this.anims.create({
      key: 'ballspin',
      frames: this.anims.generateFrameNumbers('ball', { start: 0, end: 7 }),
      frameRate: 8,
      repeat: -1
    }); 
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
      frames: this.anims.generateFrameNumbers('explosion', { start: 0, end: 36 }),
      frameRate: 36
    });
  }

  public create() {
    this.cameras.main.setBackgroundColor('#000000');
    this.explosions = new Explosions(this);

    this.createAnimations();

    this.playerPos = this.levelData.initialPlayerPosition || this.cameras.main.width / 2;

    this.platforms = this.physics.add.staticGroup();
    this.platforms.create(400, 568, 'ground').setScale(2).refreshBody();


    this.balls = new Balls(this, [...this.levelData.balls]);  
    this.physics.add.collider(this.balls, this.platforms);
    
    this.player = new Player(this, this.playerPos, PLAYER_INITIAL_POSITION_Y);
    this.bullets = new Bullets(this);
    
    this.physics.add.collider(this.player, this.platforms);
    this.playerBallCollider = this.physics.add.collider(this.player, this.balls, this.playerKilled, null, this);

    this.items = new Items(this, this.player, this.explosions)
      .collideWith(this.platforms)
      .setItemProbabilityMap({...this.levelData.itemAvailability});
    this.items.on(ITEM_COLLECTED, this.collectItem.bind(this));
    this.items.on(ITEM_EXPLODE_ONTO_PLAYER, this.playerKilled.bind(this));

    this.balls.explodeWhenHitWith(this.bullets)
      .dropOneOfItemRandomly(this.items)
      .on(ALL_BALLS_CLEARED, () => this.nextLevel())

    this.robotsRef = new Robots(this, this.player, this.explosions).explodeWhenTouched(this.platforms)
      .damage(this.bullets)
      .begin(this.levelData.robotAvailability);
    this.robotsRef.on(ROBOT_EXPLODE_ONTO_PLAYER, this.playerKilled.bind(this));
    this.robotsRef.on(ROBOT_KILL, this.whenRobotKilled.bind(this));
    this.robotsRef.on(ROBOT_BULLET_HIT, this.whenRobotBulletHit.bind(this));

    this.scoring.render();
    this.cursors = this.input.keyboard.addKeys({
      up: W,
      down: S,
      left: A,
      right: D,
      space: SPACE
    });
    this.input.on('pointerdown', () => {
      this.doFireNow();
    });
  }

  nextLevel() {
    this.time.addEvent({
      delay: 2500,
      callback: () => this.scene.restart({ level: this.currentLevel + 1, score: this.scoring.score })
    })
  }

  whenRobotBulletHit(robot: Phaser.Physics.Arcade.Sprite) {
    const movingStraight = robot.getData('straight') as boolean;
    if (!movingStraight) {
      this.scoring.updatePointsBy(POINTS_ROBOT_HIT_WHILE_ADJUSTING);
      this.createFloatingText(robot.body.position.x, robot.body.position.y, 
        `${POINTS_ROBOT_HIT_WHILE_ADJUSTING}`);
    }
  }

  createFloatingText(x,y, message, size = 10) {
    const animation = this.add.bitmapText(x,y, 'arcadeFont', message, size).setTint(0xFFFFFF);
    const tween: Phaser.Tweens.Tween = this.add.tween({
      targets: animation,
      duration: 750,
      ease: 'Exponential.In',
      y: y - 10,
      onComplete: () => {
        animation.destroy();
      },
      callbackScope: this
    });
  }

  private whenRobotKilled(robot: Phaser.Physics.Arcade.Sprite) {
    this.scoring.updatePointsBy(POINTS_ROBOT_KILL);
    this.createFloatingText(robot.body.position.x, robot.body.position.y, `${POINTS_ROBOT_KILL}`)
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
    const itemDef = item.getData('def') as IItemDef;

    this.sound.playAudioSprite('sfx', 'ping');
    const multiplier = !this.player.body.touching.down ? POINTS_MULTIPLIER_FACTOR_WHEN_JUMPING : 1;
    const points = itemDef.points * multiplier;
    this.createFloatingText(item.body.x, item.body.y, `${points}`);
    console.log(itemDef);
    switch (type) {
      case ItemType.BULLET_SPEED:
        this.bullets.increaseShootingSpeed();
        break;
      case ItemType.DAMAGE_ALL:
        this.robotsRef.doDamageAll(2);
        this.balls.explodeAll();
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
      case ItemType.RUN_SPEED:
        this.player.increaseRunSpeed();
        break;
    }
    this.scoring.updatePointsBy(points);
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

  private doFireNow() {
    if (this.scoring.hasAmmos()) {
      const { x, y } = this.player.body.position;
      const fired = this.bullets.fire(x + this.player.body.width / 2, y);
      fired && this.scoring.updateAmmosBy(-1);
    }
  }

  public update(time, delta) {
    if (this.inactive) return;
    this.robotsRef.update(time, delta, this.cursors);

    if (this.cursors.left.isDown) {
      this.player.setVelocityX(-1 * this.player.runningSpeed);
      this.player.anims.play('left', true);
    } else if (this.cursors.right.isDown) {
      this.player.setVelocityX(this.player.runningSpeed);
      this.player.anims.play('right', true);
    } else if (this.cursors.left.isUp && this.cursors.right.isUp) {
      this.player.setVelocityX(0);
      this.player.anims.play('turn');
    }

    if (this.cursors.up.isDown && this.player.body.touching.down) {
      this.player.setVelocityY(PLAYER_JUMP_VELOCITY);
    }

    if (this.cursors.space.isDown) {
     this.doFireNow();
    }
  }
}
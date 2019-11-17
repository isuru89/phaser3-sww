import { EventEmitter } from "events";

export enum ItemType {
  ONE_UP = 1,
  BULLET_DAMAGE,
  BULLET_SPEED,
  BONUS_POINTS,
  INVINCIBLE,
  DAMAGE_ALL,
  NOTHING
}

const POINT_MAPS = {
  [ItemType.ONE_UP]: 10,
  [ItemType.BULLET_DAMAGE]: 10,
  [ItemType.BULLET_SPEED]: 10,
  [ItemType.BONUS_POINTS]: 2500,
  [ItemType.DAMAGE_ALL]: 100,
  [ItemType.INVINCIBLE]: 50,
  [ItemType.NOTHING]: 0,
}

export class Items extends EventEmitter {
  private readonly ALIVE_TIME = 4000;
  private items: Phaser.Physics.Arcade.Group;

  constructor(private scene: Phaser.Scene, private player: Phaser.Physics.Arcade.Sprite) {
    super();

    this.items = scene.physics.add.group({ allowGravity: false, collideWorldBounds: true });

    this.scene.physics.add.overlap(player, this.items, this.collectItem, null, this);
  }

  private collectItem(player: Phaser.Physics.Arcade.Sprite, item: Phaser.Physics.Arcade.Sprite) {
    item.disableBody(true, true);
    this.emit('collectitem', item, player);
  }

  generateRandomItem(x: number, y: number) {
    const type = Phaser.Math.Between(1, Object.keys(POINT_MAPS).length);
    const item = this.items.create(x, y, 'item') as Phaser.Physics.Arcade.Sprite;
    item.setVelocityY(80);
    item.setData('type', ItemType.DAMAGE_ALL).setData('points', POINT_MAPS[type]);
  }

  collideWith(platforms: Phaser.Physics.Arcade.StaticGroup): Items {
    this.scene.physics.add.collider(this.items, platforms, (item) => {
      this.scene.time.delayedCall(this.ALIVE_TIME, (item: Phaser.Physics.Arcade.Sprite) => {
        item.disableBody(true, true);
      }, [item], this);
    }, null, this);
    return this;
  }

}
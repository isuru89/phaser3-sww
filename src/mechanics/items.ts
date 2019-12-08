import { EventEmitter } from "events";
import { ITEM_COLLECTED, ITEM_EXPLODE_ONTO_PLAYER } from "./events";
import Explosions from "./explosions";
import { IItemDef, ItemType } from "../configs/config-models";
import { ITEM_DEFS, POWER_ITEM_FALLING_SPEED } from "../configs/game-configs";

function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    let j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
};

export class Items extends EventEmitter {
  private items: Phaser.Physics.Arcade.Group;
  private distributionArray: Array<number>;

  constructor(private scene: Phaser.Scene, 
    private player: Phaser.Physics.Arcade.Sprite, 
    private explosions: Explosions) {
    super();

    this.items = scene.physics.add.group({ allowGravity: false, collideWorldBounds: true });
    this.scene.physics.add.overlap(this.player, this.items, this.collectItem, this.checkCollectible, this);
    this.scene.physics.add.overlap(this.player, this.explosions, this.explodeItemOnPlayer, null, this);
  }

  public setItemProbabilityMap(probabilities: { [key: number]: number }): Items {
    let x = 0;
    let array = new Array<number>(100);
    Object.keys(probabilities).forEach((k) => {
      const pn = probabilities[k] * 100;
      for (let index = x; index < x+pn; index++) {
        array[index] = parseInt(k);
      }
      x += pn
    });
    shuffle(array)
    this.distributionArray = array;
    return this;
  }

  private explodeItemOnPlayer(player: Phaser.Physics.Arcade.Sprite, explode: Phaser.Physics.Arcade.Sprite) {
    this.emit(ITEM_EXPLODE_ONTO_PLAYER, player, explode);
  }

  private getItemDef(item: Phaser.Physics.Arcade.Sprite): IItemDef {
    const type = item.getData('type') as number;
    return ITEM_DEFS[type];
  }

  private checkCollectible(player: Phaser.Physics.Arcade.Sprite, item: Phaser.Physics.Arcade.Sprite) {
    return this.getItemDef(item).collectible;
  }

  private collectItem(player: Phaser.Physics.Arcade.Sprite, item: Phaser.Physics.Arcade.Sprite) {
    item.disableBody(true, true);
    this.emit(ITEM_COLLECTED, item, player);
  }

  private dropItem(type: number, x: number, y: number) {
    const itemDef = ITEM_DEFS[type];
    if (!itemDef || type === ItemType.NOTHING) return;
    const item = this.items.create(x, y, 'item') as Phaser.Physics.Arcade.Sprite;
    item.setVelocityY(POWER_ITEM_FALLING_SPEED);
    item.setData('type', type).setData('points', itemDef.points).setData('def', itemDef);
  }

  generateItem(x: number, y: number) {
    let type = this.distributionArray[Phaser.Math.Between(0, this.distributionArray.length - 1)];
    while (type === ItemType.NOTHING) {
      type = this.distributionArray[Phaser.Math.Between(0, this.distributionArray.length - 1)];
    }
    this.dropItem(type, x, y);
  }

  generateRandomItem(x: number, y: number) {
    const type = this.distributionArray[Phaser.Math.Between(0, this.distributionArray.length - 1)];
    this.dropItem(type, x, y);
  }

  collideWith(platforms: Phaser.Physics.Arcade.StaticGroup): Items {
    this.scene.physics.add.collider(this.items, platforms, (item: Phaser.Physics.Arcade.Sprite) => {
      const itemDef = this.getItemDef(item);
      this.scene.time.delayedCall(itemDef.aliveTime, (item: Phaser.Physics.Arcade.Sprite) => {
        item.disableBody(true, true);
        itemDef.explosive && this.explosions.createExplosion(item.x, item.y);
      }, [item], this);
    }, null, this);
    return this;
  }

}
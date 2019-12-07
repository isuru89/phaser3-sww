
export default class Explosions extends Phaser.Physics.Arcade.Group {
  constructor(scene: Phaser.Scene) {
    super(scene.physics.world, scene, {
      collideWorldBounds: true,
      allowGravity: false
    });
  }

  createExplosion(x: number, y: number, area: number = 80) {
    const explode = this.create(x, y, 'explosion') as Phaser.Physics.Arcade.Sprite;
    explode.anims.play('robotexplosion');
    explode.setSize(area, area);
    this.scene.time.delayedCall(1000, (explode: Phaser.Physics.Arcade.Sprite) => {
      explode.disableBody(true, true)
    }, [explode], this);
  }

}
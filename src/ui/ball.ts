
export class Ball {
  private ball: Phaser.Physics.Arcade.Sprite;
  private size = 1;
  private bounce = 180;

  constructor(ballSprite: Phaser.Physics.Arcade.Sprite, size: number = 1) {
    this.ball = ballSprite; 
    this.ball.setCollideWorldBounds(true);
    this.ball.setVelocity(this.bounce, this.bounce);
    this.ball.setBounce(1);
    this.size = size;
  }

  public reduceBounce() {
    this.bounce -= 30;
    this.ball.setVelocity(this.bounce, this.bounce);
  }

  public explode(): Ball[] {
    if (this.size > 1) {
      this.size = this.size - 1;
      return [
        new Ball(this.ball, this.size),
        new Ball(this.ball, this.size)
      ];
    } else {
      this.ball.disableBody(true, true);
      return [];
    }
  }
}
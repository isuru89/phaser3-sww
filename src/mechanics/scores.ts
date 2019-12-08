import { Scene } from "phaser";

export class Scoring {

  private initialScore: number;
  private lives = 3;
  private scoreText: Phaser.GameObjects.Text;

  constructor(private scene: Scene, 
    public score: number = 0, 
    private ammos: number = 50,
    public level: number = 1) {
    this.initialScore = score;
  }

  render() {
    this.scoreText = this.scene.add.text(16, this.scene.cameras.main.height - 48, '', {
      fontSize: '24px', fill: '#000000'
    });
    this.updateView();
  }

  reset() {
    this.score = this.initialScore;
    this.updateView();
  }

  private updateView() {
    this.scoreText.setText(`Score: ${this.score}, Lives: ${this.lives}, Ammo: ${this.ammos}, Level: ${this.level}`);
  }

  updateAmmosBy(ammosDiff: number = -1) {
    this.ammos += ammosDiff;
    this.updateView();
  }

  updatePointsBy(points: number = 0) {
    this.score += points;
    this.updateView();
  }

  updateLivesBy(lives: number = 0) {
    this.lives += lives;
    this.updateView();
  }

  hasAmmos() {
    return this.ammos > 0;
  }

  hasLives() {
    return this.lives > 0;
  }
}
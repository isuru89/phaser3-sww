import { Scene } from "phaser";

export class Scoring {

  private initialScore: number;
  private lives = 3;
  private scoreText: Phaser.GameObjects.Text;

  constructor(private scene: Scene, private score: number = 0) {
    this.initialScore = score;
  }

  render() {
    this.scoreText = this.scene.add.text(16, this.scene.cameras.main.height - 48, '', {
      fontSize: '32px', fill: '#000000'
    });
    this.updateView();
  }

  reset() {
    this.score = this.initialScore;
    this.updateView();
  }

  private updateView() {
    this.scoreText.setText(`Score: ${this.score}, Lives: ${this.lives}`);
  }

  updatePointsBy(points: number = 0) {
    this.score += points;
    this.updateView();
  }

  updateLivesBy(lives: number = 0) {
    this.lives += lives;
    this.updateView();
  }

  hasLives() {
    return this.lives > 0;
  }
}
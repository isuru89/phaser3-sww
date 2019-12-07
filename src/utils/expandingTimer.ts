
export default class ExpandingTimer {

  private timeEvent: Phaser.Time.TimerEvent;

  constructor(private scene: Phaser.Scene) {

  }

  expandTo(timerConfigs: Phaser.Types.Time.TimerEventConfig) {
    if (!this.timeEvent) {
      this.timeEvent = this.scene.time.addEvent({
        ...timerConfigs
      });
    } else {
      this.timeEvent = this.timeEvent.reset({
        ...timerConfigs,
        repeat: 1
      })
    }
  }
}
import { MenuButton } from "../ui/menu-button";

const sceneConfig: Phaser.Types.Scenes.SettingsConfig = {
  active: false,
  visible: false,
  key: 'MainMenu'
};

export class MainMenuScene extends Phaser.Scene {
  constructor() {
    super(sceneConfig);
  }

  public create() {
    this.add.text(100, 50, 'Sample', { color: '#ffffff' }).setFontSize(24);
    new MenuButton(this, 100, 150, 'Start Game', () => this.scene.start('Game'));
    new MenuButton(this, 100, 150, 'Start Game', () => this.scene.start('Game'));
    new MenuButton(this, 100, 200, 'Settings', () => alert('Settings clicked'));
    new MenuButton(this, 100, 250, 'Help', () => alert('Help clicked'));
  }
}
const sceneConfig: Phaser.Types.Scenes.SettingsConfig = {
  active: false,
  visible: false,
  key: 'Boot'
};

export class BootScene extends Phaser.Scene {

  constructor() {
    super(sceneConfig);
  }

  private getGameWidth = () => this.game.scale.width;
  private getGameHeight = () => this.game.scale.height;

  public preload() {
    const halfWidth = this.getGameWidth() * 0.5;
    const halfHeight = this.getGameHeight() * 0.5;

    const progressBarHeight = 100;
    const progressBarWidth = 400;

    const progressBarContainer = this.add.rectangle(halfWidth, halfHeight, progressBarWidth, progressBarHeight, 0x000000);
    const progressBar = this.add.rectangle(halfWidth + 20 - progressBarContainer.width * 0.5, halfHeight, 10, progressBarHeight - 20, 0x888888);

    const loadingText = this.add.text(halfWidth - 75, halfHeight - 100, 'Loading...').setFontSize(24);
    const percentText = this.add.text(halfWidth - 25, halfHeight, '0%').setFontSize(24);
    const assetText = this.add.text(halfWidth - 25, halfHeight + 100, '').setFontSize(24);

    this.load.on('progress', value => {
      progressBar.width = (progressBarWidth - 30) * value;
      const percent = value * 100;
      percentText.setText(`${percent}%`);
    });

    this.load.on('fileprogress', file => {
      assetText.setText(file.key);
    });

    this.load.on('complete', () => {
      loadingText.destroy();
      percentText.destroy();
      assetText.destroy();
      progressBar.destroy();
      progressBarContainer.destroy();

      this.scene.start('Game');
    });

    this.loadAssets();
  }

  private loadAssets() {
    const bult = [
      '5555',
      '5555',
      '5555',
      '5555',
      '5555',
    ]
    // var ufo = [
    //   '....55555555....',
    //   '....DDDDDDDD....',
    //   '...DDEEDDDDDD...',
    //   '..DDDEEDDDDDDD..',
    //   '..DDDDDDDDDDDD..',
    //   '..DDDD5555DDDD..',
    //   '..DDD555555DDD..',
    //   '..DDD555555DDD..',
    //   '..DDD555555DDD..',
    //   '..334244333333..',
    //   '.33344443333333.',
    //   '3333444433333333',
    //   '....5...5..5....',
    //   '...5....5...5...',
    //   '.66....66....66.',
    //   '.66....66....66.'
    // ];
    this.textures.generate('bullet', { data: bult, pixelWidth: 1 });
    this.add.image(150, 300, 'bullet').setOrigin(0, 1);

    this.load.audioSprite('sfx', 'assets/sounds/fx_mixdown.json', [
      'assets/sounds/fx_mixdown.ogg',
      'assets/sounds/fx_mixdown.mp3'
    ]);

    this.load.image('sky', 'assets/sky.png');
    this.load.image('ground', 'assets/platform.png');
    this.load.image('star', 'assets/star.png');
    this.load.image('bomb', 'assets/bomb.png');
    this.load.image('item', 'assets/item.png');
    this.load.spritesheet('dude', 'assets/dude.png', {
      frameWidth: 32,
      frameHeight: 48
    });
    this.load.spritesheet('ball', 'assets/balls.png', {
      frameWidth: 48,
      frameHeight: 48
    });
    this.load.spritesheet('robot', 'assets/robot.png', {
      frameWidth: 16,
      frameHeight: 32
    });
    this.load.spritesheet('explosion', 'assets/explosion.png', {
      frameWidth: 130,
      frameHeight: 130
    });
  }
}
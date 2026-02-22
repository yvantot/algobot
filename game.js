const config = {
	type: Phaser.AUTO,
	width: 800,
	height: 800,
	scene: [MainScene],
	pixelArt: true,
};

const TILE_SIZE = 32;
const farm = [
	[0, 0, 0, 0, 0],
	[0, 1, 1, 1, 0],
	[0, 1, 1, 1, 0],
	[0, 1, 1, 1, 0],
	[0, 0, 0, 0, 0],
];

let game = new Phaser.Game(config);

class MainScene extends Phaser.Scene {
	constructor() {
		super("MainScene");
	}
	preload() {}
	create() {}
	update() {}
}

function create() {
	// 1. Initialize the Tilemap
	const map = this.make.tilemap({
		data: mapData,
		tileWidth: 64,
		tileHeight: 64,
	});

	// 2. Add your Tileset Image (the actual art)
	// 'tiles' is the key you used in this.load.image
	const tileset = map.addTilesetImage("tiles");

	// 3. Create a Layer (this actually renders the tiles to the screen)
	const layer = map.createLayer(0, tileset, 0, 0);
}

function update() {}

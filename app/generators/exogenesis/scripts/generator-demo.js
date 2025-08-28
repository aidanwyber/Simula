class Generator {
	static name = 'p5Catalyst Demo';
	static supportEmail = 'aidan.wyber@multitude.nl';

	palette = [color('#F2EDEB'), color('#120D09'), color('#DDA702')];
	white = this.palette.at(0);

	// ------------------------------------------------------------ CONSTRUCTOR
	constructor() {
		this.col = undefined;

		this.doShowImage = true;
		this.img = loadImage(
			'demo/assets/felix.jpg',
			img => (img.isLoaded = true)
		);
		this.imageScale = 1;
		this.imagePosition = new Vec2D(0, 0);
	}

	// ------------------------------------------------------------ SETUP
	setup() {}

	// ------------------------------------------------------------ UPDATE
	update() {
		const minWH = min(width, height);
	}

	// ------------------------------------------------------------ DRAW
	draw(doSVGToo = false) {
		this.doSVGToo = doSVGToo;
		clear();
		if (theShader !== undefined) this.drawShader();

		if (this.doShowImage) this.drawImg();

		this.update();
	}

	drawImg() {
		if (this.img === undefined) return;
		imageCenteredXYScale(
			this.img,
			true,
			this.imagePosition.x,
			this.imagePosition.y,
			this.imageScale
		);
	}

	// ------------------------------------------------------------ SHADER
	drawShader() {
		theShader.setUniform('resolution', [width, height]);
		theShader.setUniform('progress', progress);
		theShader.setUniform('time', time);
		theShader.setUniform('mouse', [
			mouseX,
			mouseY,
			mouseIsPressed ? 1.0 : 0.0,
		]);
		theShader.setUniform('SSIDHash', SSID / 1e8);
		theShader.setUniform('utilBools', utilBools);

		resetMatrix();
		push();
		{
			resetMatrix();
			shader(theShader);
			rectMode(CENTER);
			noStroke();
			blendMode(BLEND);
			rect(0, 0, width, height);
		}
		pop();
		// ensures 0–width and 0–height range in WEBGL mode
		translate(-width / 2, -height / 2);
	}

	// ------------------------------------------------------------ UTILITY
	getState() {
		return {
			...this,
			// add custom parameters here
			img: undefined,
			logo: undefined,
		};
	}

	restoreState(state) {
		Object.assign(this, state);

		for (let propKey of Object.keys(this)) {
			this[propKey] = restoreSerializedP5Color(this[propKey]);
			this[propKey] = restoreSerializedVec2D(this[propKey]);
		}

		let i = 0;
		for (let col of this.palette) {
			this.palette[i++] = restoreSerializedP5Color(col);
		}
	}

	static getOutputFileName(insertion = '') {
		return (
			Generator.name.replaceAll(' ', '-') +
			'_' +
			(insertion != '' ? insertion.replaceAll(' ', '-') + '_' : '') +
			pw +
			'x' +
			ph +
			'_' +
			getTimestamp()
		);
	}
}

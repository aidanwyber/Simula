class Generator {
	static name = 'Tattoo Creator';
	static supportEmail = 'aidanwyber@gmail.nl';

	// palette = [color('#F2EDEB'), color('#120D09'), color('#DDA702')];
	// white = this.palette.at(0);

	constructor() {
		this.threshold = 0.37;
		this.displacementDistance = 0.5;
		this.displacementAngle = PI;
		this.rayEasing = 0.5;
		this.rotation = 0.0;
		this.doMirrorX = false;
		this.doMirrorY = false;
	}

	setup() {
		resize(1080, 1080);
		containCanvasInWrapper();
	}

	update() {
		// const minWH = min(width, height);
	}

	draw(doSVGToo = false) {
		if (!isPlaying) return;

		this.doSVGToo = doSVGToo;
		clear();

		this.update();

		this.drawBuffer();

		if (false) {
			imageMode(CENTER);
			image(bufferPG, 0, 0);
		} else {
			this.drawShader();
		}
	}

	drawBuffer() {
		bufferShader.setUniform('buffer', bufferPG);
		bufferShader.setUniform(
			'displacementDistance',
			this.displacementDistance
		);
		bufferShader.setUniform('displacementAngle', this.displacementAngle);
		bufferShader.setUniform('rayEasing', this.rayEasing);
		bufferShader.setUniform('rotation', this.rotation);
		bufferShader.setUniform('doMirrorX', this.doMirrorX);
		bufferShader.setUniform('doMirrorY', this.doMirrorY);

		bufferShader.setUniform('resolution', [width, height]);
		bufferShader.setUniform('progress', progress);
		bufferShader.setUniform('time', time);
		bufferShader.setUniform('mouse', [
			mouseX,
			mouseY,
			mouseIsPressed && isInCanvas({ x: mouseX, y: mouseY }) ? 1.0 : 0.0,
		]);
		bufferShader.setUniform('SSIDHash', SSID / 1e8);
		bufferShader.setUniform('utilBools', utilBools);

		bufferPG.resetMatrix();
		bufferPG.shader(bufferShader);
		bufferPG.rectMode(CENTER);
		bufferPG.noStroke();
		bufferPG.blendMode(BLEND);
		bufferPG.rect(0, 0, width, height);
	}

	drawShader() {
		theShader.setUniform('buffer', bufferPG);
		theShader.setUniform('eps', 0.05);
		theShader.setUniform('threshold', this.threshold);

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
		shader(theShader);
		rectMode(CENTER);
		noStroke();
		blendMode(BLEND);
		rect(0, 0, width, height);

		resetMatrix();
		// ensures 0–width and 0–height range in WEBGL mode
		translate(-width / 2, -height / 2);
	}

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

class Human {
	physics;

	headWidth = 30;
	headHeight = 50;
	hairLength = this.headHeight * 2;
	neckLength = this.headWidth;
	shoulderWidth = this.headHeight * 2;
	shoulderRadius = this.shoulderWidth / 3;
	handRadius = this.headWidth / 3;
	torsoLength = this.headHeight * 5;
	armLength = this.torsoLength;
	legLength = this.torsoLength * 1.2;
	hipWidth = this.shoulderWidth;
	hipRadius = this.hipWidth / 3;
	footBallRadius = this.handRadius * 1.5;
	footEndRadius = this.handRadius;

	hairs = [];

	// particles
	particles = {
		head: undefined,
		leftShoulder: undefined,
		rightShoulder: undefined,
		leftHip: undefined,
		rightHip: undefined,
	};

	// spring chains
	leftArm;
	rightArm;
	leftLeg;
	rightLeg;

	springs = [];

	kRigid = 0.5;
	kLoose = 0.05;

	constructor(physics, headPos, dir) {
		this.physics = physics;

		console.log('createParticles...');
		this.createParticles(headPos, dir);
		console.log('createParticles done.');

		// console.log('createHairs...');
		// this.createHairs();
		// console.log('createHairs done.');

		console.log('createSprings...');
		this.createSprings();
		console.log('createSprings done.');

		console.log('createLimbs...');
		this.createLimbs();
		console.log('createLimbs done.');
	}

	createParticles(headPos, dir) {
		// initialise to approximate positions
		const perpDir = dir.perp();

		this.particles.head = new Particle(headPos);
		this.particles.leftShoulder = new Particle(
			headPos
				.add(dir.scale(this.neckLength))
				.add(perpDir.scale(this.shoulderWidth / 2))
		);
		this.particles.rightShoulder = new Particle(
			headPos
				.add(dir.scale(this.neckLength))
				.sub(perpDir.scale(this.shoulderWidth / 2))
		);
		this.particles.leftHip = new Particle(
			headPos
				.add(dir.scale(this.neckLength + this.torsoLength))
				.add(perpDir.scale(this.hipWidth / 2))
		);
		this.particles.rightHip = new Particle(
			headPos
				.add(dir.scale(this.neckLength + this.torsoLength))
				.sub(perpDir.scale(this.hipWidth / 2))
		);

		for (let [name, p] of Object.entries(this.particles)) {
			this.physics.addParticle(p);
			console.log(name, p);
		}
	}

	createHairs() {
		const nHairs = 1;
		const segmentCount = 2;
		this.hairs = [];
		const hairDir = this.particles.leftShoulder
			.sub(this.particles.rightShoulder)
			.perp()
			.normalize();
		for (let i = 0; i < nHairs; i++) {
			const folliclePos = new Particle(
				this.particles.head.add(
					hairDir
						.perp()
						.scale(
							(((i - nHairs / 2) / (nHairs / 2)) *
								this.headWidth) /
								2
						)
				)
			);
			this.hairs.push(
				new SpringChain(
					this.physics,
					this.particles.head, //folliclePos,
					hairDir.scale(this.hairLength / segmentCount),
					segmentCount,
					this.kRigid
				)
			);
		}
		// for (let hair of this.hairs) {
		// 	for (let p of hair.particles) p.mass = 0.1;
		// }
	}

	createSprings() {
		this.springs = [];
		// shoulder-neck triangle
		const neckShoulderLen = Math.sqrt(
			Math.pow(this.neckLength, 2) + Math.pow(this.shoulderWidth / 2, 2)
		);
		this.springs.push(
			new Spring(
				this.particles.head,
				this.particles.leftShoulder,
				null, // neckShoulderLen,
				this.kRigid
			)
		);
		this.springs.push(
			new Spring(
				this.particles.head,
				this.particles.rightShoulder,
				null, // neckShoulderLen,
				this.kRigid
			)
		);
		// connect shoulders
		this.springs.push(
			new Spring(
				this.particles.leftShoulder,
				this.particles.rightShoulder,
				null, // this.shoulderWidth,
				this.kRigid
			)
		);

		// torso quadrangle
		const shoulderHipDiagonal = Math.sqrt(
			Math.pow(this.shoulderWidth / 2 + this.hipWidth / 2, 2) +
				Math.pow(this.torsoLength, 2)
		);
		this.springs.push(
			new Spring(
				this.particles.leftShoulder,
				this.particles.rightHip,
				null, // shoulderHipDiagonal,
				this.kRigid
			)
		);
		this.springs.push(
			new Spring(
				this.particles.rightShoulder,
				this.particles.leftHip,
				null, // shoulderHipDiagonal,
				this.kRigid
			)
		);
		const shoulderHipLength = Math.sqrt(
			Math.pow(this.shoulderWidth / 2 - this.hipWidth / 2, 2) +
				Math.pow(this.torsoLength, 2)
		);
		this.springs.push(
			new Spring(
				this.particles.rightShoulder,
				this.particles.rightHip,
				null, // shoulderHipLength,
				this.kLoose
			)
		);
		this.springs.push(
			new Spring(
				this.particles.leftShoulder,
				this.particles.leftHip,
				null, // shoulderHipLength,
				this.kLoose
			)
		);
		// connect hips
		this.springs.push(
			new Spring(
				this.particles.leftHip,
				this.particles.rightHip,
				null, // this.hipWidth,
				this.kRigid
			)
		);

		// connect head to hips for staying on the nexk side
		this.springs.push(
			new Spring(
				this.particles.head,
				this.particles.leftHip,
				null,
				this.kLoose
			)
		);
		this.springs.push(
			new Spring(
				this.particles.head,
				this.particles.rightHip,
				null,
				this.kLoose
			)
		);
	}

	createLimbs() {
		const n = 2;

		const armDelta = this.particles.leftShoulder
			.sub(this.particles.rightShoulder)
			.normalizeTo(this.armLength / n);
		this.leftArm = new SpringChain(
			this.physics,
			this.particles.leftShoulder,
			armDelta,
			n,
			this.kRigid
		);
		this.rightArm = new SpringChain(
			this.physics,
			this.particles.rightShoulder,
			armDelta.scale(-1),
			n,
			this.kRigid
		);

		const legDelta = this.particles.leftHip
			.sub(this.particles.rightHip)
			.perp()
			.scale(-1)
			.normalizeTo(this.legLength / n);
		this.leftLeg = new SpringChain(
			this.physics,
			this.particles.leftHip,
			legDelta,
			n,
			this.kRigid
		);
		this.rightLeg = new SpringChain(
			this.physics,
			this.particles.rightHip,
			legDelta,
			n,
			this.kRigid
		);
	}

	draw() {
		this.drawLegs();
		this.drawTorso();
		this.drawNeck();
		this.drawArms();
		this.drawHead();
		this.drawHairs();

		for (let spring of this.springs) {
			this.stroke();
			spring.draw();
		}

		push();
		{
			for (let [name, p] of Object.entries(this.particles)) {
				p.draw();
				textFont('Arial');
				textSize(20);
				stroke(255, 0, 0);
				noFill();
				text(name, p.x + 20, p.y - 20);
			}
		}
		pop();
	}

	drawLegs() {
		for (let leg of [this.leftLeg, this.rightLeg]) {
			this.stroke();
			beginShape();
			for (let p of leg.particles) {
				vertex(p.x, p.y);
			}
			endShape();
		}
	}

	drawTorso() {}

	drawNeck() {}

	drawArms() {
		for (let arm of [this.leftArm, this.rightArm]) {
			this.stroke();
			beginShape();
			for (let p of arm.particles) {
				vertex(p.x, p.y);
			}
			endShape();
		}
	}

	drawHead() {
		const headDir = this.particles.leftShoulder
			.sub(this.particles.rightShoulder)
			.perp()
			.normalize();
		const headAngle = headDir.angle() + Math.PI / 2;
		push();
		{
			translate(this.particles.head.x, this.particles.head.y);
			rotate(headAngle);
			this.fill();
			ellipse(0, 0, this.headWidth, this.headHeight);

			const eyeDist = this.headWidth * 0.5;
			const eyeDiam = this.headWidth / 5;
			this.fillHole();
			circle(-eyeDist / 2, 0, eyeDiam);
			circle(eyeDist / 2, 0, eyeDiam);
		}
		pop();
	}

	drawHairs() {
		this.stroke();
		for (let hair of this.hairs) {
			hair.draw();
		}
	}

	fill() {
		fill(0);
		noStroke();
	}
	fillHole() {
		fill(255);
		noStroke();
	}

	stroke() {
		noFill();
		stroke(0);
		strokeWeight(2);
	}
}

class Adam extends Human {}

class Eve extends Human {}

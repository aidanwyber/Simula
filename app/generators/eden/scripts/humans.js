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

	kRigid = 0.1;
	kLoose = 0.005;

	constructor(physics, headPos, dir) {
		this.physics = physics;

		this.createParticles(headPos, dir);
		this.createHairs();
		this.createSprings();
		this.createLimbs();
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
		}
	}

	createHairs() {
		this.hairs = [];
		const hairDir = this.particles.leftShoulder
			.sub(this.particles.rightShoulder)
			.perp()
			.normalize();
		for (let i = 0; i < 18; i++) {
			const folliclePos = this.particles.head.add(
				hairDir
					.perp()
					.scale((((i - 18 / 2) / (18 / 2)) * this.headWidth) / 2)
			);
			console.log(i, folliclePos);
			this.hairs.push(
				new SpringChain(
					this.physics,
					folliclePos,
					hairDir.scale(this.hairLength / 10),
					10,
					this.kRigid
				)
			);
		}
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
				neckShoulderLen,
				this.kLoose
			)
		);
		this.springs.push(
			new Spring(
				this.particles.head,
				this.particles.rightShoulder,
				neckShoulderLen,
				this.kLoose
			)
		);
		// connect shoulders
		this.springs.push(
			new Spring(
				this.particles.leftShoulder,
				this.particles.rightShoulder,
				this.shoulderWidth,
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
				this.shoulderHipDiagonal,
				this.kRigid
			)
		);
		this.springs.push(
			new Spring(
				this.particles.rightShoulder,
				this.particles.leftHip,
				this.shoulderHipDiagonal,
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
				this.shoulderHipLength,
				this.kLoose
			)
		);
		this.springs.push(
			new Spring(
				this.particles.leftShoulder,
				this.particles.leftHip,
				this.shoulderHipLength,
				this.kLoose
			)
		);
		// connect hips
		this.springs.push(
			new Spring(
				this.particles.leftHip,
				this.particles.rightHip,
				this.hipWidth,
				this.kRigid
			)
		);
	}

	createLimbs() {
		const n = 3;

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

		for (let spring of this.springs) {
			this.stroke();
			spring.draw();
		}
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

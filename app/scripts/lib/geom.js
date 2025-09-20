class Vec {
	x;
	y;

	constructor(x, y) {
		if (x instanceof Vec) {
			this.x = x.x;
			this.y = x.y;
			return;
		}
		this.x = x;
		this.y = y;
	}

	set(x, y) {
		if (x instanceof Vec) {
			this.x = x.x;
			this.y = x.y;
			return this;
		}
		this.x = x;
		this.y = y;
		return this;
	}

	add(v) {
		return new Vec(this.x + v.x, this.y + v.y);
	}
	addSelf(v) {
		this.set(this.add(v));
		return this;
	}

	sub(v) {
		return new Vec(this.x - v.x, this.y - v.y);
	}
	subSelf(v) {
		this.set(this.sub(v));
		return this;
	}

	scale(s) {
		return new Vec(this.x * s, this.y * s);
	}
	scaleSelf(s) {
		this.set(this.scale(s));
		return this;
	}
	div(s) {
		return new Vec(this.x / s, this.y / s);
	}
	divSelf(s) {
		this.set(this.div(s));
		return this;
	}

	dot(v) {
		return this.x * v.x + this.y * v.y;
	}

	magSq() {
		return this.dot(this);
	}
	mag() {
		return Math.sqrt(this.magSq());
	}

	normalize() {
		let m = this.mag();
		if (m > 0) {
			return this.scale(1 / m);
		}
		return new Vec(0, 0);
	}
	normalizeSelf() {
		this.set(this.normalize());
		return this;
	}

	normalizeTo(len) {
		return this.normalize().scale(len);
	}
	normalizeToSelf(len) {
		this.set(this.normalizeTo(len));
		return this;
	}

	distanceToSq(v) {
		return this.sub(v).magSq();
	}
	distanceTo(v) {
		return this.sub(v).mag();
	}

	perp() {
		return new Vec(-this.y, this.x);
	}
	perpSelf() {
		this.set(this.perp());
	}

	rotate(theta) {
		let cos = Math.cos(theta);
		let sin = Math.sin(theta);
		return new Vec(
			this.x * cos - this.y * sin,
			this.x * sin + this.y * cos
		);
	}
	rotateSelf(theta) {
		this.set(this.rotate(theta));
		return this;
	}

	lerp(v, t) {
		return this.scale(1 - t).add(v.scale(t));
	}
	lerpSelf(v, t) {
		this.set(this.lerp(v, t));
		return this;
	}

	angleTo(v) {
		return Vec.angleBetween(this, v);
	}

	angle() {
		return Math.atan2(this.y, this.x);
	}

	copy() {
		return new Vec(this.x, this.y);
	}

	toString() {
		return `(${this.x}, ${this.y})`;
	}

	projectOnto(v) {
		let dp = this.dot(v);
		let magSq = v.magSq();
		if (magSq === 0) return new Vec(0, 0);
		let scalar = dp / magSq;
		return v.scale(scalar);
	}
	projectOntoSelf(v) {
		this.set(this.projectOnto(v));
		return this;
	}

	static random2D() {
		let angle = Math.random() * Math.PI * 2;
		return new Vec(Math.cos(angle), Math.sin(angle));
	}

	static fromAngle(angle) {
		return new Vec(Math.cos(angle), Math.sin(angle));
	}

	static get ZERO() {
		return new Vec(0, 0);
	}

	static get X() {
		return new Vec(1, 0);
	}

	static get Y() {
		return new Vec(0, 1);
	}

	static angleBetween(v1, v2) {
		let dot = v1.dot(v2);
		let mags = v1.mag() * v2.mag();
		if (mags === 0) return 0;
		let amt = dot / mags;
		if (amt <= -1) return Math.PI;
		if (amt >= 1) return 0;
		return Math.acos(amt);
	}

	static angleFromTo(v1, v2) {
		return Math.atan2(v2.y - v1.y, v2.x - v1.x);
	}
}

class Line {
	a;
	b;
	heading;

	constructor(a, b) {
		this.a = a;
		this.b = b;
		this.heading = b.sub(a);
	}

	getDir() {
		return this.heading.normalize();
	}

	getLength() {
		return this.heading.mag();
	}

	getMidpoint() {
		return this.a.lerp(this.b, 0.5);
	}

	copy() {
		return new Line(this.a.copy(), this.b.copy());
	}

	toString() {
		return `Line(${this.a.toString()} -> ${this.b.toString()})`;
	}

	static fromAngleLength(angle, length, origin = new Vec(0, 0)) {
		let dir = Vec.fromAngle(angle).scale(length);
		let a = origin.copy();
		let b = origin.add(dir);
		return new Line(a, b);
	}
}

// class Circle extends p5.Vector {
// 	r;

// 	constructor(center, r) {
// 		super(center.x, center.y);
// 		this.r = r;
// 	}

// 	distanceToPoint(pt) {
// 		return p5.Vector.dist(this, pt) - this.r;
// 	}
// }

class Particle extends Vec {
	vel;
	acc;
	mass;
	isFixed;
	hasLifespan;
	lifespan;
	hasTrail;
	trail;
	trailLength;
	radius;
	springs = null;

	constructor(x, y, mass = 1, isFixed = false) {
		if (x instanceof Vec) super(x);
		else super(x, y);
		this.vel = new Vec(0, 0);
		this.acc = new Vec(0, 0);
		this.mass = mass;
		this.isFixed = isFixed;
		this.hasLifespan = false;
		this.lifespan = 255;
		this.hasTrail = false;
		this.trail = [];
		this.trailLength = 10;
		this.radius = 5;

		this.x += (Math.random() * 2 - 1) * 1e-3;
		this.y += (Math.random() * 2 - 1) * 1e-3;
	}

	addForce(force) {
		if (this.isFixed) return;
		this.acc.addSelf(force.div(this.mass));
	}

	addSpring(spring) {
		if (this.springs === null) this.springs = [];
		this.springs.push(spring);
	}

	draw() {
		fill(255, this.lifespan);
		noStroke();
		circle(this.x, this.y, this.radius * 2);

		if (this.hasTrail) {
			noFill();
			stroke(255, this.lifespan);
			beginShape();
			for (let p of this.trail) {
				vertex(p.x, p.y);
			}
			endShape();
		}
	}
}

class Spring {
	a;
	b;
	restLength;
	k; // Spring constant
	constructor(a, b, restLength, k) {
		this.a = a;
		this.b = b;
		this.restLength = restLength;
		this.k = k;

		a.addSpring(this);
		b.addSpring(this);
	}

	apply() {
		const diff = this.b.sub(this.a);
		const dx = diff.mag() - this.restLength;
		const force = diff.normalizeTo(this.k * -dx);
		this.a.addForce(force.scale(-0.5));
		this.b.addForce(force.scale(+0.5));
	}

	draw() {
		const n = Math.floor(this.b.distanceTo(this.a) * 0.2);
		const delta = this.b.sub(this.a).div(n);
		const deltaPerp = delta.perp();
		const zig = delta.rotate(Math.PI / 4).scale(Math.SQRT2 / 2);
		beginShape();
		vertex(this.a.x, this.a.y);
		for (let i = 1; i <= n; i++) {
			const zigPos = this.a
				.add(delta.scale(i - 0.5))
				.add(deltaPerp.scale(i % 2 === 0 ? 1 : -1));
			const nextPos = this.a.add(delta.scale(i));
			vertex(zigPos.x, zigPos.y);
			vertex(nextPos.x, nextPos.y);
		}
		endShape();
		// line(this.a.x, this.a.y, this.b.x, this.b.y);
	}
}

class SpringChain {
	particles = [];

	constructor(physics, firstParticle, segmentVector, segmentCount, k) {
		this.particles.push(firstParticle);
		for (let i = 0; i < segmentCount; i++) {
			this.particles.push(
				new Particle(this.particles.at(-1).add(segmentVector))
			);
		}
		for (let p of this.particles) physics.addParticle(p);

		const segmentLength = segmentVector.mag();
		for (let i = 0; i < this.particles.length - 1; i++) {
			let pi = this.particles[i];
			let pn = this.particles[i + 1];
			new Spring(pi, pn, segmentLength, k);
		}
	}
}

class Physics2D {
	particles = [];

	hasGravity = false;
	gravity = new Vec(0, 0.1);

	hasWind = false;
	wind = new Vec(0.1, 0);

	hasFriction = false;
	frictionCoefficient = 0.01;

	hasDrag = false;
	dragCoefficient = 0.01;

	hasBounce = false;
	bounceCoefficient = 0.8;

	hasRepulsion = false;
	repulsionStrength = 1;
	repulsionRadius = 1;

	hasDamping = true;
	damping = 0.01;

	hasMouseInteraction = true;

	constructor() {}

	addParticle(p) {
		if (this.particles.indexOf(p) > -1) return;
		this.particles.push(p);
	}

	updateParticles() {
		for (let p of this.particles) {
			if (p.isFixed) continue;

			p.acc.set(0, 0);

			// // physics properties
			// if (this.hasGravity) {
			// 	p.addForce(this.gravity);
			// }

			// if (this.hasWind) {
			// 	p.addForce(this.wind);
			// }

			// if (this.hasFriction) {
			// 	let friction = p5.Vector.mult(p.vel, -1);
			// 	friction.setMag(this.frictionCoefficient);
			// 	p.addForce(friction);
			// }

			// if (this.hasDrag) {
			// 	let drag = p5.Vector.mult(p.vel, -1);
			// 	drag.setMag(this.dragCoefficient * p.vel.magSq());
			// 	p.addForce(drag);
			// }

			// if (this.hasBounce) {
			// 	if (p.pos.x < 0) {
			// 		p.pos.x = 0;
			// 		p.vel.x *= -this.bounceCoefficient;
			// 	} else if (p.pos.x > width) {
			// 		p.pos.x = width;
			// 		p.vel.x *= -this.bounceCoefficient;
			// 	}
			// 	if (p.pos.y < 0) {
			// 		p.pos.y = 0;
			// 		p.vel.y *= -this.bounceCoefficient;
			// 	} else if (p.pos.y > height) {
			// 		p.pos.y = height;
			// 		p.vel.y *= -this.bounceCoefficient;
			// 	}
			// }

			// if (this.hasRepulsion) {
			// 	const rrSq = this.repulsionRadius * this.repulsionRadius;
			// 	for (let other of this.particles) {
			// 		if (other !== p) {
			// 			let dir = p.sub(other);
			// 			let distSq = dir.magSq();
			// 			if (distSq < rrSq && distSq > 0) {
			// 				dir.normalizeToSelf(
			// 					this.repulsionStrength / distSq
			// 				);
			// 				p.addForce(dir);
			// 			}
			// 		}
			// 	}
			// }

			if (
				mouseIsPressed & this.hasMouseInteraction &&
				new Vec(mouseX, mouseY).distanceToSq(p) < p.r * p.r
			) {
				p.set(mouseX, mouseY);
			}

			// // particle properties
			// if (p.hasLifespan) {
			// 	p.lifespan -= 1;
			// 	if (p.lifespan <= 0) {
			// 		this.particles.splice(this.particles.indexOf(p), 1);
			// 		continue;
			// 	}
			// }

			// if (p.hasTrail) {
			// 	p.trail.push(p.pos.copy());
			// 	if (p.trail.length > p.trailLength) {
			// 		p.trail.shift();
			// 	}
			// }

			if (p.springs !== null) {
				for (let s of p.springs) {
					s.apply();
				}
			}

			p.vel.addSelf(p.acc);

			// if (this.hasDamping) {
			// 	p.vel.scaleSelf(1 - this.damping);
			// }

			p.addSelf(p.vel);
		}
	}

	getSprings() {
		return [];
	}

	update() {
		this.updateParticles();
	}

	// static lineLineIntersection(line1, line2) {
	// 	const x1 = line1.a.x;
	// 	const y1 = line1.a.y;
	// 	const x2 = line1.b.x;
	// 	const y2 = line1.b.y;
	// 	const x3 = line2.a.x;
	// 	const y3 = line2.a.y;
	// 	const x4 = line2.b.x;
	// 	const y4 = line2.b.y;
	// 	const denom = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4);
	// 	if (denom === 0) {
	// 		return null; // Lines are parallel
	// 	}
	// 	const t = ((x1 - x3) * (y3 - y4) - (y1 - y3) * (x3 - x4)) / denom;
	// 	const u = -((x1 - x2) * (y1 - y3) - (y1 - y2) * (x1 - x3)) / denom;
	// 	if (t >= 0 && t <= 1 && u >= 0 && u <= 1) {
	// 		return new Vec(x1 + t * (x2 - x1), y1 + t * (y2 - y1));
	// 	}
	// 	return null; // No intersection within the line segments
	// }

	// static lineCircleIntersection(line, circle) {
	// 	const d = line.heading;
	// 	const f = line.a.sub(circle);
	// 	const a = d.magSq();
	// 	const b = 2 * f.dot(d);
	// 	const c = f.dot(f) - circle.r * circle.r;
	// 	const discriminant = b * b - 4 * a * c;
	// 	if (discriminant < 0) {
	// 		return []; // No intersection
	// 	}
	// 	const sqrtDiscriminant = Math.sqrt(discriminant);
	// 	const t1 = (-b - sqrtDiscriminant) / (2 * a);
	// 	const t2 = (-b + sqrtDiscriminant) / (2 * a);
	// 	const intersections = [];
	// 	if (t1 >= 0 && t1 <= 1) {
	// 		intersections.push(line.a.add(d.scale(t1)));
	// 	}
	// 	if (t2 >= 0 && t2 <= 1) {
	// 		intersections.push(line.a.add(d.scale(t2)));
	// 	}
	// 	return intersections;
	// }
}

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

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
		if (m > Vec.epsilon) {
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

	static epsilon = 1e-4;

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

	intersectionPoint(line) {
		const x1 = this.a.x;
		const y1 = this.a.y;
		const x2 = this.b.x;
		const y2 = this.b.y;
		const x3 = line2.a.x;
		const y3 = line2.a.y;
		const x4 = line2.b.x;
		const y4 = line2.b.y;
		const denom = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4);
		if (denom === 0) {
			return null; // Lines are parallel
		}
		const t = ((x1 - x3) * (y3 - y4) - (y1 - y3) * (x3 - x4)) / denom;
		const u = -((x1 - x2) * (y1 - y3) - (y1 - y2) * (x1 - x3)) / denom;
		if (t >= 0 && t <= 1 && u >= 0 && u <= 1) {
			return new Vec(x1 + t * (x2 - x1), y1 + t * (y2 - y1));
		}
		return null; // No intersection within the line segments
	}

	intersectCircle(circle) {
		const d = this.heading;
		const f = this.a.sub(circle);
		const a = d.magSq();
		const b = 2 * f.dot(d);
		const c = f.magSq() - circle.radius * circle.radius;
		const discriminant = b * b - 4 * a * c;
		if (discriminant < 0) {
			return []; // No intersection
		}
		const sqrtDiscriminant = Math.sqrt(discriminant);
		const t1 = (-b - sqrtDiscriminant) / (2 * a);
		const t2 = (-b + sqrtDiscriminant) / (2 * a);
		const intersections = [];
		if (t1 >= 0 && t1 <= 1) {
			intersections.push(this.a.add(d.scale(t1)));
		}
		if (t2 >= 0 && t2 <= 1) {
			intersections.push(this.a.add(d.scale(t2)));
		}
		return intersections;
	}

	static fromAngleLength(angle, length, origin = new Vec(0, 0)) {
		let dir = Vec.fromAngle(angle).scale(length);
		let a = origin.copy();
		let b = origin.add(dir);
		return new Line(a, b);
	}
}

// class Circle extends Vec {
// 	radius;

// 	constructor(center, radius) {
// 		super(center.x, center.y);
// 		this.radius = radius;
// 	}

// 	distanceToPoint(pt) {
// 		return this.distanceTo(pt) - this.radius;
// 	}
// }

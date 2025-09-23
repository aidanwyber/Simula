class Eden {
	constructor(nPlants, nAnimals) {
		this.container = new Container(0);

		this.physics = new Physics2D();
		// this.physics.hasGravity = true;
		// this.physics.hasRepulsion = true;
		this.physics.hasMouseInteraction = true;
		this.physics.hasBounce = true;
		// this.physics.damping = 0.05;
		// this.physics.hasFriction = true;
		this.physics.hasDrag = true;

		// this.physics.setContainer(this.container);
		// console.log('container', this.container);

		// this.plants = [];
		// for (let i = 0; i < nPlants; i++) {
		// 	this.plants.push(new Plant(this));
		// 	console.log('created plant');
		// }
		// console.log('plants', this.plants);

		// this.animals = [];
		// // for (let i = 0; i < nAnimals; i++) {
		// // 	this.animals.push(new Animal(this));
		// // }
		// console.log('animals', this.animals);

		// this.entities = this.plants.concat(this.animals);
		// console.log('entities', this.entities);

		// this.setNewContainer();

		this.human = new Human(
			this.physics,
			new Vec(width / 2, height / 2),
			new Vec(0, 1)
		);

		// this.adam = new Adam(
		// 	this.physics,
		// 	new Vec(width / 2, height / 2),
		// 	new Vec(-1, -1).normalize()
		// );
		// this.eve = new Eve(
		// 	this.physics,
		// 	new Vec(width / 2, height / 2),
		// 	new Vec(1, 1).normalize()
		// );
	}

	update() {
		// for (let entity of this.entities) {
		// 	entity.update(this.entities);
		// }

		this.physics.update();
	}

	draw() {
		// this.container.draw();

		// for (let entity of this.entities) {
		// 	entity.draw();
		// }

		this.human.draw();
		// this.adam.draw();
		// this.eve.draw();
	}

	setNewContainer() {
		this.container = new Container(
			generator.shapes.indexOf(generator.shape)
		);
		for (let entity of this.entities) {
			entity.container = container;
		}
		console.log('set container to', this.container);
	}
}

class Entity {
	points = [];
	connectedIndices = [];
	lines = [];

	constructor(eden) {
		this.eden = eden;
	}

	getLines() {
		return this.connectedIndices.map(
			pair => new Line2D(this.points[pair[0]], this.points[pair[1]])
		);
	}

	isOverlapping(line) {
		return this.getLines().some();
	}

	relax(entities) {
		for (let point of this.points) {
			// Check if inside eden
			if (this.eden.container.shape.containsPoint(point)) {
			}
		}
	}
}

class Plant extends Entity {
	static maxPointCount = 20;

	constructor(eden) {
		super(eden);
		this.seedLoc = new Vec2D(90, 120); // container.getRandomPoint();
		this.points = [this.seedLoc];
	}

	// addLineFromPointToIndex(index) {}

	update(entities) {
		this.grow(entities);
		this.relax(entities);
		this.lines = this.getLines();
	}

	grow(entities) {
		if (this.points.length < Plant.maxPointCount) {
			const last = this.points[this.points.length - 1];
			const last2 = this.points[this.points.length - 2];
			// Random angle and length
			let angle = random(-PI / 3, PI / 3);

			if (this.points.length >= 2)
				angle += atan(last.y - last2.y, last.x - last2.x);

			const length = 30;
			const newPoint = new Vec2D(
				last.x + cos(angle) * length,
				last.y + sin(angle) * length
			);
			this.points.push(newPoint);

			this.connectedIndices.push([
				this.points.length - 2,
				this.points.length - 1,
			]);
		}
	}

	draw() {
		noFill();
		stroke('green');
		strokeWeight(2);
		for (let lineSeg of this.lines) {
			this.drawStemSeg(lineSeg);
		}
	}

	drawStemSeg(lineSeg) {
		line(lineSeg.a.x, lineSeg.a.y, lineSeg.b.x, lineSeg.b.y);
		// circle();
	}
}

class Animal extends Entity {
	constructor(eden) {
		super(eden);
	}

	update(entities) {
		this.move(entities);
		this.relax(entities);
		this.lines = this.getLines();
	}

	move(entities) {}

	draw() {
		noFill();
		stroke('brown');
		strokeWeight(2);
		for (let line of this.lines) {
			line(line.x, line.y);
		}
	}
}

class Container {
	constructor(type) {
		switch (type) {
			case 0:
				this.shape = new Rect(
					20,
					20,
					width / 2 - 20,
					height - 20
				).toPolygon2D();
				this.rp = () => {
					return new Vec2D(
						random(this.shape.x, this.shape.x + this.shape.width),
						random(this.shape.y, this.shape.y + this.shape.height)
					);
				};
				break;
			case 1:
				this.r = min(width, height) / 2 - 10;
				this.shape = new Circle(
					width / 2,
					height / 2,
					this.r
				).toPolygon2D();
				this.rp = () => {
					let rp;
					do
						rp = new Vec2D(
							random(
								this.shape.x,
								this.shape.x + this.shape.width
							),
							random(
								this.shape.y,
								this.shape.y + this.shape.height
							)
						);
					while (
						rp.distanceToSquared(
							new Vec2D(width / 2, height / 2) > this.r * this.r
						)
					);
					return rp;
				};
				break;
		}
	}

	getRandomPoint() {
		return this.rp();
	}

	draw() {
		stroke(1);
		stroke(0, 100);
		beginShape();
		for (let v of this.shape.vertices) vertex(v.x, v.y);
		endShape(CLOSE);
	}
}

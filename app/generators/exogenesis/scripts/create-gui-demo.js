function createGUI() {
	if (gui != undefined) gui.div.remove();
	gui = new GUIForP5();

	gui.setLeft();

	// add logo up top (uses 'assets/generator-logo9.svg', see style.css)
	let logo = gui.addField(new Field(gui.div, 'logo', ''));
	// let title = gui.addTitle(3, 'Tattooo Creator', true);
	// title.div.style.fontSize = '1.5rem';
	// title.div.style.marginTop = '-1em';

	const appearanceTab = new Tab('Appearance');
	const exportTab = new Tab('Export');

	gui.addTabs(appearanceTab, exportTab);

	// ------------------------------ APPEARANCE ------------------------------

	appearanceTab.addTitle(2, 'Visual system', false);

	appearanceTab.addController(
		new ColourBoxes(
			appearanceTab,
			'colourBoxesFgCol',
			'LANG_FGCOL',
			generator.palette,
			0,
			(controller, value) => {
				generator.col = value;
			}
		),
		(doAddToRandomizerAs = true)
	);

	appearanceTab.addController(
		new Slider(
			appearanceTab,
			'sliderLogoScale',
			'LANG_SCALE logo',
			-1,
			1,
			log(generator.logoScale) / log(2),
			0.05,
			(controller, value) => {
				generator.logoScale = pow(2, value);
			}
		),
		(doAddToRandomizerAs = false)
	);

	appearanceTab.addController(
		new Slider(
			appearanceTab,
			'sliderLogoScale',
			'LANG_SCALE cat',
			-1,
			1,
			log(generator.cat.scaleAll) / log(2),
			0.05,
			(controller, value) => {
				generator.cat.scaleAll = pow(2, value);
			}
		),
		(doAddToRandomizerAs = false)
	);

	appearanceTab.addController(
		new Button(
			appearanceTab,
			'buttonRandomize',
			'LANG_RANDOMIZE',
			controller => {
				appearanceTab.randomizer.randomize();
				// generator.setup();
			},
			controller => {
				// controller.click(); // randomize on startup
			}
		)
	);

	appearanceTab.addDivider();

	appearanceTab.addTitle(2, 'LANG_IMAGE options', false);

	appearanceTab.addController(
		new Toggle(
			appearanceTab,
			'toggleShowImage',
			'LANG_HIDE LANG_IMAGE',
			'LANG_SHOW LANG_IMAGE',
			generator.doShowImage,
			(controller, value) => {
				generator.doShowImage = value;
				appearanceTab
					.getControllers(
						'imageLoader0,sliderImageScale,xyImagePosition,sliderImageX,sliderImageY'.split(
							','
						)
					)
					.forEach(controller =>
						generator.doShowImage
							? controller.show()
							: controller.hide()
					);
			}
		),
		(doAddToRandomizerAs = false)
	);

	appearanceTab.addController(
		new ImageLoader(
			appearanceTab,
			'imageLoader0',
			'LANG_SELECT LANG_IMAGE...',
			(controller, img) => {
				if (img instanceof p5.Image && img.isLoaded) return;
				if (img instanceof p5.Element && img.isLoaded) {
					// check if img isn't default image
					img.elt.onload();
					return;
				}
				print('Loading image...');
				img.elt.onload = () => {
					img.isLoaded = true;
					print('Image loaded.');
					const minW = floor(pw / (1 + maxImgResIncrease));
					const minH = floor(ph / (1 + maxImgResIncrease));
					if (img.width < minW || img.height < minH) {
						controller.setWarning(
							lang.process(
								'LANG_TOO_SMALL_IMG'.format(minW, minH)
							)
						);
						dialog.alert(
							lang.process(
								'LANG_TOO_SMALL_IMG_ALERT'.format(
									img.width,
									img.height,
									minW,
									minH
								)
							)
						);
					} else {
						controller.setConsole(controller.fileName, '');
					}
					generator.img = img;
					appearanceTab
						.getController('toggleShowImage')
						.setValue(true);
				};
			}
		)
	);

	appearanceTab.addController(
		new Slider(
			appearanceTab,
			'sliderImageScale',
			'LANG_SCALE LANG_IMAGE',
			-1,
			1,
			log(generator.imageScale) / log(2),
			0.05,
			(controller, value) => {
				generator.imageScale = pow(2, value);
			}
		),
		(doAddToRandomizerAs = false)
	);

	appearanceTab.addController(
		new XYSlider(
			appearanceTab,
			'xyImagePosition',
			'LANG_IMAGE_POSITION',
			-1,
			1,
			0,
			0.001,
			-1,
			1,
			0,
			0.001,
			(controller, value) => {
				generator.imagePosition.set(value.x, value.y);
			}
		),
		(doAddToRandomizerAs = false)
	);

	// ------------------------------ EXPORT ------------------------------
	exportTab.addTitle(2, 'As an LANG_IMAGE', false);

	exportTab.addController(
		new Button(
			exportTab,
			'buttonCopyPNG',
			'LANG_COPY_TO_CLIPBOARD',
			controller => {
				copyCanvasToClipboard();
			},
			controller => {
				controller._doUpdateChangeSet = false;
			}
		)
	);

	exportTab.addController(
		new Button(
			exportTab,
			'buttonDownloadPNG',
			'Download PNG',
			controller => {
				save(Generator.getOutputFileName() + '.png');
			},
			controller => {
				controller._doUpdateChangeSet = false;
			}
		)
	);

	// exportTab.addController(new Button(
	//   exportTab, 'buttonDownloadSVG', 'Download SVG',
	//   (controller) => {
	//     generator.draw(doSVGToo=true);
	//     svgCanvas.save(Generator.getOutputFileName() + '.svg');
	//   }
	// ));

	exportTab.addDivider();

	exportTab.addTitle(2, 'As a settings file', false);

	exportTab.addController(
		new Button(
			exportTab,
			'buttonSaveSettings',
			'LANG_SAVE_SETTINGS',
			controller => {
				const fileName = dialog
					.prompt(lang.process('LANG_CHOOSE_FILE_NAME_MSG', true))
					.then(fileName => {
						changeSet.download(fileName);
					});
			},
			controller => {
				controller._doUpdateChangeSet = false;
			}
		)
	);

	exportTab.addController(
		new JSONFileLoader(
			exportTab,
			'jsonFileLoaderSettings',
			'LANG_LOAD_SETTINGS',
			(controller, file) => {
				print(controller, file);
				controller.setConsole(controller.fileName, '');
				changeSet.loadFromJSON(JSON.stringify(file.data));
			},
			controller => {
				controller.controllerElement.elt.accept += ',.settings';
			},
			controller => {
				controller._doUpdateChangeSet = false;
			}
		)
	);

	exportTab.addDivider();

	exportTab.addTitle(2, 'LANG_SUPPORT', false);

	exportTab.addController(
		new Button(exportTab, 'buttonHelpMe', 'LANG_HELP', controller => {
			helpMe();
		})
	);

	if (Generator.supportEmail?.indexOf('@') > -1) {
		let contactField = exportTab.addHTMLAsNewField(
			lang.process(
				`<a href="mailto:${Generator.supportEmail}` +
					`?subject=${Generator.name} generator` +
					`">LANG_CONTACT_MSG</a>`
			)
		);
		contactField.div.id('contact');
		contactField.div.parent(exportTab.div);
	}

	// ------------------------------ GUI BOTTOM ------------------------------
	gui.div.child(createDiv().class('gui-filler')); // pushes undo/redo to bottom

	gui.createUndoRedoButtons();

	gui.createP5CatalystLogo();

	gui.createDarkModeButton();

	// gui.randomizer.randomize(); // initialize randomly

	gui.setup();

	resizeCanvas(1920, 1920);
	containCanvasInWrapper();
}

const resolutionOptions = [
	'Full-HD (1080p) LANG_PORTRAIT: 1080 x 1920',
	'Full-HD (1080p) LANG_LANDSCAPE: 1920 x 1080',
	'4K-Ultra-HD (2160p): 3840 x 2160',

	'Instagram post LANG_PORTRAIT: 1080 x 1350',
	'(Instagram post LANG_SQUARE): 1080 x 1080',
	'Instagram story: 1080 x 1920',

	'Facebook post LANG_LANDSCAPE: 1200 x 630',
	'Facebook post LANG_PORTRAIT: 630 x 1200',
	'Facebook post LANG_SQUARE: 1200 x 1200',
	'Facebook story: 1080 x 1920',
	'Facebook cover photo: 851 x 315',

	'X post LANG_LANDSCAPE: 1600 x 900',
	'X post LANG_PORTRAIT: 1080 x 1350',
	'X post LANG_SQUARE: 1080 x 1080',
	'X cover photo: 1500 x 500',

	'Linkedin LANG_PROFILEPIC: 400 x 400',
	'Linkedin cover photo: 1584 x 396',
	'Linkedin image post: 1200 x 628',

	'Mastodon post LANG_LANDSCAPE: 1280 x 720',
	'Mastodon post LANG_SQUARE: 1200 x 1200',

	'BlueSky post LANG_LANDSCAPE: 1200 x 675',
	'BlueSky post LANG_SQUARE: 1200 x 1200',
	'BlueSky header: 1500 x 500',

	'YouTube LANG_PROFILEPIC: 800 x 800',
	'YouTube banner: 2048 x 1152',
	'YouTube thumbnail: 1280 x 720',
	'YouTube shorts/stories: 1080 x 1920',

	'TikTok LANG_PORTRAIT: 1080 x 1920',
	'TikTok LANG_SQUARE: 1080 x 1080',

	'PowerPoint: 1920 x 1080',

	getAPaperResolutionOptionAtDpi(5, 300),
	getAPaperResolutionOptionAtDpi(4, 300),
	getAPaperResolutionOptionAtDpi(3, 300),
	getAPaperResolutionOptionAtDpi(2, 300),
	getAPaperResolutionOptionAtDpi(1, 300),
	getAPaperResolutionOptionAtDpi(0, 300),
	getAPaperResolutionOptionAtDpi(5, 300, false),
	getAPaperResolutionOptionAtDpi(4, 300, false),
	getAPaperResolutionOptionAtDpi(3, 300, false),
	getAPaperResolutionOptionAtDpi(2, 300, false),
	getAPaperResolutionOptionAtDpi(1, 300, false),
	getAPaperResolutionOptionAtDpi(0, 300, false),
];

function getAPaperResolutionOptionAtDpi(aNumber, dpi, isPortrait = true) {
	// A0 paper size in mm
	const baseWidth = 841;
	const baseHeight = 1189;
	const factor = Math.pow(2, aNumber / 2);
	const wMm = Math.floor(baseWidth / factor);
	const hMm = Math.floor(baseHeight / factor);
	const wPx = Math.round((wMm / 25.4) * dpi);
	const hPx = Math.round((hMm / 25.4) * dpi);
	return (
		`A${aNumber} ${
			isPortrait ? 'LANG_PORTRAIT' : 'LANG_LANDSCAPE'
		} @ ${dpi} DPI: ` +
		`${isPortrait ? wPx : hPx} x ${isPortrait ? hPx : wPx}`
	);
}

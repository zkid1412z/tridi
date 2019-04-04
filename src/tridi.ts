/*
  Tridi v0.0.5 - 360 3D Product Viewer
  Author: Łukasz Wójcik
  License: MIT
  Homepage: https://tridi.lukem.net
  GitHub: http://github.com/lukemnet/tridi
*/

type ImageArray = ReadonlyArray<string>;
type NumberedImages = 'numbered';

interface TridiClass {
  [key: string]: any
}
interface TridiOptions {
  [key: string]: any
  element: string,
  images: ImageArray | NumberedImages,
  imageFormat?: string,
  imageCount?: number,
  imageLocation?: string,
  showHintOnStartup?: boolean,
  lazy?: boolean,
  hintText?: string | null,
  draggable?: boolean,
  autoplay?: boolean,
  autoplaySpeed?: number,
  stopAutoplayOnClick?: boolean,
  stopAutoplayOnMouseenter?: boolean,
  resumeAutoplayOnMouseleave?: boolean,
  resumeAutoplayDelay: number,
  buttons?: boolean,
  scroll?: boolean,
  spinner? :boolean,
  mousewheel?: boolean,
  wheelInverse?: boolean,
  dragInterval?: number,
  touchDragInterval?: number,
  mouseleaveDetect?: boolean,
  touch?: boolean,
  inverse?: boolean,
  playable?: boolean,
  verbose?: boolean,
}

interface TridiUpdatableOptions {
  [key: string]: any
  images?: ImageArray | NumberedImages,
  imageFormat?: string,
  imageCount?: number,
  imageLocation?: string,
}

class Tridi implements TridiClass {
  [key: string]: any;
  element: string;
  images?: ImageArray | NumberedImages;
  imageFormat?: string;
  imageLocation?: string;
  imageCount?: number;
  draggable?: boolean;
  showHintOnStartup?: boolean;
  hintText?: string | null;
  lazy?: boolean;
  autoplay?: boolean;
  autoplaySpeed?: number;
  stopAutoplayOnClick?: boolean;
  stopAutoplayOnMouseenter?: boolean;
  resumeAutoplayOnMouseleave?: boolean;
  resumeAutoplayDelay: number;
  buttons?: boolean;
  scroll?: boolean;
  spinner?: boolean;
  dragInterval?: number;
  touchDragInterval?: number;
  mouseleaveDetect?: boolean;
  touch?: boolean;
  mousewheel?: boolean;
  wheelInverse?: boolean;
  inverse?: boolean;
  verbose: boolean;
  private imageIndex: number;
  private moveBuffer: number[];
  private dragActive: boolean;
  private intervals: number[];
  private timeouts: number[];

  constructor(options: TridiOptions) {
    this.validate(options);
    
    this.element = options.element;
    this.images = options.images  || 'numbered';
    this.imageFormat = options.imageFormat || undefined;
    this.imageLocation = options.imageLocation || './images';
    this.imageCount = Array.isArray(this.images) ? this.images.length : options.imageCount;
    this.draggable = typeof options.draggable !== 'undefined' ? options.draggable : true;
    this.showHintOnStartup = options.showHintOnStartup || false;
    this.hintText = options.hintText || null;
    this.lazy = options.lazy || false;
    this.autoplay = options.autoplay || false;
    this.autoplaySpeed = typeof options.autoplaySpeed !== 'undefined' ? options.autoplaySpeed : 50;
    this.stopAutoplayOnClick = options.stopAutoplayOnClick || false;
    this.stopAutoplayOnMouseenter = options.stopAutoplayOnMouseenter || false;
    this.resumeAutoplayOnMouseleave = options.resumeAutoplayOnMouseleave || false;
    this.resumeAutoplayDelay = options.resumeAutoplayDelay || 0;
    this.buttons = options.buttons || false;
    this.scroll = options.scroll || false;
    this.spinner = options.spinner || false;
    this.touch = typeof options.touch !== 'undefined' ? options.touch : true;
    this.mousewheel = options.mousewheel || false;
    this.wheelInverse = options.wheelInverse || false;
    this.inverse = options.inverse || false;
    this.dragInterval = options.dragInterval || 1;
    this.touchDragInterval = options.touchDragInterval || 2;
    this.mouseleaveDetect = typeof options.mouseleaveDetect !== 'undefined' ? options.mouseleaveDetect : false;
    this.verbose = options.verbose || false;
    this.imageIndex = 1;
    this.moveBuffer = [];
    this.dragActive = false;
    this.intervals = [];
    this.timeouts = [];

    if (this.verbose) console.log(Tridi.h(this.element), 'Class intialized');
  }

  static h(element?: string) {
    return `Tridi${element ? ` [${element}]` : ''}:`;
  }

  private validate = (options: TridiOptions) => {
    if (!options.element) {
      console.error(
        Tridi.h(),
        `'element' property is missing or invalid. Container element must be specified.`
      );
    }

    if (typeof options.images === 'undefined' && typeof options.imageFormat === 'undefined') {
      console.error(
        Tridi.h(),
        `'imageFormat' property is missing or invalid. Image format must be provided for 'numbered' property.`
      );
    }

    if (options.images === 'numbered' && !options.imageLocation) {
      console.error(
        Tridi.h(),
        `'imageLocation' property is missing or invalid. Image location must be provided for 'numbered' property.`
      );
    }

    if (Array.isArray(options.images) && options.imageFormat) {
      console.warn(
        Tridi.h(),
        `Got array of images as initalizing parameter. 'imageFormat' property will be ignored.`
      );
    }

    if (Array.isArray(options.images) && options.imageLocation) {
      console.warn(
        Tridi.h(),
        `Got array of images as initalizing parameter. 'imageLocation' property will be ignored.`
      );
    }

    if (Array.isArray(options.images) && options.imageCount) {
      console.warn(
        Tridi.h(),
        `Got array of images as initalizing parameter. 'imageCount' property will be ignored.`
      );
    }

    if (!options.showHintOnStartup && options.hintText) {
      console.warn(
        Tridi.h(),
        `'showHintOnStartup is set to 'false'. 'hintText' parameter will be ignored.`
      );
    }

    if (!options.draggable && options.mouseleaveDetect) {
      console.warn(
        Tridi.h(),
        `'draggable is set to 'false'. 'mouseleaveDetect' parameter will be ignored.`
      );
    }

    if (!options.autoplay && options.autoplaySpeed) {
      console.warn(
        Tridi.h(),
        `'autoplay is set to 'false'. 'autoplaySpeed' parameter will be ignored.`
      );
    }

    if (!options.autoplay && options.stopAutoplayOnMouseenter) {
      console.warn(
        Tridi.h(),
        `'autoplay is set to 'false'. 'stopAutoplayOnMouseenter' parameter will be ignored.`
      );
    }

    if (!options.autoplay && options.resumeAutoplayOnMouseleave) {
      console.warn(
        Tridi.h(),
        `'autoplay is set to 'false'. 'resumeAutoplayOnMouseleave' parameter will be ignored.`
      );
    }

    if (!options.autoplay && options.resumeAutoplayDelay) {
      console.warn(
        Tridi.h(),
        `'autoplay is set to 'false'. 'resumeAutoplayDelay' parameter will be ignored.`
      );
    }
  }

  private updateOption(option: string, value: any) {
    this[option] = value;
  }

  private validateUpdate(options:TridiUpdatableOptions) {
    if (!options.images && !options.imageFormat && !options.imageCount && !options.imageLocation) {
      console.error(Tridi.h(), `UpdatableOptions object doesn't contain updatable options`);
      return false;
    }
    return true;
  }

  private updateOptions(options:TridiOptions | TridiUpdatableOptions) {
    Object.keys(options).forEach(key => {
      this.updateOption(key, options[key])
    });
  }

  private getElem(cssClass?: string, child?: boolean) {
    return <HTMLElement>document.querySelector(`${this.element}${child ? ' ' : '' }${cssClass ? cssClass : ''}`);
  }

  private container() {
    return this.getElem();
  }

  private viewer() {
    return this.getElem('.tridi-viewer')!;
  }

  private stash() {
    return this.getElem('.tridi-stash', true);
  }

  private leftBtn() {
    return this.getElem('.tridi-btn-left', true);
  }

  private rightBtn() {
    return this.getElem('.tridi-btn-right', true);
  }

  private getHintOverlay() {
    return this.getElem('.tridi-hint-overlay', true);
  }

  private getLoadingScreen() {
    return this.getElem('.tridi-loading', true);
  }

  private image(whichImage: number) {
    return this.imgs()![whichImage -1];
  }

  private firstImage() {
    return this.image(1);
  }

  private viewerImage() {
    return <HTMLImageElement>this.getElem('.tridi-viewer .tridi-viewer-image');
  }

  private lazyLoad(callback: Function, skip?: Boolean) {
    if (this.lazy && !skip) {
      this.viewerImage().addEventListener('click', () => {
        callback();
      });

      if (this.touch) {
        this.viewerImage().addEventListener('touchstart', () => {
          callback();
        });
      }
    } else {
      callback();
    }
  }

  private imgs() {
    if (this.images === 'numbered') {
      const count = this.imageCount;
      const location = this.imageLocation;
      const format = this.imageFormat;
      return <ReadonlyArray<string>>Array.apply(null, { length: count }).map(({}, index: number) => `${location}/${index + 1}.${format}`);
    }

    if (Array.isArray(this.images)) return this.images as ReadonlyArray<string>;

    console.error(Tridi.h(this.element), 'Error getting images from source.');
    return null;
  }

  private generateViewer() {
    const container = this.container();
    if (!container) {
      console.error(this.element, `Viewer element not found`);
    } else {
      if (this.verbose) console.log(Tridi.h(this.element), 'Appending Tridi CSS classes');
      const element = this.element.substr(1);

      container.className += 
          ' tridi-viewer'
          + ` tridi-${element}-viewer`
          + ` tridi-draggable-${this.draggable}`
          + ` tridi-touch-${this.touch}`
          + ` tridi-mousewheel-${this.mousewheel}`
          + ` tridi-showHintOnStartup-${this.showHintOnStartup}`
          + ` tridi-lazy-${this.lazy}`
          + ` tridi-buttons-${this.buttons}`;
    }
  }

  private generateLoadingScreen() {
    const loadingScreen = document.createElement('div');
    loadingScreen.className = 'tridi-loading';
    loadingScreen.style.display = 'none';

    const loadingSpinner = document.createElement('div');
    loadingSpinner.className = 'tridi-spinner';
    loadingScreen.appendChild(loadingSpinner);

    this.viewer().appendChild(loadingScreen);
  }

  private setLoadingState(enable: boolean) {
    this.getLoadingScreen().style.display = enable ? 'block' : 'none';
  }

  private generateStash() {
    if (!this.stash()) {
      if (this.verbose) console.log(Tridi.h(this.element), 'Generating image stash');
      const stashElement = document.createElement('div');
      stashElement.classList.add('tridi-stash');
      this.viewer().appendChild(stashElement);
    }
  }

  private destroyStash() {
    if (this.stash()) this.stash().remove();
  }

  private displayHintOnStartup(callback: Function) {
    if (this.showHintOnStartup) {
      if (this.verbose) console.log(Tridi.h(this.element), 'Generating hint on startup');
      
      const element = this.element.substr(1);
      const hintOverlayClassName = `tridi-${element}-hint-overlay`;
      const hintOverlay = document.createElement('div');
      hintOverlay.className += `tridi-hint-overlay ${hintOverlayClassName}`;
      hintOverlay.tabIndex = 0;

      const hintClassName = `tridi-${element}-hint`;
      const hint = document.createElement('div');
      hint.className += `tridi-hint ${hintClassName}`;

      if (this.hintText) hint.innerHTML = `<span class="tridi-hint-text">${this.hintText}</span>`;

      hintOverlay.appendChild(hint);
      
      this.viewer().appendChild(hintOverlay);

      const hintClickHandler = (e: Event) => {
        const isItHintOverlay = (e.target as HTMLElement).classList.contains(hintOverlayClassName);
        const isItHintText = (e.target as HTMLElement).classList.contains(hintClassName);

        if (isItHintOverlay || isItHintText) {
          this.getHintOverlay().style.display = 'none';
          callback();
        }
      }

      document.addEventListener('click', hintClickHandler);
      if (this.touch) document.addEventListener('touchstart', hintClickHandler);

      document.addEventListener('keydown', (e) => {
        if (e.which === 13) hintClickHandler(e);
      });
    } else {
      callback();
    }
  }

  private populateStash() {
      const stash = this.stash();
      const images = this.imgs();
      
      if (stash && images) {
        images.forEach((image, index) => {
          stash.innerHTML += `<img src="${image}" class="tridi-image tridi-image-${index+1}" alt="" />`;
        });
      } else {
        console.error(this.element, 'Error populating stash!');
      }
  }



  private generateViewerImage() {
    if (this.verbose) console.log(Tridi.h(this.element), 'Generating viewer image');
    const viewer = this.viewer();
    const image = this.firstImage();

    viewer.innerHTML = `<img src="${image}" alt="" class="tridi-viewer-image" draggable="false" />${viewer.innerHTML}`;
  }

  private updateViewerImage(whichImage?: number) {
    this.viewerImage().src = whichImage ? this.image(whichImage) : this.firstImage();
  }

  private nextFrame() {
    const viewerImage = this.viewerImage();

    this.imageIndex = this.imageIndex <= 1
      ? this.imageCount!
      : this.imageIndex - 1;

    viewerImage.src = this.image(this.imageIndex);
  }

  private prevFrame() {
    const viewerImage = this.viewerImage();

    this.imageIndex = this.imageIndex >= this.imageCount!
      ? 1
      : this.imageIndex + 1

      viewerImage.src = this.image(this.imageIndex);
  }

  private rotateViewerImage(e: MouseEvent | TouchEvent) {
    const touch = (e as TouchEvent).touches;
    const interval = (touch ? this.touchDragInterval : this.dragInterval)!;

    const eventX = (e as TouchEvent).touches
      ? (e as TouchEvent).touches[0].clientX
      : (e as MouseEvent).clientX;

    const coord = (eventX - this.viewerImage().offsetLeft);

    if (this.moveBuffer.length < 2) {
      this.moveBuffer.push(coord);
    } else {
      const tmp = this.moveBuffer[1];
      this.moveBuffer[1] = coord;
      this.moveBuffer[0] = tmp;
    }
    
    const threshold = !(coord % interval);
    const oldMove = this.moveBuffer[0];
    const newMove = this.moveBuffer[1];
    const nextMove = () => this.inverse ? this.prevFrame() : this.nextFrame();
    const prevMove = () => this.inverse ? this.nextFrame() : this.prevFrame();

    if (threshold) {
      if (newMove < oldMove) {
        nextMove();
      } else if (newMove > oldMove) {
        prevMove();
      }
    }
  }

  private startDragging() {
    this.dragActive = true;
  }

  private stopDragging() {
    this.dragActive = false;
  }

  private resetMoveBuffer() {
    this.moveBuffer.length = 0;
  }

  private attachCosmeticEvents() {
    if (this.verbose) console.log(Tridi.h(this.element), 'Attaching common events');

    const viewer = this.viewer();

    viewer.addEventListener('mouseenter', () => {
      if (this.verbose) console.log(Tridi.h(this.element), 'Mouseenter event triggered');
      viewer.classList.add('tridi-viewer-hovered');
    });

    viewer.addEventListener('mouseleave', () => {
      if (this.verbose) console.log(Tridi.h(this.element), 'Mouseleave event triggered');
      viewer.classList.remove('tridi-viewer-hovered');
    });
  }

  private attachDragEvents() {
    if (this.draggable) {
      const viewerImage = this.viewerImage();

      if (this.verbose) console.log(Tridi.h(this.element), 'Attaching drag events');

      viewerImage.addEventListener('mouseup', (e) => {
        if (e.preventDefault) e.preventDefault();
        if (this.verbose) console.log(Tridi.h(this.element), 'Mouseup triggered');
        this.stopDragging();
        this.resetMoveBuffer();
      });

      viewerImage.addEventListener('mousedown', (e) => {
        if (e.preventDefault) e.preventDefault();
        if (this.verbose) console.log(Tridi.h(this.element), 'Mousedown triggered');
        this.startDragging();
        this.rotateViewerImage(e);
      });

      viewerImage.addEventListener('mousemove', (e) => {
        if (this.dragActive) {
          if (this.verbose) console.log(Tridi.h(this.element), 'Mousemove triggered');
          this.rotateViewerImage(e);
        }
      });

      viewerImage.addEventListener('mouseleave', () => {
        if (this.verbose) console.log(Tridi.h(this.element), 'Mouseleave triggered');
        this.resetMoveBuffer();
      });
    }
  }

  private attachMouseLeaveDetection() {
    if (this.mouseleaveDetect) {
      if (this.verbose) console.log(Tridi.h(this.element), 'Attaching mouseleave detection');
      
      const viewer = this.viewer();

      viewer.addEventListener('mouseleave', () => {
        if (this.verbose) console.log(Tridi.h(this.element), 'Viewer mouseleave triggered');
        this.stopDragging();
        this.resetMoveBuffer();
      });
    }
  }

  private attachTouchEvents() {
    if (this.touch) {
      if (this.verbose) console.log(Tridi.h(this.element), 'Attaching touch events');

      const viewerImage = this.viewerImage();

      viewerImage.addEventListener('touchstart', (e) => {
        if (e.preventDefault) e.preventDefault();
        if (this.verbose) console.log(Tridi.h(this.element), 'Touchstart triggered');
        this.startDragging();
        this.rotateViewerImage(e);
      });

      viewerImage.addEventListener('touchmove', (e) => {
        if (e.preventDefault) e.preventDefault();
        if (this.verbose) console.log(Tridi.h(this.element), 'Touchmove triggered');
        this.rotateViewerImage(e);
      });

      viewerImage.addEventListener('touchend', (e) => {
        if (e.preventDefault) e.preventDefault();
        if (this.verbose) console.log(Tridi.h(this.element), 'Touchend triggered');
        this.stopDragging();
        this.resetMoveBuffer();
      });
    }
  }

  private attachMousewheelEvents() {
    if (this.mousewheel) {
      if (this.verbose) console.log(Tridi.h(this.element), 'Attaching mousewheel events');
      
      const viewerImage = this.viewerImage();
      const nextMove = () => this.wheelInverse ? this.prevFrame() : this.nextFrame();
      const prevMove = () => this.wheelInverse ? this.nextFrame() : this.prevFrame();
      
      viewerImage.addEventListener('wheel', (e) => {
        if (e.preventDefault) e.preventDefault();
        (e.deltaY / 120 > 0) ? nextMove() : prevMove();
      });
    }
  }

  private generateButtons() {
    if (this.buttons) {
      if (!this.leftBtn() && !this.rightBtn()) {
        if (this.verbose) console.log(Tridi.h(this.element), 'Generating buttons');

        const leftBtn = document.createElement('div');
        const rightBtn = document.createElement('div');
        leftBtn.className += 'tridi-btn tridi-btn-left';
        leftBtn.setAttribute('tabindex', '0');
        rightBtn.className += 'tridi-btn tridi-btn-right';
        rightBtn.setAttribute('tabindex', '0');

        this.viewer().appendChild(leftBtn);
        this.viewer().appendChild(rightBtn);
      }
    }
  }

  private attachButtonEvents() {
    if (this.buttons) {
      const leftBtn = this.leftBtn();
      const rightBtn = this.rightBtn();

      if (leftBtn) {
        if (this.verbose) console.log(Tridi.h(this.element), 'Attaching left button click event');

        leftBtn.addEventListener('click', () => {
          if (this.verbose) console.log(Tridi.h(this.element), 'Left button click triggered');
          this.inverse ? this.prevFrame() : this.nextFrame();
        });

        leftBtn.addEventListener('keydown', (e) => {
          if (e.which === 13) {
            if (this.verbose) console.log(Tridi.h(this.element), 'Left button Enter keydown triggered');
            this.inverse ? this.prevFrame() : this.nextFrame();
          }
        });
      }

      if (rightBtn) {
        if (this.verbose) console.log(Tridi.h(this.element), 'Attaching right button click event');

        rightBtn.addEventListener('click', () => {
          if (this.verbose) console.log(Tridi.h(this.element), 'Right button click triggered');
          this.inverse ? this.nextFrame() : this.prevFrame();
        });

        rightBtn.addEventListener('keydown', (e) => {
          if (e.which === 13) {
            if (this.verbose) console.log(Tridi.h(this.element), 'Right button Enter keydown triggered');
          this.inverse ? this.nextFrame() : this.prevFrame();
          }
        });
      }
    }
  }

  private toggleAutoplay(state:boolean, skipDelay?: boolean) {
    const speed = this.autoplaySpeed;

    if (!state) {
      this.intervals.forEach(clearInterval);
      this.intervals.length = 0;
    } else {
      this.timeouts.forEach(clearTimeout);
      this.timeouts.length = 0;

      if (skipDelay) {
        const autoplayInterval = window.setInterval(() => {
          this.nextFrame();
        }, speed);
        this.intervals.push(autoplayInterval);
      } else {
        const autoplayTimeout = window.setTimeout(() => {
          const autoplayInterval = window.setInterval(() => {
            this.nextFrame();
          }, speed);
          this.intervals.push(autoplayInterval);
        }, this.resumeAutoplayDelay);
        this.timeouts.push(autoplayTimeout);
      }
    }
  }

  private startAutoplay() {
    if (this.autoplay) {
      if (this.verbose) console.log(Tridi.h(this.element), 'Starting autoplay');

      this.toggleAutoplay(true, true);

      if (this.stopAutoplayOnClick) {
        if (this.verbose) console.log(Tridi.h(this.element), 'Enable stop autoplay on click event');

        this.viewerImage().addEventListener('mousedown', () => {
          if (this.verbose) console.log(Tridi.h(this.element), 'Stopping autoplay on mousedown');
          this.toggleAutoplay(false);
        });
      }
      if (this.stopAutoplayOnMouseenter) {
        if (this.verbose) console.log(Tridi.h(this.element), 'Enable stop autoplay on hover event');

        this.viewerImage().addEventListener('mouseenter', () => {
          if (this.verbose) console.log(Tridi.h(this.element), 'Stopping autoplay on mouseenter');
          this.toggleAutoplay(false);
        });
      }

      if(this.resumeAutoplayOnMouseleave) {
        const viewerImage = this.viewerImage();

        viewerImage.addEventListener('mouseleave', (e) => {
          if (this.verbose) console.log(Tridi.h(this.element), 'Resuming autoplay on mouseleave');

          if (!(e.target as HTMLElement).classList.contains('tridi-btn')) {
            this.toggleAutoplay(true);
          }
        });
      }
    }
  }

  private attachEvents() {
    this.attachCosmeticEvents();
    this.attachDragEvents();
    this.attachMouseLeaveDetection();
    this.attachTouchEvents();
    this.attachMousewheelEvents();
   
  }

  private start() {
    this.generateViewer();
    this.generateLoadingScreen();
    this.setLoadingState(true);
    this.generateViewerImage();
    this.setLoadingState(false);
    this.displayHintOnStartup(()=> {
      this.lazyLoad(() => {
        this.setLoadingState(true);
        this.generateStash();
        this.populateStash();
        this.attachEvents();
        this.generateButtons();
        this.attachButtonEvents();
        this.startAutoplay();
        this.setLoadingState(false);
      });
    });
  }

  updateImageLocation(options: TridiUpdatableOptions, syncFrame?:boolean) {
    if (this.validateUpdate(options)) {
      this.setLoadingState(true);
      this.updateOptions(options);
      this.destroyStash();
      this.generateStash();
      this.populateStash();
      this.updateViewerImage(syncFrame ? this.imageIndex : 1);
      this.attachEvents();
      this.setLoadingState(false);
    }
  }

  load() {
    this.start();
  }
}
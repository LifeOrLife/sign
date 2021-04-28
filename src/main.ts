interface config {
	[key: string]: string | number;
}

type stacks = { x: number; y: number }[];

class startDraw {
	el: HTMLElement;
	config: config;
	stacks: stacks;
	context?: CanvasRenderingContext2D;
	width?: number;
	height?: number;
	move?: (e) => void;
	up?: (e) => void;
	canDraw?: boolean;
	x?: number;
	y?: number;
	constructor(el, config = {}) {
		this.el = el;
		const _conf = {
			lineWidth: 6,
			color: '#black'
		};
		this.config = Object.assign(_conf, config);
		this.stacks = []; // 用来存储操作步骤
		this.move = (e) => {
			if (this.canDraw) {
				const ctx = this.context;
				this.x = e.layerX;
				this.y = e.layerY;
				ctx.lineTo(this.x, this.y);
				ctx.stroke();
			}
		};
		this.up = (e) => {
			this.canDraw = false;
		};
	}
	init() {
		const canvas = this.el as HTMLCanvasElement;
		let { width, height } = window.getComputedStyle(canvas, null);
		let w = parseInt(width);
		let h = parseInt(height);
		this.context = canvas.getContext('2d');
		this.width = w;
		this.height = h;
		const context = this.context;
		// 根据设备像素比优化canvas绘图
		const devicePixelRatio = window.devicePixelRatio;
		canvas.style.width = `${width}px`;
		canvas.style.height = `${height}px`;
		if (devicePixelRatio) {
			canvas.height = h * devicePixelRatio;
			canvas.width = w * devicePixelRatio;
			context.scale(devicePixelRatio, devicePixelRatio);
		} else {
			canvas.width = w;
			canvas.height = h;
		}
		context.lineWidth = this.config.lineWidth as number;
		context.strokeStyle = this.config.color as string;
		context.lineCap = 'round';
		context.lineJoin = 'round';

		this.bindEvent();
		this.addRecall();
	}
	bindEvent() {
		const el = this.el;
		const ctx = this.context;
		el.addEventListener('mousedown', (e: any) => {
			this.canDraw = true;
			this.x = e.layerX;
			this.y = e.layerY;
			ctx.beginPath();
			ctx.moveTo(this.x, this.y);
		});
		document.addEventListener('mousemove', this.move);
		document.addEventListener('mouseup', this.up);
	}
	// 添加撤回操作
	addRecall() {
		document.addEventListener('keydown', (e) => {
			if (e.ctrlKey && e.code === 'KeyZ') {
				console.log('撤回操作');
			}
		});
	}
	clear() {
		const ctx = this.context;
		ctx.clearRect(0, 0, this.width, this.height);
	}
	getPNGImage() {
		const canvas = this.el as HTMLCanvasElement;
		return canvas.toDataURL('image/png');
	}
	downloadPNGImage() {
		const blob = this.dataURLtoBlob(this.getPNGImage());
		const url = URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.download = 'test.png';
		a.href = url;
		a.click();
	}
	dataURLtoBlob(dataURL: string): Blob {
		const arr = dataURL.split(',');
		const mime = arr[0].match(/:(.*?);/)[1];
		const bStr = atob(arr[1]);
		let n = bStr.length;
		const u8arr = new Uint8Array(n);
		while (n--) {
			u8arr[n] = bStr.charCodeAt(n);
		}
		return new Blob([u8arr], { type: mime });
	}
	dataURLtoFile(dataURL: string): File {
		const arr = dataURL.split(',');
		const mime = arr[0].match(/:(.*?);/)[1];
		const bStr = atob(arr[1]);
		let n = bStr.length;
		const u8arr = new Uint8Array(n);
		while (n--) {
			u8arr[n] = bStr.charCodeAt(n);
		}
		return new File([u8arr], '', { type: mime });
	}
}
const el = document.querySelector('.pen');
const pen = new startDraw(el);
pen.init();

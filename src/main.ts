interface config {
	[key: string]: string | number;
}

type stacks = { x: number; y: number }[];

class startDraw {
	el: HTMLElement;
	config: config;
	stacks: stacks[];
	current?: stacks;
	context?: CanvasRenderingContext2D;
	width?: number;
	height?: number;
	move?: (e) => void;
	up?: (e) => void;
	down?: (e) => void;
	canDraw?: boolean;
	x?: number;
	y?: number;
	left_v?: number; // x轴偏移量
	top_v?: number; // y轴偏移量
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
				if (this.isMobile()) {
					e.preventDefault();
					e = e.touches[0];
				}
				const p = {
					x: e.clientX - this.left_v,
					y: e.clientY - this.top_v
				};
				const ctx = this.context;
				this.x = p.x;
				this.y = p.y;
				ctx.lineTo(p.x, p.y);
				this.current.push(p);
				ctx.stroke();
			}
		};
		this.up = (e) => {
			if (this.canDraw) {
				this.stacks.push(this.current);
			}
			this.canDraw = false;
		};
		this.down = (e) => {
			e = this.isMobile() ? e.touches[0] : e;
			const p = { x: e.clientX - this.left_v, y: e.clientY - this.top_v };
			const ctx = this.context;
			this.canDraw = true;
			this.x = p.x;
			this.y = p.y;
			ctx.beginPath();
			this.current = [];
			this.current.push(p);
			ctx.moveTo(p.x, p.y);
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
		this.getPositionValue();
	}
	// 获取偏移量
	getPositionValue() {
		const style = this.el.getBoundingClientRect();
		this.left_v = style.left;
		this.top_v = style.top;
	}
	isMobile() {
		return /phone|pad|pod|iPhone|iPod|ios|iPad|Android|Mobile|BlackBerry|IEMobile|MQQBrowser|JUC|Fennec|wOSBrowser|BrowserNG|WebOS|Symbian|Windows Phone/i.test(
			navigator.userAgent
		);
	}
	bindEvent() {
		const el = this.el;
		let down = 'mousedown';
		let move = 'mousemove';
		let up = 'mouseup';
		if (this.isMobile()) {
			down = 'touchstart';
			move = 'touchmove';
			up = 'touchend';
		}
		el.addEventListener(down, this.down);
		document.addEventListener(move, this.move, { passive: false });
		document.addEventListener(up, this.up);
	}
	removeEvent() {
		const el = this.el;
		let down = 'mousedown';
		let move = 'mousemove';
		let up = 'mouseup';
		if (this.isMobile()) {
			down = 'touchstart';
			move = 'touchmove';
			up = 'touchend';
		}
		el.removeEventListener(down, this.down);
		document.removeEventListener(move, this.move);
		document.removeEventListener(up, this.up);
	}
	// 添加撤回操作
	addRecall() {
		document.addEventListener('keydown', (e) => {
			if (e.ctrlKey && e.code === 'KeyZ') {
				this.rePatint();
			}
		});
	}
	// 重新绘制点
	rePatint() {
		const stacks = this.stacks.slice(0, -1);
		this.stacks = stacks;
		this.clear();
		if (!this.stacks.length) {
			console.log('没有内容');
			return;
		}
		const ctx = this.context;
		this.stacks.forEach((p) => {
			const s = p[0];
			ctx.beginPath();
			ctx.moveTo(s.x, s.y);
			p.slice(1).forEach((p_v) => {
				ctx.lineTo(p_v.x, p_v.y);
			});
			ctx.stroke();
		});
	}
	clear() {
		const ctx = this.context;
		ctx.clearRect(0, 0, this.width, this.height);
	}
	resetCanvas() {
		this.stacks = [];
		this.clear();
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

function getEl(sel: string): HTMLElement {
	return document.querySelector(sel);
}

const el = document.querySelector('.pen');
const pen = new startDraw(el);
pen.init();
const download = getEl('.download');
const revoke = getEl('.revoke');
const clear = getEl('.clear');
download.addEventListener('click', () => {
	pen.downloadPNGImage();
});
revoke.addEventListener('click', () => {
	pen.rePatint();
});
clear.addEventListener('click', () => {
	pen.resetCanvas();
});

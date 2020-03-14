export type MixSizingInfo = {
	fullCanvas?: boolean,
	width?: number,    // <= 1: percentage
	height?: number,   // <= 1: percentage
	left?: number,     // <= 1: percentage
	top?: number,      // <= 1: percentage
	right?: number,    // <= 1: percentage
	bottom?: number,   // <= 1: percentage
	onRender?: (context: CanvasRenderingContext2D, video: HTMLVideoElement, mixSizingInfo: MixSizingInfo, x: number, y: number, width: number, height: number) => void
};
export type TrackWithMixSizingInfo = {
	mediaTrack: MediaStreamTrack,
	mixSizingInfo: MixSizingInfo
};
export type TrackWithMixSizingInfoAndVideo = TrackWithMixSizingInfo & { videoElement?: HTMLVideoElement };

export class VideoTrackMixer {
	private readonly inputTracks: TrackWithMixSizingInfoAndVideo[];
	private readonly canvas: HTMLCanvasElement;
	private readonly context: CanvasRenderingContext2D | null;
	private readonly frameRate: number;

	private drawVideoIntervalId: number;
	private outputTrack?: MediaStreamTrack;

	constructor(inputMediaStreamTracks: TrackWithMixSizingInfo[], frameRate: number = 10) {
		if (inputMediaStreamTracks.length === 0) {
			throw "inputMediaSreams may not be empty!";
		}
		this.frameRate = frameRate;
		this.inputTracks = inputMediaStreamTracks;
		this.canvas = document.createElement('canvas');
		this.context = this.canvas.getContext('2d');
		// this.canvas.style.position = 'absolute';   // TODO
		// this.canvas.style.left = '-100000px';      // TODO
		// this.canvas.style.top = '-100000px';       // TODO
		this.canvas.style.width = '800px';     // TODO
		this.canvas.style.height = '600px';    // TODO
		(document.body || document.documentElement).appendChild(this.canvas);
	}

	public getMixedTrack(): MediaStreamTrack {
		if (this.outputTrack == null) {
			for (let track of this.inputTracks) {
				track.videoElement = createVideoElement(track.mediaTrack);
			}
			this.outputTrack = this.getMixedVideoTrack();
			this.drawVideoIntervalId = window.setInterval(() => this.drawVideosToCanvas(), 1000 / this.frameRate);
		}
		return this.outputTrack;
	}

	private getMixedVideoTrack() {
		const capturedStream: MediaStream = ((this.canvas as any).captureStream && (this.canvas as any).captureStream(this.frameRate))
			|| ((this.canvas as any).mozCaptureStream && (this.canvas as any).mozCaptureStream(this.frameRate));
		return capturedStream.getVideoTracks()[0];
	}

	private drawVideosToCanvas() {
		console.log(`drawVideosToCanvas()`);
		let fullCanvasVideo = this.inputTracks.filter(track => track.mixSizingInfo.fullCanvas)[0];
		let remainingVideos = this.inputTracks.filter(ims => ims !== fullCanvasVideo);

		if (fullCanvasVideo) {
			this.canvas.width = fullCanvasVideo.mixSizingInfo.width || fullCanvasVideo.videoElement.videoWidth;
			this.canvas.height = fullCanvasVideo.mixSizingInfo.height || fullCanvasVideo.videoElement.videoHeight;
		} else {
			this.canvas.width = 360;
			this.canvas.height = 240;
		}

		if (fullCanvasVideo) {
			this.drawImage(fullCanvasVideo.videoElement, fullCanvasVideo.mixSizingInfo);
		}

		remainingVideos.forEach((video) => {
			this.drawImage(video.videoElement, video.mixSizingInfo);
		});
	}

	private drawImage(video: HTMLVideoElement, mixSizingInfo: MixSizingInfo) {
		let x = 0;
		let y = 0;
		let width;
		let height;

		if (mixSizingInfo.width != null) {
			if (mixSizingInfo.width >= 1) {
				width = mixSizingInfo.width;
			} else {
				width = this.canvas.width * mixSizingInfo.width;
			}
		} else {
			width = this.canvas.width;
		}
		if (mixSizingInfo.height != null) {
			if (mixSizingInfo.height >= 1) {
				height = mixSizingInfo.height;
			} else {
				height = this.canvas.height * mixSizingInfo.height;
			}
		} else {
			height = this.canvas.height;
		}

		if (mixSizingInfo.left != null) {
			if (mixSizingInfo.left >= 1) {
				x = mixSizingInfo.left;
			} else {
				x = this.canvas.width * mixSizingInfo.left;
			}
		}
		if (mixSizingInfo.top != null) {
			if (mixSizingInfo.top >= 1) {
				y = mixSizingInfo.top;
			} else {
				y = this.canvas.height * mixSizingInfo.top;
			}
		}
		if (mixSizingInfo.right != null) {
			if (mixSizingInfo.right >= 1) {
				x = this.canvas.width - width - mixSizingInfo.right;
			} else {
				x = this.canvas.width - width - (this.canvas.width * mixSizingInfo.right);
			}
		}
		if (mixSizingInfo.bottom != null) {
			if (mixSizingInfo.bottom >= 1) {
				y = this.canvas.height - height - mixSizingInfo.bottom;
			} else {
				y = this.canvas.height - height - (this.canvas.height * mixSizingInfo.bottom);
			}
		}


		if (this.context) {
			this.context.drawImage(video, x, y, width, height);

			if (typeof mixSizingInfo.onRender === 'function') {
				mixSizingInfo.onRender(this.context, video, mixSizingInfo, x, y, width, height);
			}
		}

	}

	public close() {
		this.outputTrack.stop();
		this.canvas.remove();
		window.clearInterval(this.drawVideoIntervalId);
	};
}

function createVideoElement(videoTrack: MediaStreamTrack) {
	const video = document.createElement('video');
	video.srcObject = new MediaStream([videoTrack]);
	video.muted = true;
	video.volume = 0;

	document.body.appendChild(video);  // TODO

	video.play()
		.catch(e => console.log("Error while play() on mixer source video element!", e));
	return video;
}

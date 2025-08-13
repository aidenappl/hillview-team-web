import React, { useEffect, useState } from "react";
import Uppy from "@uppy/core";
import Tus from "@uppy/tus";

import { CloudflareStatus } from "../../../../models/cloudflareStatus.model";
import { FetchAPI } from "../../../../services/http/requestHandler";

interface PageProps {
	hidden?: boolean;
	id?: string;
	onSourceURL?: (url: string) => void;
	onThumbnailURL?: (url: string) => void;
	onUppyState?: (
		state:
			| "none"
			| "dna"
			| "in-progress"
			| "finishing-up"
			| "status-checks"
			| "status-rolling"
			| "done"
			| "failed"
	) => void;
	onProgress?: (progress: number) => void;
	onEncodingProgress?: (progress: number) => void;
	onStatusBody?: (status: CloudflareStatus | null) => void;
}

const UploadComponent = (props: PageProps) => {
	const {
		onSourceURL = () => {},
		onThumbnailURL = () => {},
		onUppyState = () => {},
		onProgress = () => {},
		onEncodingProgress = () => {},
		onStatusBody = () => {},
		hidden,
		id,
	} = props;

	const [uppy, setUppy] = useState<any>(null);
	const [progress, setProgress] = useState<number>(0);
	const [uppyState, setUppyState] = useState<
		| "none"
		| "dna"
		| "in-progress"
		| "finishing-up"
		| "status-checks"
		| "status-rolling"
		| "done"
		| "failed"
	>("none");
	const [statusBody, setStatusBody] = useState<CloudflareStatus | null>(null);
	const [videoID, setVideoID] = useState<string>("");

	useEffect(() => {
		if (uppyState === "status-checks") {
			getEncodingProgress();
		}
		onUppyState(uppyState);
	}, [uppyState]);

	useEffect(() => {
		onProgress(progress);
	}, [progress]);

	useEffect(() => {
		onStatusBody(statusBody);
	}, [statusBody]);

	const getEncodingProgress = async () => {
		let poller = setInterval(async () => {
			const response = await FetchAPI<CloudflareStatus>(
				{
					method: "GET",
					url: `/video/v1.1/upload/cf/${videoID}`,
				},
				{ auth: true }
			);
			if (!response) {
				clearInterval(poller);
				return;
			}
			if (!response.success) {
				clearInterval(poller);
				setUppyState("failed");
				return;
			}
			setUppyState("status-rolling");
			let data = response.data;
			setStatusBody(data);
			if (data.success) {
				let status = data.result.status;
				if (
					status.state === "ready" &&
					parseInt(status.pctComplete) > 99
				) {
					setUppyState("done");
					console.log(data.result);
					onSourceURL(data.result.playback.hls);
					onThumbnailURL(data.result.thumbnail);
					clearInterval(poller);
				} else if (
					status.state === "ready" &&
					data.result.readyToStream &&
					data.result.playback.hls
				) {
					onThumbnailURL(data.result.thumbnail);
					onSourceURL(data.result.playback.hls);
				}
				if (status.state !== "queued") {
					onEncodingProgress(parseInt(status.pctComplete));
				} else {
					onEncodingProgress(0);
				}
			}
		}, 1000);
	};

	const initializeUppy = (file: File, uploadURL: string) => {
		const uppyInstance = new Uppy({
			debug: true,
			autoProceed: true,
			restrictions: {
				maxNumberOfFiles: 1,
			},
		});

		uppyInstance.use(Tus, {
			endpoint: uploadURL,
			chunkSize: 50 * 1024 * 1024,
			removeFingerprintOnSuccess: true,
		});

		uppyInstance.on("upload-progress", (file, progress) => {
			let precProgress = Math.round(
				(progress.bytesUploaded / progress.bytesTotal) * 100
			);
			if (precProgress === 100) {
				setUppyState("finishing-up");
			} else {
				setUppyState("in-progress");
			}
			setProgress(precProgress);
		});

		uppyInstance.on("complete", (result) => {
			console.log("Successfully uploaded files:", result.successful);
			setVideoID(formatVideoURL(result.successful[0].uploadURL));
			setUppyState("status-checks");
			// Handle result here
		});

		uppyInstance.addFile({
			name: file.name,
			type: file.type,
			size: file.size,
			data: file,
		});

		setUppy(uppyInstance);
	};

	const formatVideoURL = (url: string): string => {
		const regex = /tus\/(.*?)\?tusv2/;
		const match = url.match(regex);
		if (!match) return "";
		return match[1];
	};

	const handleFileChange = async (e: any) => {
		const file = e.target.files[0];
		if (!file) return;
		setUppyState("dna");
		initializeUppy(file, "/api/upload");
	};

	return (
		<div className={hidden ? "hidden" : ""}>
			<input
				type="file"
				onChange={handleFileChange}
				id={id ? id : "file-upload"}
				name="file-upload"
				accept=".mp4, .m4v"
				className="sr-only"
			/>
			{uppyState === "in-progress" && <div>Uploading: {progress}%</div>}
			{uppyState === "finishing-up" && <div>Processing...</div>}
			{uppyState === "status-checks" && <div>Checking status...</div>}
			{uppyState === "status-rolling" &&
				statusBody &&
				statusBody.result.status.state == "queued" && (
					<div>Queued for Encoding...</div>
				)}
			{uppyState === "done" ||
				(uppyState == "status-rolling" &&
					statusBody &&
					statusBody.result.readyToStream && (
						<div>Ready to Stream!</div>
					))}
			{uppyState === "status-rolling" &&
				statusBody &&
				statusBody.result.status.state != "queued" && (
					<div>
						Encoding:{" "}
						{Math.round(
							parseInt(statusBody.result.status.pctComplete)
						)}
						%
					</div>
				)}
			{uppyState === "done" && <div>Done!</div>}
		</div>
	);
};

export default UploadComponent;

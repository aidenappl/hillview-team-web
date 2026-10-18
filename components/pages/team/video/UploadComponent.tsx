import React, { useEffect, useRef, useState } from "react";
import * as UpChunk from "@mux/upchunk";

import { MuxUploadStatus } from "../../../../types";
import { DropzoneStates } from "../TeamModalDropzone";
import {
	reqCreateMuxUpload,
	reqGetMuxUploadStatus,
} from "../../../../services/api/mux.service";

// Mux direct upload: videoAPI mints a resumable PUT url, UpChunk sends the file
// in 50MB chunks (a multiple of the 256KB Mux requires), then we poll videoAPI
// until Mux has finished preparing the asset.

const CHUNK_SIZE_KB = 50 * 1024;
const POLL_INTERVAL_MS = 2000;

interface PageProps {
	hidden?: boolean;
	id?: string;
	onUploadState?: (state: DropzoneStates) => void;
	onProgress?: (progress: number) => void;
	onFileName?: (name: string) => void;
	onStatus?: (status: MuxUploadStatus) => void;
}

const UploadComponent = (props: PageProps) => {
	const {
		onUploadState = () => {},
		onProgress = () => {},
		onFileName = () => {},
		onStatus = () => {},
		hidden,
		id,
	} = props;

	const [state, setState] = useState<DropzoneStates>("none");
	const [progress, setProgress] = useState<number>(0);
	const pollerRef = useRef<ReturnType<typeof setInterval> | null>(null);
	const uploadRef = useRef<UpChunk.UpChunk | null>(null);

	useEffect(() => {
		onUploadState(state);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [state]);

	useEffect(() => {
		onProgress(progress);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [progress]);

	// Stop uploading and polling if the modal closes mid-way.
	useEffect(
		() => () => {
			if (pollerRef.current) clearInterval(pollerRef.current);
			uploadRef.current?.abort();
		},
		[],
	);

	const pollStatus = (uploadID: string) => {
		if (pollerRef.current) clearInterval(pollerRef.current);
		pollerRef.current = setInterval(async () => {
			const response = await reqGetMuxUploadStatus(uploadID);
			if (!response.success) {
				if (pollerRef.current) clearInterval(pollerRef.current);
				setState("failed");
				return;
			}
			const status = response.data;
			onStatus(status);
			switch (status.status) {
				case "waiting":
					setState("status-checks");
					break;
				case "preparing":
					setState("status-rolling");
					break;
				case "ready":
					if (pollerRef.current) clearInterval(pollerRef.current);
					setState("done");
					break;
				case "errored":
					if (pollerRef.current) clearInterval(pollerRef.current);
					setState("failed");
					break;
			}
		}, POLL_INTERVAL_MS);
	};

	const startUpload = (file: File) => {
		let uploadID = "";

		const upload = UpChunk.createUpload({
			endpoint: async () => {
				const response = await reqCreateMuxUpload();
				if (!response.success) {
					throw new Error(response.error_message || "Failed to create upload");
				}
				uploadID = response.data.id;
				return response.data.url;
			},
			file,
			chunkSize: CHUNK_SIZE_KB,
		});
		uploadRef.current = upload;

		upload.on("progress", (e: CustomEvent<number>) => {
			const pct = Math.round(e.detail);
			setProgress(pct);
			setState(pct >= 100 ? "finishing-up" : "in-progress");
		});

		upload.on("success", () => {
			setState("status-checks");
			pollStatus(uploadID);
		});

		upload.on("error", () => {
			setState("failed");
		});
	};

	const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (!file) return;
		setState("dna");
		onFileName(file.name);
		startUpload(file);
	};

	return (
		<div className={hidden ? "hidden" : ""}>
			<input
				type="file"
				onChange={handleFileChange}
				id={id ? id : "file-upload"}
				name="file-upload"
				accept=".mp4, .m4v, .mov"
				className="sr-only"
			/>
			{state === "in-progress" && <div>Uploading: {progress}%</div>}
			{state === "finishing-up" && <div>Processing...</div>}
			{state === "status-checks" && <div>Checking status...</div>}
			{state === "status-rolling" && <div>Encoding...</div>}
			{state === "done" && <div>Done!</div>}
		</div>
	);
};

export default UploadComponent;

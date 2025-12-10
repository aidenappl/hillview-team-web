export type CloudflareStatus = {
	result: {
		uid: string
		creator: string | null
		thumbnail: string
		thumbnailTimestampPct: number
		readyToStream: boolean
		readyToStreamAt: string | null
		status: {
			state: string
			errorReasonCode: string
			errorReasonText: string
			pctComplete?: string
			step?: string
		}
		meta: {
			filename: string
			filetype: string
			name: string
			type: string
		}
		created: string
		modified: string
		scheduledDeletion: string | null
		size: number
		preview: string
		allowedOrigins: string[]
		requireSignedURLs: boolean
		uploaded: string
		uploadExpiry: string
		maxSizeBytes: number | null
		maxDurationSeconds: number
		duration: number
		input: {
			width: number
			height: number
		}
		playback: {
			hls: string
			dash: string
		}
		watermark: string | null
		clippedFrom: string | null
		publicDetails: {
			title: string
			share_link: string
			channel_link: string
			logo: string
		}
	}
	success: boolean
	errors: any[]
	messages: any[]
}

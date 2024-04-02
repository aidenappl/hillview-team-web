export type CloudflareStatus = {
    result: {
      uid: string
      creator: any
      thumbnail: string
      thumbnailTimestampPct: number
      readyToStream: boolean
      readyToStreamAt: any
      status: {
        state: string
        step: string
        pctComplete: string
        errorReasonCode: string
        errorReasonText: string
      }
      meta: {
        filename: string
        filetype: string
        name: string
        relativePath: string
        type: string
      }
      created: string
      modified: string
      scheduledDeletion: any
      size: number
      preview: string
      allowedOrigins: Array<any>
      requireSignedURLs: boolean
      uploaded: string
      uploadExpiry: string
      maxSizeBytes: any
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
      watermark: any
      clippedFrom: any
      publicDetails: {
        title: string
        share_link: string
        channel_link: string
        logo: string
      }
    }
    success: boolean
    errors: Array<any>
    messages: Array<any>
  }
  
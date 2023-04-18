import { GeneralNSN } from "./GeneralNSN.model"

export interface Video {
    id: number
    uuid: string
    title: string
    description: string
    thumbnail: string
    url: string
    download_url: string;
    allow_downloads: boolean;
    status: GeneralNSN
    inserted_at: string
  }
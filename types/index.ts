type GoogleAuthResponse = {
    access_token: string;
    refresh_token: string;
    user: User;
};

type User = {
    id: number;
    username: string;
    name: string;
    email: string;
    profile_image_url: string;
    authentication: GeneralNSM;
    inserted_at: string;
    last_active: string;
    strategies: Strategies;
};

type Strategies = {
    google_id: string;
    password: any;
};

type GeneralNSM = {
    id: number;
    name: string;
    short_name: string;
};

interface Video {
    id: number;
    uuid: string;
    title: string;
    description: string;
    thumbnail: string;
    url: string;
    download_url: string;
    allow_downloads: boolean;
    views: number;
    downloads: number;
    status: GeneralNSM;
    inserted_at: string;
}

type Spotlight = {
    rank: number;
    video_id: number;
    inserted_at: Date;
    updated_at: Date;
    video: Video;
}

type ApiResponse<T> = ApiSuccess<T> | ApiError;

// Generic success response
type ApiSuccess<T> = {
    success: true;
    status: number;
    message: string;
    data: T;
};

// Generic error response
type ApiError = {
    success: false;
    status: number;
    error: string;
    error_message: string;
    error_code: number;
};


export type { GoogleAuthResponse, User, Video, Spotlight, ApiResponse };

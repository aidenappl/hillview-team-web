// =============================================================================
// Common / Shared Types
// =============================================================================

type GeneralNSM = {
	id: number;
	name: string;
	short_name: string;
	hidden?: boolean;
};

type ApiResponse<T> = ApiSuccess<T> | ApiError;

type ApiSuccess<T> = {
	success: true;
	status: number;
	message: string;
	data: T;
};

type ApiError = {
	success: false;
	status: number;
	error: string;
	error_message: string;
	error_code: number;
};

// =============================================================================
// User
// =============================================================================

type Strategies = {
	google_id: string;
	password: any;
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
	shown_changes_popup: boolean;
};

type UserInput = {
	email: string;
	username: string;
	name: string;
	profile_image_url: string;
	authentication?: number;
};

type UserChanges = Partial<{
	email: string;
	username: string;
	name: string;
	profile_image_url: string;
	authentication: number;
	shown_changes_popup: boolean;
}>;

type UserQueryParams = {
	limit: number;
	offset: number;
};

// =============================================================================
// Google Auth
// =============================================================================

type GoogleAuthResponse = {
	access_token: string;
	refresh_token: string;
	user: User;
};

// =============================================================================
// Video
// =============================================================================

interface VideoCreator {
	id: number;
	name: string;
	email: string;
	profile_image_url: string;
}

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
	creator?: VideoCreator;
	inserted_at: string;
}

type VideoInput = {
	title: string;
	url: string;
	thumbnail: string;
	description: string;
	download_url?: string;
};

type VideoChanges = Partial<{
	title: string;
	description: string;
	url: string;
	thumbnail: string;
	download_url: string;
	status: number;
	allow_downloads: boolean;
}>;

type VideoQueryParams = {
	search?: string;
	limit: number;
	offset: number;
	sort_by?: "date" | "views" | "downloads";
	sort?: "asc" | "desc";
	status?: string; // comma-separated status IDs, e.g. "1,2,3"
	user_id?: number;
};

// =============================================================================
// Spotlight
// =============================================================================

type Spotlight = {
	rank: number;
	video_id: number;
	inserted_at: Date;
	updated_at: Date;
	video: Video;
};

type SpotlightChanges = {
	video_id: number;
	rank: number;
};

type SpotlightQueryParams = {
	limit: number;
	offset: number;
};

// =============================================================================
// Asset
// =============================================================================

type AssetCategory = {
	id: number;
	name: string;
	short_name: string;
};

type AssetStatus = {
	id: number;
	name: string;
	short_name: string;
};

type AssetMetadata = {
	serial_number: string;
	manufacturer: string;
	model: string;
	notes: string;
};

type AssetActiveTab = {
	id: number;
	associated_user: number;
};

type Asset = {
	id: number;
	name: string;
	image_url: string;
	identifier: string;
	description: string;
	category: AssetCategory;
	status: AssetStatus;
	metadata: AssetMetadata;
	active_tab: AssetActiveTab;
	inserted_at: string;
};

type AssetInput = {
	name: string;
	identifier: string;
	description: string;
	category: number;
	image_url: string;
	metadata: {
		serial_number: string;
		manufacturer: string;
		model: string;
		notes?: string;
	};
};

type AssetChanges = Partial<{
	name: string;
	identifier: string;
	description: string;
	status: number;
	category: number;
	image_url: string;
	metadata: Partial<{
		serial_number: string;
		manufacturer: string;
		model: string;
		notes: string;
	}>;
}>;

type AssetQueryParams = {
	limit: number;
	sort: "ASC" | "DESC";
	offset: number;
	search?: string;
};

// =============================================================================
// Checkout
// =============================================================================

type CheckoutUser = {
	id: number;
	name: string;
	email: string;
	identifier: string;
	status: GeneralNSM;
	profile_image_url: string;
	inserted_at: string;
};

type Checkout = {
	id: number;
	user: CheckoutUser;
	associated_user: number;
	asset: Asset;
	asset_id: number;
	offsite: number;
	checkout_status: GeneralNSM;
	checkout_notes: string;
	time_out: string;
	time_in: string;
	expected_in: any;
};

type CheckoutChanges = Partial<{
	check_in: boolean;
	checkout_status: number;
	checkout_notes: string;
	offsite: number;
	expected_in: string;
}>;

type CheckoutQueryParams = {
	limit: number;
	offset: number;
};

// =============================================================================
// Link
// =============================================================================

type LinkCreator = {
	id: number;
	name: string;
	email: string;
	profile_image_url: string;
};

type Link = {
	id: number;
	route: string;
	destination: string;
	active: boolean;
	clicks: number;
	creator: LinkCreator;
	inserted_at: string;
};

type LinkInput = {
	route: string;
	destination: string;
};

type LinkChanges = Partial<{
	route: string;
	destination: string;
	active: boolean;
}>;

type LinkQueryParams = {
	limit: number;
	offset: number;
	search?: string;
	sort?: "asc" | "desc";
	sort_by?: "date" | "clicks";
	active?: boolean; // undefined = all, true = active only, false = archived only
};

// =============================================================================
// Playlist
// =============================================================================

type Playlist = {
	id: number;
	name: string;
	description: string;
	banner_image: string;
	status: GeneralNSM;
	route: string;
	inserted_at: string;
	videos?: Video[];
};

type PlaylistInput = {
	name: string;
	route: string;
	description: string;
	videos: number[];
	banner_image: string;
};

type PlaylistChanges = Partial<{
	name: string;
	route: string;
	description: string;
	videos: number[];
	banner_image: string;
	status: number;
	add_videos: number[];
	remove_videos: number[];
}>;

type PlaylistQueryParams = {
	search?: string;
	limit: number;
	offset: number;
	sort_by?: "date";
	sort?: "asc" | "desc";
	status?: string; // comma-separated status IDs, e.g. "1,3"
};

// =============================================================================
// MobileUser
// =============================================================================

type MobileUser = {
	id: number;
	name: string;
	email: string;
	identifier: string;
	profile_image_url: string;
	status: GeneralNSM;
	inserted_at: string;
};

type MobileUserInput = {
	email: string;
	name: string;
	profile_image_url: string;
	identifier: string;
};

type MobileUserChanges = Partial<{
	email: string;
	name: string;
	profile_image_url: string;
	identifier: string;
	status: number;
}>;

type MobileUserQueryParams = {
	limit: number;
	offset: number;
};

// =============================================================================
// Cloudflare Status
// =============================================================================

type CloudflareStatus = {
	result: {
		uid: string;
		creator: string | null;
		thumbnail: string;
		thumbnailTimestampPct: number;
		readyToStream: boolean;
		readyToStreamAt: string | null;
		status: {
			state: string;
			errorReasonCode: string;
			errorReasonText: string;
			pctComplete?: string;
			step?: string;
		};
		meta: {
			filename: string;
			filetype: string;
			name: string;
			type: string;
		};
		created: string;
		modified: string;
		scheduledDeletion: string | null;
		size: number;
		preview: string;
		allowedOrigins: string[];
		requireSignedURLs: boolean;
		uploaded: string;
		uploadExpiry: string;
		maxSizeBytes: number | null;
		maxDurationSeconds: number;
		duration: number;
		input: {
			width: number;
			height: number;
		};
		playback: {
			hls: string;
			dash: string;
		};
		watermark: string | null;
		clippedFrom: string | null;
		publicDetails: {
			title: string;
			share_link: string;
			channel_link: string;
			logo: string;
		};
	};
	success: boolean;
	errors: any[];
	messages: any[];
};

// =============================================================================
// Download URL
// =============================================================================

type DownloadUrlParams = {
	id: number | string;
};

// =============================================================================
// Exports
// =============================================================================

export type {
	// Common
	GeneralNSM,
	ApiResponse,
	ApiSuccess,
	ApiError,

	// Auth
	GoogleAuthResponse,
	Strategies,

	// User
	User,
	UserInput,
	UserChanges,
	UserQueryParams,

	// Video
	Video,
	VideoInput,
	VideoChanges,
	VideoQueryParams,

	// Spotlight
	Spotlight,
	SpotlightChanges,
	SpotlightQueryParams,

	// Asset
	Asset,
	AssetCategory,
	AssetStatus,
	AssetMetadata,
	AssetActiveTab,
	AssetInput,
	AssetChanges,
	AssetQueryParams,

	// Checkout
	Checkout,
	CheckoutUser,
	CheckoutChanges,
	CheckoutQueryParams,

	// Link
	Link,
	LinkCreator,
	LinkInput,
	LinkChanges,
	LinkQueryParams,

	// Playlist
	Playlist,
	PlaylistInput,
	PlaylistChanges,
	PlaylistQueryParams,

	// MobileUser
	MobileUser,
	MobileUserInput,
	MobileUserChanges,
	MobileUserQueryParams,

	// Cloudflare
	CloudflareStatus,

	// Download
	DownloadUrlParams,
};

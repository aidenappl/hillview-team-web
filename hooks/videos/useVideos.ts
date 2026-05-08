import { useCallback, useRef, useState } from "react";
import toast from "react-hot-toast";
import { reqGetVideos } from "../../services/api/video.service";
import { Video } from "../../types";

const PAGE_SIZE = 20;

export type VideoSortBy = "date" | "views" | "downloads";
export type VideoSortDir = "asc" | "desc";

export const useVideos = () => {
	const [videos, setVideos] = useState<Video[] | null>(null);
	const [offset, setOffset] = useState(0);
	const [loadingMore, setLoadingMore] = useState(false);

	// Sort + filter state
	const [search, setSearch] = useState("");
	const [sortBy, setSortBy] = useState<VideoSortBy>("date");
	const [sortDir, setSortDir] = useState<VideoSortDir>("desc");
	const [activeStatuses, setActiveStatuses] = useState<number[]>([]);
	const [creatorUserId, setCreatorUserId] = useState<number | null>(null);

	const fetchingRef = useRef(false);

	const initialize = useCallback(async () => {
		if (fetchingRef.current) return;
		fetchingRef.current = true;
		setVideos(null);
		setOffset(0);
		try {
			const response = await reqGetVideos({
				limit: PAGE_SIZE,
				offset: 0,
				...(search.trim() && { search: search.trim() }),
				sort_by: sortBy,
				sort: sortDir,
				...(activeStatuses.length > 0 && { status: activeStatuses.join(",") }),
				...(creatorUserId !== null && { user_id: creatorUserId }),
			});
			if (response.success) {
				setVideos(response.data ?? []);
			} else {
				setVideos([]);
				toast.error("Failed to load videos");
			}
		} catch {
			setVideos([]);
			toast.error("Failed to load videos");
		} finally {
			fetchingRef.current = false;
		}
	}, [search, sortBy, sortDir, activeStatuses, creatorUserId]); // eslint-disable-line react-hooks/exhaustive-deps

	const searchVideos = useCallback(async (query: string): Promise<Video[]> => {
		try {
			const response = await reqGetVideos({ limit: 12, offset: 0, search: query });
			if (response.success) return response.data;
			return [];
		} catch {
			return [];
		}
	}, []);

	const loadMore = useCallback(async () => {
		if (fetchingRef.current) return;
		fetchingRef.current = true;
		setLoadingMore(true);
		try {
			const newOffset = offset + PAGE_SIZE;
			const response = await reqGetVideos({
				limit: PAGE_SIZE,
				offset: newOffset,
				...(search.trim() && { search: search.trim() }),
				sort_by: sortBy,
				sort: sortDir,
				...(activeStatuses.length > 0 && { status: activeStatuses.join(",") }),
				...(creatorUserId !== null && { user_id: creatorUserId }),
			});
			if (response.success) {
				setVideos((prev) => [...(prev ?? []), ...(response.data ?? [])]);
				setOffset(newOffset);
			} else {
				toast.error("Failed to load more videos");
			}
		} catch {
			toast.error("Failed to load more videos");
		} finally {
			setLoadingMore(false);
			fetchingRef.current = false;
		}
	}, [offset, search, sortBy, sortDir, activeStatuses, creatorUserId]); // eslint-disable-line react-hooks/exhaustive-deps

	return {
		videos,
		initialize,
		loadMore,
		searchVideos,
		loadingMore,
		search,
		setSearch,
		sortBy,
		setSortBy,
		sortDir,
		setSortDir,
		activeStatuses,
		setActiveStatuses,
		creatorUserId,
		setCreatorUserId,
	};
};

import { useCallback, useRef, useState } from "react";
import { QueryVideos } from "../QueryVideos";
import { Video } from "../../types";

const PAGE_SIZE = 20;

export const useVideos = () => {
	const [videos, setVideos] = useState<Video[] | null>(null);
	const [offset, setOffset] = useState(0);
	const [loadingMore, setLoadingMore] = useState(false);
	const fetchingRef = useRef(false); // prevents double fetches

	const initialize = useCallback(async () => {
		if (fetchingRef.current) return;
		fetchingRef.current = true;
		setVideos(null);
		setOffset(0);
		const response = await QueryVideos({ limit: PAGE_SIZE, offset: 0 });
		if (response.success) setVideos(response.data);
		fetchingRef.current = false;
	}, []);

	const searchVideos = useCallback(async (search: string): Promise<Video[]> => {
		const response = await QueryVideos({limit: 5, offset: 0, search})
		if (response.success) return response.data
		return []
	}, [])

	const loadMore = useCallback(async () => {
		if (fetchingRef.current) return;
		fetchingRef.current = true;
		setLoadingMore(true);
		const newOffset = offset + PAGE_SIZE;
		const response = await QueryVideos({ limit: PAGE_SIZE, offset: newOffset });
		if (response.success) {
			setVideos((prev) => [...(prev ?? []), ...response.data]);
			setOffset(newOffset);
		}
		setLoadingMore(false);
		fetchingRef.current = false;
	}, [offset]);

	return { videos, initialize, loadMore, searchVideos, loadingMore };
};

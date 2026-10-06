import { useQuery } from "@tanstack/react-query";
import type { User } from "../types/user";
import { getCurrentUser } from "../api/userApi.ts";

// 현재 로그인중인 유저 정보를 조회/캐시 공유하는 훅
// queryKey가 "currentUser"로 동일하기만 하면, 이 훅을 부르는 모든 컴포넌트가 같은 캐시를 공유함
// (한 컴포넌트가 이미 불러온 상태면, 다른 컴포넌트는 재요청 없이 캐시된 값을 바로 받음)
export function useCurrentUser() {
    return useQuery<User>({
        queryKey: ["currentUser"],
        queryFn: getCurrentUser,
        refetchInterval: 5 * 60 * 1000, // 5분마다 백그라운드에서 자동 재요청
    });
}

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import useIntersectionObserver from "@/hooks/useIntersectionObserver";
import { ReactNode } from "react";

interface SelectHistoryProps<T> {
  value?: string;
  items: T[];
  placeholder: string;
  triggerClassName?: string;
  contentClassName?: string;
  isLoading?: boolean;
  onOpenChange?: (open: boolean) => void;
  onValueChange: (value: string) => void;
  renderItem: (item: T) => ReactNode;
  getItemValue: (item: T) => string;
  emptyMessage?: string;
  prependItems?: ReactNode;
  onReachEnd?: () => void;
  hasMore?: boolean;
}

export default function SelectHistory<T>({
  value,
  items,
  placeholder,
  triggerClassName,
  contentClassName,
  isLoading = false,
  onOpenChange,
  onValueChange,
  renderItem,
  getItemValue,
  emptyMessage = "기록 없음",
  prependItems,
  onReachEnd,
  hasMore = false,
}: SelectHistoryProps<T>) {
  const setObserverTarget = useIntersectionObserver({
    onIntersect: () => {
      if (hasMore && onReachEnd) onReachEnd();
    },
    enabled: hasMore,
  });

  return (
    <Select value={value} onOpenChange={onOpenChange} onValueChange={onValueChange}>
      <SelectTrigger className={triggerClassName}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent className={contentClassName}>
        {isLoading && items.length === 0 ? (
          <div className="text-center text-sm text-gray-500 py-2">로딩 중...</div>
        ) : (
          <>
            {prependItems}
            {items.length === 0 && !prependItems ? (
              <div className="text-center text-sm text-gray-500 py-2">{emptyMessage}</div>
            ) : (
              items.map((item) => (
                <SelectItem key={getItemValue(item)} value={getItemValue(item)} className="cursor-pointer">
                  {renderItem(item)}
                </SelectItem>
              ))
            )}
            {/* Observer Target */}
            {hasMore && (
              <div
                ref={setObserverTarget}
                className="h-8 w-full flex justify-center items-center py-2 text-xs text-gray-400"
              >
                {isLoading ? "로딩 중..." : "더 불러오기"}
              </div>
            )}
          </>
        )}
      </SelectContent>
    </Select>
  );
}

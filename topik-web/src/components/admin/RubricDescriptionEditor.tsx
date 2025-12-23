import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Plus, X, List, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface RubricDescriptionEditorProps {
  value: string;
  onChange: (newValue: string) => void;
  className?: string;
  type?: "evaluator" | "corrector"; // 타입 추가
}

export function RubricDescriptionEditor({
  value,
  onChange,
  className,
  type = "evaluator",
}: RubricDescriptionEditorProps) {
  // 내부 상태 관리 (불필요한 리렌더링 및 커서 튐 방지)
  const [intro, setIntro] = useState("");
  const [items, setItems] = useState<string[]>([]);
  const isInternalChange = useRef(false);

  // UI 텍스트 설정
  const labels = {
    intro: type === "evaluator" ? "기본 평가 기준 (개요)" : "첨삭 가이드 개요",
    items: type === "evaluator" ? "세부 감점/평가 항목 (자동 번호 매김)" : "세부 수정 지침 (자동 번호 매김)",
    introPlaceholder:
      type === "evaluator"
        ? "예: 기본 점수에서 감점 방식으로 평가함."
        : "예: 학생의 의도를 해치지 않는 범위 내에서 수정함.",
    itemPlaceholder: type === "evaluator" ? "세부 평가 기준 입력" : "구체적인 첨삭 방법 입력",
  };

  // 1. [Load] 초기값 파싱
  useEffect(() => {
    if (isInternalChange.current) {
      isInternalChange.current = false;
      return;
    }

    if (!value) {
      setIntro("");
      setItems([]);
      return;
    }

    // \n 기준으로 분리
    const lines = value.split("\n");
    let tempIntro = "";
    let tempItems: string[] = [];

    // 파싱 로직: 첫 줄이 번호(숫자.)로 시작하지 않으면 Intro로 간주
    if (lines.length > 0 && !/^\d+\./.test(lines[0])) {
      tempIntro = lines[0];
      // 나머지 줄에서 번호 패턴(1. ) 제거하고 내용만 추출
      tempItems = lines.slice(1).map((line) => line.replace(/^\d+\.\s*/, ""));
    } else {
      // Intro 없이 바로 리스트인 경우
      tempItems = lines.map((line) => line.replace(/^\d+\.\s*/, ""));
    }

    setIntro(tempIntro);
    setItems(tempItems);
  }, [value]);

  // 2. [Save] 부모에게 변경 사항 전달 (Re-formatting)
  const updateParent = (newIntro: string, newItems: string[]) => {
    isInternalChange.current = true;
    let result = newIntro.trim();

    if (newItems.length > 0) {
      // 빈 항목 필터링 (선택 사항: 여기서는 유지하되 저장 시 제외할 수도 있음)
      const validItems = newItems;

      const listString = validItems
        .map((item, index) => `${index + 1}. ${item}`) // 번호 자동 생성 (trim 제거하여 의도적 공백 유지 가능하게 함)
        .join("\n");

      result = result ? `${result}\n${listString}` : listString;
    }

    onChange(result);
  };

  // 핸들러
  const handleIntroChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newIntro = e.target.value;
    setIntro(newIntro);
    updateParent(newIntro, items);
  };

  const handleItemChange = (idx: number, val: string) => {
    const newItems = [...items];
    newItems[idx] = val;
    setItems(newItems);
    updateParent(intro, newItems);
  };

  const addItem = () => {
    const newItems = [...items, ""];
    setItems(newItems);
    updateParent(intro, newItems);
  };

  const removeItem = (idx: number) => {
    const newItems = items.filter((_, i) => i !== idx);
    setItems(newItems);
    updateParent(intro, newItems);
  };

  return (
    <div className={cn("space-y-3 rounded-lg border border-slate-200 bg-slate-50 p-3", className)}>
      {/* 1. 개요 설명 (Intro) */}
      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-slate-500 flex items-center gap-1">
          <AlertCircle size={12} /> {labels.intro}
        </label>
        <Textarea
          value={intro}
          onChange={handleIntroChange}
          placeholder={labels.introPlaceholder}
          className="bg-white min-h-10 text-xs! py-0.5 px-1.5 resize-none focus-visible:ring-1"
          rows={intro.split("\n").length > 1 ? 3 : 1}
        />
      </div>

      {/* 2. 세부 항목 리스트 (Items) */}
      <div className="space-y-2 pt-2 border-t border-slate-200/60">
        <label className="text-xs font-semibold text-slate-500 flex items-center gap-1 mb-2">
          <List size={12} /> {labels.items}
        </label>

        <div className="space-y-2">
          {items.map((item, idx) => (
            <div key={idx} className="flex gap-2 items-start group">
              <div className="mt-2 w-5 h-5 flex items-center justify-center rounded-full bg-slate-200 text-[10px] font-bold text-slate-600 shrink-0 select-none">
                {idx + 1}
              </div>
              <Textarea
                value={item}
                onChange={(e) => handleItemChange(idx, e.target.value)}
                placeholder={labels.itemPlaceholder}
                className="bg-white min-h-10 text-[10px]! p-1 resize-y focus-visible:ring-1 flex-1"
                rows={1}
              />
              <Button
                variant="ghost"
                size="icon"
                onClick={() => removeItem(idx)}
                className="mt-0.5 w-8 h-8 shrink-0 text-slate-400 hover:text-red-500 hover:bg-red-50 opacity-50 group-hover:opacity-100 transition-opacity"
                tabIndex={-1}
              >
                <X size={14} />
              </Button>
            </div>
          ))}
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={addItem}
          className="w-full mt-2 border-dashed text-slate-500 hover:text-slate-700 hover:bg-slate-100 h-8 text-xs"
        >
          <Plus size={12} className="mr-1" /> 항목 추가
        </Button>
      </div>
    </div>
  );
}

import { QuestionContent } from "@/types/question.types";
import { STOAGE_URL } from "@/config/shared";
import Image from "next/image";
import tw from "tailwind-styled-components";

interface QuestionContextProps {
  content: QuestionContent["context"];
  year: number;
  round: number;
  questionNumber: number;
}

export default function QuestionContext({ content, year, round, questionNumber }: QuestionContextProps) {
  // 이미지가 있는 경우 (주로 53번)
  if (content.images) {
    const images = Array.isArray(content.images) ? content.images : [content.images];
    return (
      <div className="flex flex-col gap-4 border border-[#B4B4B4] p-7">
        {images.map((img, idx) => (
          <div key={idx} className="flex flex-col items-center">
            <Image
              src={`${STOAGE_URL}/images/${year}/${round}/${questionNumber}/${img.url}`}
              width={500}
              height={500}
              className="w-full h-auto"
              alt={img.alt || `${questionNumber}번 문제 이미지`}
            />
            {img.caption && <span className="text-sm text-gray-500 mt-1">{img.caption}</span>}
          </div>
        ))}
      </div>
    );
  }

  // 텍스트만 있는 경우 (51, 52, 54번 등)
  return <QuestionContextContainer>{content.content}</QuestionContextContainer>;
}

const QuestionContextContainer = tw.div`flex flex-col border border-[#B4B4B4] p-7 whitespace-pre-wrap leading-relaxed`;

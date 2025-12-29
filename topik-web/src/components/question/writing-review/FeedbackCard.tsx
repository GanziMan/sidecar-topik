import { Card } from "@/components/ui/card";

interface FeedbackCardProps {
  title: string;
  contents: string[] | string;
}

export default function FeedbackCard({ title, contents }: FeedbackCardProps) {
  return (
    <Card className="p-5 bg-[#F7F7F7] flex flex-col gap-[14px] w-[513px] whitespace-pre-line">
      <p className="font-semibold">{title}</p>
      {Array.isArray(contents) && contents.length > 0 ? (
        <ul className="list-none list-inside ps-2">
          {contents.map((content, index) => (
            <li key={`${title}-${index}`} className="text-sm">
              {"•"} {content}
            </li>
          ))}
        </ul>
      ) : (
        <p>{contents}</p>
      )}
    </Card>
  );
}

import { QuestionType } from "@/types/common.types";
import { useState } from "react";

type SentenceAnswerForm = {
  type: "sentence";
  data: {
    answer1: string;
    answer2: string;
  };
  onChange: (e: React.ChangeEvent<HTMLInputElement>, symbol: string) => void;
  setValue?: (value: { answer1: string; answer2: string }) => void;
  reset: () => void;
};

type EssayAnswerForm = {
  type: "essay";
  data: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  setValue?: (value: string) => void;
  reset: () => void;
};

type AnswerForm = SentenceAnswerForm | EssayAnswerForm;

export default function useAnswerForm(type: QuestionType): AnswerForm {
  const isSentenceCompletion = type === QuestionType.Q51 || type === QuestionType.Q52;

  const [sentenceAnswer, setSentenceAnswer] = useState({
    answer1: "",
    answer2: "",
  });
  const [essayAnswer, setEssayAnswer] = useState("");

  const reset = () => {
    setSentenceAnswer({
      answer1: "",
      answer2: "",
    });
    setEssayAnswer("");
  };

  if (isSentenceCompletion) {
    return {
      type: "sentence",
      data: sentenceAnswer,
      onChange: (e, symbol) =>
        setSentenceAnswer((prev) => ({ ...prev, [symbol === "ㄱ" ? "answer1" : "answer2"]: e.target.value })),
      setValue: (value) => setSentenceAnswer(value),
      reset,
    };
  }
  return {
    type: "essay",
    data: essayAnswer,
    onChange: (e) => setEssayAnswer(e.target.value),
    setValue: (value) => setEssayAnswer(value),
    reset,
  };
}

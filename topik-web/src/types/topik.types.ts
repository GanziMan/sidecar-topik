export enum LlmMessageRole {
  USER = "user",
  MODEL = "model",
}

export enum QuestionType {
  Q51 = "51",
  Q52 = "52",
  Q53 = "53",
  Q54 = "54",
}

export interface TopikWritingEventPart {
  text: string;
}

export interface TopikWritingEventContent {
  parts: TopikWritingEventPart[];
  role: LlmMessageRole.MODEL;
}

export interface TopikWritingEvent {
  id: string;
  timestamp: number;
  author: string;
  content: TopikWritingEventContent;
  finishReason: "STOP" | string;
}

export type AgentUserMessagePart = { text: string };

export type TopikWritingAgentRequest = {
  app_name: string;
  user_id: string;
  session_id: string;
  stream?: boolean;
  new_message: {
    parts: AgentUserMessagePart[];
    role: LlmMessageRole.USER;
  };
};

export type TopikWritingAgentResponse = TopikWritingEvent[];

// Error Related Types
export type ErrorResponse = {
  error: string;
  code?: string;
  details?: string;
};

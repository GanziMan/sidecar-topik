import { createClient } from "@/supabase/server";
import { DB_TABLES } from "@/config/db.config";
import { Json } from "@/types/supabase";
import { PromptContent } from "@/lib/serverActions/agent";

export interface PromptEntity {
  id: string;
  prompt_key: string;
  content: PromptContent;
  version: number;
  created_at: string;
  updated_at: string;
  updated_by: string | null;
}

export interface PromptHistoryEntity {
  id: string;
  prompt_id: string;
  content: PromptContent;
  version: number;
  created_at: string;
  created_by: string | null;
}

export const PromptRepository = {
  async findByKey(promptKey: string): Promise<PromptEntity | null> {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from(DB_TABLES.PROMPTS)
      .select("*")
      .eq("prompt_key", promptKey)
      .maybeSingle();

    if (error) throw error;
    return data;
  },

  async createHistory(params: { promptId: string; content: PromptContent; version: number; createdBy?: string }) {
    const supabase = await createClient();

    const { error } = await supabase.from(DB_TABLES.PROMPT_HISTORY).insert({
      prompt_id: params.promptId,
      content: params.content as unknown as Json,
      version: params.version,
      created_by: params.createdBy,
    });

    if (error) throw error;
  },

  async updatePrompt(
    id: string,
    params: {
      content: PromptContent;
      version: number;
      updatedBy?: string;
    }
  ) {
    const supabase = await createClient();

    const { error } = await supabase
      .from(DB_TABLES.PROMPTS)
      .update({
        content: params.content as unknown as Json,
        version: params.version,
        updated_at: new Date().toISOString(),
        updated_by: params.updatedBy,
      })
      .eq("id", id);

    if (error) throw error;
  },

  async createPrompt(params: {
    promptKey: string;
    content: PromptContent;
    version: number;
    updatedBy?: string;
  }): Promise<PromptEntity> {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from(DB_TABLES.PROMPTS)
      .insert({
        prompt_key: params.promptKey,
        content: params.content as unknown as Json,
        version: params.version,
        updated_by: params.updatedBy,
      })
      .select("*")
      .single();

    if (error) throw error;
    return data;
  },

  async findHistoryByKey(promptKey: string): Promise<PromptHistoryEntity[]> {
    const supabase = await createClient();

    const prompt = await this.findByKey(promptKey);
    if (!prompt) return [];

    const { data, error } = await supabase
      .from(DB_TABLES.PROMPT_HISTORY)
      .select("*")
      .eq("prompt_id", prompt.id)
      .order("version", { ascending: false });

    if (error) throw error;
    return (data as PromptHistoryEntity[]) || [];
  },
};

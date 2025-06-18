
import { z } from 'zod';

// Enums
export const triggerTypeSchema = z.enum(['SCHEDULED', 'WEBHOOK']);
export const scheduleIntervalSchema = z.enum(['HOURLY', 'DAILY', 'WEEKLY']);

export type TriggerType = z.infer<typeof triggerTypeSchema>;
export type ScheduleInterval = z.infer<typeof scheduleIntervalSchema>;

// PromptTemplate schema
export const promptTemplateSchema = z.object({
  id: z.number(),
  name: z.string(),
  prompt_content: z.string(),
  openai_model: z.string(),
  temperature: z.number(),
  max_tokens: z.number(),
  trigger_type: triggerTypeSchema,
  schedule_interval: scheduleIntervalSchema.nullable(),
  incoming_webhook_url: z.string().nullable(),
  destination_webhook_url: z.string(),
  created_at: z.coerce.date(),
  updated_at: z.coerce.date()
});

export type PromptTemplate = z.infer<typeof promptTemplateSchema>;

// Input schema for creating prompt templates
export const createPromptTemplateInputSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  prompt_content: z.string().min(1, 'Prompt content is required'),
  openai_model: z.string().default('gpt-3.5-turbo'),
  temperature: z.number().min(0).max(2).default(0.7),
  max_tokens: z.number().int().positive().default(1000),
  trigger_type: triggerTypeSchema,
  schedule_interval: scheduleIntervalSchema.nullable().optional(),
  destination_webhook_url: z.string().url('Must be a valid URL')
}).refine((data) => {
  // If trigger type is SCHEDULED, schedule_interval must be provided
  if (data.trigger_type === 'SCHEDULED') {
    return data.schedule_interval !== null && data.schedule_interval !== undefined;
  }
  return true;
}, {
  message: 'Schedule interval is required when trigger type is SCHEDULED',
  path: ['schedule_interval']
});

export type CreatePromptTemplateInput = z.infer<typeof createPromptTemplateInputSchema>;

// Input schema for updating prompt templates
export const updatePromptTemplateInputSchema = z.object({
  id: z.number(),
  name: z.string().min(1, 'Name is required').optional(),
  prompt_content: z.string().min(1, 'Prompt content is required').optional(),
  openai_model: z.string().optional(),
  temperature: z.number().min(0).max(2).optional(),
  max_tokens: z.number().int().positive().optional(),
  trigger_type: triggerTypeSchema.optional(),
  schedule_interval: scheduleIntervalSchema.nullable().optional(),
  destination_webhook_url: z.string().url('Must be a valid URL').optional()
}).refine((data) => {
  // If trigger type is being updated to SCHEDULED, schedule_interval must be provided
  if (data.trigger_type === 'SCHEDULED') {
    return data.schedule_interval !== null && data.schedule_interval !== undefined;
  }
  return true;
}, {
  message: 'Schedule interval is required when trigger type is SCHEDULED',
  path: ['schedule_interval']
});

export type UpdatePromptTemplateInput = z.infer<typeof updatePromptTemplateInputSchema>;

// Schema for webhook payload processing
export const webhookPayloadSchema = z.record(z.any());
export type WebhookPayload = z.infer<typeof webhookPayloadSchema>;

// Schema for OpenAI API response
export const openaiResponseSchema = z.object({
  id: z.string(),
  object: z.string(),
  created: z.number(),
  model: z.string(),
  choices: z.array(z.object({
    index: z.number(),
    message: z.object({
      role: z.string(),
      content: z.string()
    }),
    finish_reason: z.string()
  })),
  usage: z.object({
    prompt_tokens: z.number(),
    completion_tokens: z.number(),
    total_tokens: z.number()
  })
});

export type OpenAIResponse = z.infer<typeof openaiResponseSchema>;

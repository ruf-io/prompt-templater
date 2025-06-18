
import { initTRPC } from '@trpc/server';
import { createHTTPServer } from '@trpc/server/adapters/standalone';
import 'dotenv/config';
import cors from 'cors';
import superjson from 'superjson';
import { z } from 'zod';

// Import schemas
import { 
  createPromptTemplateInputSchema, 
  updatePromptTemplateInputSchema,
  webhookPayloadSchema
} from './schema';

// Import handlers
import { createPromptTemplate } from './handlers/create_prompt_template';
import { getPromptTemplates } from './handlers/get_prompt_templates';
import { getPromptTemplate } from './handlers/get_prompt_template';
import { updatePromptTemplate } from './handlers/update_prompt_template';
import { deletePromptTemplate } from './handlers/delete_prompt_template';
import { processWebhook } from './handlers/process_webhook';
import { executeScheduledTemplate } from './handlers/execute_scheduled_template';

const t = initTRPC.create({
  transformer: superjson,
});

const publicProcedure = t.procedure;
const router = t.router;

const appRouter = router({
  healthcheck: publicProcedure.query(() => {
    return { status: 'ok', timestamp: new Date().toISOString() };
  }),

  // Prompt Template CRUD operations
  createPromptTemplate: publicProcedure
    .input(createPromptTemplateInputSchema)
    .mutation(({ input }) => createPromptTemplate(input)),

  getPromptTemplates: publicProcedure
    .query(() => getPromptTemplates()),

  getPromptTemplate: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(({ input }) => getPromptTemplate(input.id)),

  updatePromptTemplate: publicProcedure
    .input(updatePromptTemplateInputSchema)
    .mutation(({ input }) => updatePromptTemplate(input)),

  deletePromptTemplate: publicProcedure
    .input(z.object({ id: z.number() }))
    .mutation(({ input }) => deletePromptTemplate(input.id)),

  // Webhook processing
  processWebhook: publicProcedure
    .input(z.object({
      webhookUrl: z.string(),
      payload: webhookPayloadSchema
    }))
    .mutation(({ input }) => processWebhook(input.webhookUrl, input.payload)),

  // Scheduled execution
  executeScheduledTemplate: publicProcedure
    .input(z.object({ templateId: z.number() }))
    .mutation(({ input }) => executeScheduledTemplate(input.templateId))
});

export type AppRouter = typeof appRouter;

async function start() {
  const port = process.env['SERVER_PORT'] || 2022;
  const server = createHTTPServer({
    middleware: (req, res, next) => {
      cors()(req, res, next);
    },
    router: appRouter,
    createContext() {
      return {};
    },
  });
  server.listen(port);
  console.log(`TRPC server listening at port: ${port}`);
}

start();

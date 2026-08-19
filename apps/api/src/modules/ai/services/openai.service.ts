import { Injectable, Logger, ServiceUnavailableException } from '@nestjs/common';
import OpenAI from 'openai';
import { Response } from 'express';

@Injectable()
export class OpenAIService {
  private readonly logger = new Logger(OpenAIService.name);
  private readonly client: OpenAI;
  private readonly model: string;
  private readonly maxTokens: number;
  private readonly temperature: number;

  constructor() {
    // Ollama implements the OpenAI-compatible Chat Completions API locally.
    // A hosted OpenAI-compatible provider can be selected later via environment variables.
    this.client = new OpenAI({
      apiKey: process.env.AI_API_KEY || 'ollama',
      baseURL: process.env.AI_BASE_URL || 'http://localhost:11434/v1',
      timeout: 60000,
      maxRetries: 2,
    });
    this.model = process.env.AI_MODEL || 'qwen3:4b';
    this.maxTokens = parseInt(process.env.AI_MAX_TOKENS || '4096', 10);
    this.temperature = parseFloat(process.env.AI_TEMPERATURE || '0.7');
  }

  async chat(
    messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }>,
  ): Promise<string> {
    try {
      const response = await this.client.chat.completions.create({
        model: this.model,
        messages,
        max_tokens: this.maxTokens,
        temperature: this.temperature,
      });
      return response.choices[0]?.message?.content || '';
    } catch (error) {
      this.logger.error('OpenAI chat error', error);
      throw new ServiceUnavailableException('AI service temporarily unavailable');
    }
  }

  async chatJSON(
    messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }>,
  ): Promise<unknown> {
    try {
      return await this.requestJSON(messages, true);
    } catch (error) {
      const providerError = this.describeProviderError(error);
      this.logger.warn(`Structured AI request failed with JSON mode (${providerError}); retrying without response_format`);

      try {
        return await this.requestJSON(messages, false);
      } catch (retryError) {
        this.logger.error(`Structured AI request failed after fallback (${this.describeProviderError(retryError)})`);
        throw new ServiceUnavailableException('AI service temporarily unavailable. Check the configured AI provider, model, and API key.');
      }
    }
  }

  private async requestJSON(
    messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }>,
    useJsonMode: boolean,
  ): Promise<unknown> {
    const response = await this.client.chat.completions.create({
      model: this.model,
      messages,
      max_tokens: this.maxTokens,
      temperature: this.temperature,
      ...(useJsonMode ? { response_format: { type: 'json_object' as const } } : {}),
    });
    const content = response.choices[0]?.message?.content || '';
    if (!content.trim()) throw new Error('AI provider returned an empty structured response');
    return JSON.parse(content);
  }

  private describeProviderError(error: unknown): string {
    if (error instanceof OpenAI.APIError) {
      return `${error.status || 'unknown'} ${error.code || error.name}: ${error.message}`;
    }
    return error instanceof Error ? error.message : 'unknown provider error';
  }

  async streamChat(
    messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }>,
    res: Response,
    onComplete: (fullContent: string) => Promise<void>,
  ): Promise<void> {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no');

    let fullContent = '';

    try {
      const stream = await this.client.chat.completions.create({
        model: this.model,
        messages,
        max_tokens: this.maxTokens,
        temperature: this.temperature,
        stream: true,
      });

      for await (const chunk of stream) {
        const delta = chunk.choices[0]?.delta?.content || '';
        if (delta) {
          fullContent += delta;
          res.write(`data: ${JSON.stringify({ delta })}\n\n`);
        }
      }

      await onComplete(fullContent);
      res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
      res.end();
    } catch (error) {
      this.logger.error('OpenAI stream error', error);
      res.write(`data: ${JSON.stringify({ error: 'AI service error' })}\n\n`);
      res.end();
    }
  }
}

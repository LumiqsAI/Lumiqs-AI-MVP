import { BadRequestException, Injectable, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

type SearchItem = { title?: string; link?: string; snippet?: string };

@Injectable()
export class BusinessDiscoveryService {
  constructor(private readonly config: ConfigService) {}

  async discover(name: string, website: string) {
    const url = this.parsePublicUrl(website);
    const [site, searchResults] = await Promise.all([
      this.inspectSite(url),
      this.searchGoogle(name, url.hostname),
    ]);
    return {
      candidate: { name, website: url.origin, domain: url.hostname },
      site,
      searchResults,
      confirmationRequired: true,
      notice: 'Public information can be incomplete or belong to a similarly named business. Confirm it before using it in Lumiqs.',
    };
  }

  private parsePublicUrl(value: string): URL {
    let url: URL;
    try { url = new URL(value); } catch { throw new BadRequestException('Enter a valid website URL.'); }
    if (!['http:', 'https:'].includes(url.protocol) || this.isPrivateHost(url.hostname)) {
      throw new BadRequestException('Enter a public HTTP or HTTPS website URL.');
    }
    return url;
  }

  private isPrivateHost(host: string): boolean {
    const normalized = host.toLowerCase();
    return normalized === 'localhost' || normalized.endsWith('.local') ||
      /^127\./.test(normalized) || /^10\./.test(normalized) || /^192\.168\./.test(normalized) ||
      /^172\.(1[6-9]|2\d|3[0-1])\./.test(normalized) || normalized === '::1';
  }

  private async inspectSite(url: URL) {
    let response: Response;
    try {
      response = await fetch(url, {
        redirect: 'follow',
        signal: AbortSignal.timeout(8_000),
        headers: { 'User-Agent': 'LumiqsBusinessVerifier/1.0 (+https://lumiqs.ai)' },
      });
    } catch {
      throw new ServiceUnavailableException('We could not reach that website. Check the URL and try again.');
    }
    if (!response.ok) throw new ServiceUnavailableException(`The website returned ${response.status}.`);
    const html = (await response.text()).slice(0, 1_000_000);
    const title = this.match(html, /<title[^>]*>([\s\S]*?)<\/title>/i);
    const description = this.meta(html, 'description');
    const canonical = this.match(html, /<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']+)/i)
      || this.match(html, /<link[^>]+href=["']([^"']+)["'][^>]+rel=["']canonical/i);
    const headings = [...html.matchAll(/<h1[^>]*>([\s\S]*?)<\/h1>/gi)].map((m) => this.clean(m[1])).filter(Boolean).slice(0, 3);
    const socialProfiles = this.socialLinks(html);
    const seoChecks = [
      { label: 'Page title', passed: Boolean(title), detail: title || 'Missing' },
      { label: 'Meta description', passed: Boolean(description), detail: description || 'Missing' },
      { label: 'Primary heading', passed: headings.length > 0, detail: headings[0] || 'Missing' },
      { label: 'Canonical URL', passed: Boolean(canonical), detail: canonical || 'Missing' },
      { label: 'Open Graph title', passed: Boolean(this.meta(html, 'og:title')), detail: this.meta(html, 'og:title') || 'Missing' },
    ];
    const score = Math.round((seoChecks.filter((check) => check.passed).length / seoChecks.length) * 100);
    return { finalUrl: response.url, title, description, headings, canonical, socialProfiles, seo: { score, checks: seoChecks } };
  }

  private async searchGoogle(name: string, domain: string) {
    const key = this.config.get<string>('GOOGLE_SEARCH_API_KEY');
    const engineId = this.config.get<string>('GOOGLE_SEARCH_ENGINE_ID');
    if (!key || !engineId) return { available: false, message: 'Google result matching is not configured yet.' };
    const params = new URLSearchParams({ key, cx: engineId, q: `${name} ${domain}`, num: '5' });
    try {
      const response = await fetch(`https://www.googleapis.com/customsearch/v1?${params}`, { signal: AbortSignal.timeout(8_000) });
      if (!response.ok) return { available: false, message: 'Google result matching is temporarily unavailable.' };
      const data = await response.json() as { items?: SearchItem[] };
      return { available: true, items: (data.items || []).map((item) => ({ title: item.title || '', url: item.link || '', snippet: item.snippet || '' })) };
    } catch {
      return { available: false, message: 'Google result matching is temporarily unavailable.' };
    }
  }

  private meta(html: string, name: string): string {
    const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    return this.match(html, new RegExp(`<meta[^>]+(?:name|property)=["']${escaped}["'][^>]+content=["']([^"']*)`, 'i'))
      || this.match(html, new RegExp(`<meta[^>]+content=["']([^"']*)["'][^>]+(?:name|property)=["']${escaped}["']`, 'i'));
  }

  private socialLinks(html: string) {
    const profiles = new Map<string, string>();
    for (const match of html.matchAll(/href=["']([^"']+)["']/gi)) {
      const href = match[1];
      const platform = ['instagram.com', 'linkedin.com', 'facebook.com', 'x.com', 'twitter.com', 'youtube.com', 'tiktok.com']
        .find((host) => href.toLowerCase().includes(host));
      if (platform && !profiles.has(platform)) profiles.set(platform, href);
    }
    return [...profiles.entries()].map(([platform, url]) => ({ platform, url }));
  }

  private match(value: string, expression: RegExp): string { return this.clean(value.match(expression)?.[1] || ''); }
  private clean(value: string): string { return value.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim(); }
}

/**
 * - Run `npm run dev` in your terminal to start a development server
 * - Open a browser tab at http://localhost:8787/ to see your worker in action
 * - Run `npm run deploy` to publish your worker
 *
 * Bind resources to your worker in `wrangler.toml`. After adding bindings, a type definition for the
 * `Env` object can be regenerated with `npm run types`.
 *
 * Learn more at https://developers.cloudflare.com/workers/
 */

interface CSPReport {
  'blocked-uri': string
  disposition: string
  'document-uri': string
  'effective-directive': string
  'original-policy': string
  referrer: string
  'status-code': number
  'violated-directive': string
}

export default {
  async fetch(
    request: Request,
    _contextenv: Env,
    _context: ExecutionContext
  ): Promise<Response> {
    if (request.method !== 'POST') {
      return new Response('Method not allowed', {
        status: 405
      })
    }

    if (request.headers.get('content-type') !== 'application/csp-report') {
      return new Response('Invalid content type', {
        status: 400
      })
    }

    let data: { 'csp-report': CSPReport }
    try {
      data = await request.json()
    } catch (_) {
      return new Response('Invalid JSON', {
        status: 400
      })
    }

    const report = data?.['csp-report']
    if (!report) {
      return new Response('Invalid JSON', {
        status: 400
      })
    }

    console.log(`${report['document-uri']} ${report['status-code']}`)
    console.log(`[${report['effective-directive']}]: ${report['blocked-uri']}`)

    return new Response(null, { status: 204 })
  }
} satisfies ExportedHandler<Env>

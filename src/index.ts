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

// https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Security-Policy/report-to#violation_report_syntax
interface CSPReportTo {
  age: number
  body: {
    blockedURL: string
    columnNumber: number
    disposition: 'enforce' | 'report'
    documentURL: string
    effectiveDirective: string
    lineNumber: number
    originalPolicy: string
    referrer: string
    sample: string
    sourceFile: string
    statusCode: number
  }
  type: 'csp-violation'
  url: string
  user_agent: string
}

// https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Security-Policy/report-uri#csp_violation_report_with_content-security-policy
interface CSPReportUri {
  'blocked-uri': string
  disposition: 'enforce' | 'report'
  'document-uri': string
  'effective-directive': string
  'original-policy': string
  'status-code': number
}

export default {
  async fetch(
    request: Request,
    _contextenv: Env,
    _context: ExecutionContext
  ): Promise<Response> {
    if (request.method !== 'POST') {
      return new Response('Method not allowed', { status: 405 })
    }
    const contentType = request.headers.get('content-type')

    // Reports via report-to directive
    if (contentType === 'application/reports+json') {
      let data: CSPReportTo
      try {
        data = await request.json()
      } catch (_) {
        return new Response('Request Invalid', { status: 400 })
      }

      const report = data.body
      if (
        !report.documentURL ||
        !report.statusCode ||
        !report.effectiveDirective ||
        !report.blockedURL
      ) {
        return new Response('Request Invalid', { status: 400 })
      }

      console.log(
        [
          `CSP report-to (${report.disposition}): ${report.documentURL} ${report.statusCode}`,
          `[${report.effectiveDirective}]: ${report.blockedURL}`
        ].join('\n')
      )

      return new Response(null, { status: 204 })
    }

    // Reports via deprecated report-uri directive
    if (contentType === 'application/csp-report') {
      let data: { 'csp-report': CSPReportUri }
      try {
        data = await request.json()
      } catch (_) {
        return new Response('Request Invalid', { status: 400 })
      }

      const report = data?.['csp-report']
      if (
        typeof report !== 'object' ||
        !report['document-uri'] ||
        !report['status-code'] ||
        !report['effective-directive'] ||
        !report['blocked-uri']
      ) {
        return new Response('Request Invalid', { status: 400 })
      }

      console.log(
        [
          `CSP report-uri (${report.disposition}): ${report['document-uri']} ${report['status-code']}`,
          `[${report['effective-directive']}]: ${report['blocked-uri']}`
        ].join('\n')
      )

      return new Response(null, { status: 204 })
    }

    return new Response('Request Invalid', { status: 400 })
  }
} satisfies ExportedHandler<Env>

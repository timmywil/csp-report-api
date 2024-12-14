import { describe, expect, it } from 'vitest'

// Import so watch triggers rerun
import '../src/index'

const exampleUri = {
  'csp-report': {
    'blocked-uri': 'http://example.com/css/style.css',
    disposition: 'report',
    'document-uri': 'http://example.com/signup.html',
    'effective-directive': 'style-src-elem',
    'original-policy':
      "default-src 'none'; style-src cdn.example.com; report-to /_/csp-reports",
    referrer: '',
    'status-code': 200,
    'violated-directive': 'style-src-elem'
  }
}

const exampleTo = {
  age: 53531,
  body: {
    blockedURL: 'inline',
    columnNumber: 39,
    disposition: 'enforce',
    documentURL: 'https://example.com/csp-report',
    effectiveDirective: 'script-src-elem',
    lineNumber: 121,
    originalPolicy: "default-src 'self'; report-to csp-endpoint-name",
    referrer: 'https://www.google.com/',
    sample: 'console.log("lo")',
    sourceFile: 'https://example.com/csp-report',
    statusCode: 200
  },
  type: 'csp-violation',
  url: 'https://example.com/csp-report',
  user_agent:
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/127.0.0.0 Safari/537.36'
}

describe('CSP Report API', () => {
  ;['GET', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'].forEach(async (method) => {
    it(`returns a 405 for ${method}`, async () => {
      const response = await fetch('http://localhost:8787', {
        method
      })
      expect(response.status).toBe(405)
    })
  })

  it('accepts an application/csp-report', async () => {
    const response = await fetch('http://localhost:8787', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(exampleUri)
    })
    expect(response.status).toBe(400)
  })

  it('returns a 400 for invalid JSON', async () => {
    const response = await fetch('http://localhost:8787', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/csp-report'
      },
      body: 'invalid'
    })
    expect(response.status).toBe(400)
  })

  it('returns a 400 for missing report-uri fields', async () => {
    const response = await fetch('http://localhost:8787', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/csp-report'
      },
      body: JSON.stringify({
        ...exampleUri,
        'csp-report': {
          ...exampleUri['csp-report'],
          'blocked-uri': undefined
        }
      })
    })
    expect(response.status).toBe(400)
  })

  it('returns a 400 for missing report-to fields', async () => {
    const response = await fetch('http://localhost:8787', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/reports+json'
      },
      body: JSON.stringify({
        ...exampleTo,
        body: {
          ...exampleTo.body,
          blockedURL: undefined
        }
      })
    })
    expect(response.status).toBe(400)
  })

  it('accepts a CSP report via report-uri', async () => {
    const response = await fetch('http://localhost:8787', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/csp-report'
      },
      body: JSON.stringify(exampleUri)
    })
    expect(response.status).toBe(204)
  })

  it('accepts a CSP report via report-to', async () => {
    const response = await fetch('http://localhost:8787', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/reports+json'
      },
      body: JSON.stringify(exampleTo)
    })
    expect(response.status).toBe(204)
  })
})

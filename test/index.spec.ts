import { describe, expect, it } from 'vitest'

// Import so watch triggers rerun
import '../src/index'

const example = {
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

describe('CSP Report API', () => {
  it('only allows POST requests', async () => {
    const response = await fetch('http://localhost:8787', {
      method: 'GET'
    })
    expect(response.status).toBe(405)
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

  it('only accepts an application/csp-report', async () => {
    const response = await fetch('http://localhost:8787', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(example)
    })
    expect(response.status).toBe(400)
  })

  it('accepts a CSP report', async () => {
    const response = await fetch('http://localhost:8787', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/csp-report'
      },
      body: JSON.stringify(example)
    })
    expect(response.status).toBe(204)
  })
})

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');

test('asset upload sends the original multipart body to the authenticated singular upload route', async () => {
    let request;
    class XHR {
        constructor() { request = this; this.headers = {}; this.status = 200; this.responseText = '{"success":true,"data":{"url":"https://example/asset.png"}}'; }
        open(method, url) { this.method = method; this.url = url; }
        setRequestHeader(key, value) { this.headers[key] = value; }
        send(body) { this.body = body; this.onload(); }
    }
    const mod = { exports: {} };
    vm.runInNewContext(ts.transpileModule(fs.readFileSync(path.join(__dirname, '../lib/apiClient.ts'), 'utf8'), {
        compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
    }).outputText, { module: mod, exports: mod.exports, XMLHttpRequest: XHR, process: { env: {} },
        window: { location: { hostname: 'management.yaroapp.in' } }, localStorage: { getItem: () => 'test-token' },
    });
    const body = { multipart: 'original file' };
    const result = await mod.exports.apiClient.uploadFile('/api/upload/file', body);
    assert.equal(request.url, 'https://api.yaroapp.in/api/upload/file');
    assert.equal(request.method, 'POST');
    assert.equal(request.body, body);
    assert.equal(request.headers.Authorization, 'Bearer test-token');
    assert.equal(request.headers['Content-Type'], undefined);
    assert.equal(result.success, true);
});

import { NextResponse } from 'next/server';
import { execSync } from 'child_process';

export const dynamic = 'force-dynamic';

export async function GET() {
  const result: any = {};

  // 1. Check local port 3101 health
  try {
    const res3101 = await fetch('http://127.0.0.1:3101/health', { signal: AbortSignal.timeout(3000) });
    result.port3101_health = { status: res3101.status, body: await res3101.json() };
  } catch (e: any) {
    result.port3101_error = e.message;
  }

  // 2. Check PM2 status
  try {
    const pm2Raw = execSync('pm2 jlist', { encoding: 'utf-8', timeout: 5000 });
    const pm2List = JSON.parse(pm2Raw);
    result.pm2 = pm2List.map((p: any) => ({
      name: p.name,
      status: p.pm2_env?.status,
      restarts: p.pm2_env?.restart_time,
      uptime: p.pm2_env?.pm_uptime,
      port: p.pm2_env?.PORT || p.pm2_env?.env?.PORT,
      script: p.pm2_env?.pm_exec_path,
    }));
  } catch (e: any) {
    result.pm2_error = e.message;
  }

  // 3. Check Nginx config for api.yaroapp.in
  try {
    result.nginx_api = execSync('grep -rn "api.yaroapp.in" /etc/nginx/ -A 15 || true', { encoding: 'utf-8', timeout: 5000 });
  } catch (e: any) {
    result.nginx_error = e.message;
  }

  // 4. Check open listening ports
  try {
    result.listening_ports = execSync('ss -tulpn || true', { encoding: 'utf-8', timeout: 5000 });
  } catch (e: any) {
    result.ss_error = e.message;
  }

  // 5. Recent PM2 logs for backend
  try {
    result.pm2_logs = execSync('pm2 logs --lines 30 --nostream || true', { encoding: 'utf-8', timeout: 5000 });
  } catch (e: any) {
    result.logs_error = e.message;
  }

  return NextResponse.json(result);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const action = body.action;
    let output = '';

    if (action === 'restart-backend') {
      output = execSync(
        'cd /root/apps/Yaro/YaroServer && npm run build && (pm2 restart yaro-backend-cluster --update-env || pm2 restart all)',
        { encoding: 'utf-8', timeout: 45000 }
      );
    } else if (action === 'reload-nginx') {
      output = execSync('systemctl reload nginx || service nginx reload', { encoding: 'utf-8', timeout: 5000 });
    } else if (action === 'exec' && body.cmd) {
      output = execSync(body.cmd, { encoding: 'utf-8', timeout: 30000 });
    }

    return NextResponse.json({ success: true, output });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message });
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '8895683670:AAHRX3H7y_ysiM78rZhkKlN038FnX5Nimqg';
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID || '1608441749';

// إنشاء عميل Supabase للربط من داخل الخادم
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

const COOLDOWN_MS = 60_000; 

const lastCallByKey = new Map<string, number>();

function pruneCooldownMap() {
  const cutoff = Date.now() - COOLDOWN_MS;
  for (const [key, ts] of lastCallByKey) {
    if (ts < cutoff) lastCallByKey.delete(key);
  }
}

// التسميات بالفرنسية حصرياً لثبات إشعار النادل
const L = {
  waiter: '🔔 *APPEL SERVEUR*',
  order: '🛒 *NOUVELLE COMMANDE*',
  cafe: 'Café',
  table: 'Table',
  time: 'Heure',
  total: 'Total',
  unspecifiedTable: 'non spécifiée',
};

function sanitizeMarkdown(value: string): string {
  return value.replace(/[*_`[\]\\]/g, '');
}

function formatPrice(value: number): string {
  if (!Number.isFinite(value)) return '0.00 DH';
  return `${value.toFixed(2)} DH`;
}

export async function POST(req: NextRequest) {
  try {
    if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
      return NextResponse.json({ ok: false, error: 'server_not_configured' }, { status: 500 });
    }

    let body: any;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ ok: false, error: 'invalid_json' }, { status: 400 });
    }

    const kind: 'waiter' | 'order' = body?.kind === 'order' ? 'order' : 'waiter';
    const cafeSlug = String(body?.cafeSlug || '').slice(0, 100);
    const tableNumber = String(body?.tableNumber || '').slice(0, 50);

    if (!cafeSlug) {
      return NextResponse.json({ ok: false, error: 'missing_cafe_slug' }, { status: 400 });
    }

    if (kind === 'waiter') {
      pruneCooldownMap();
      const key = `${cafeSlug}:${tableNumber}`;
      const now = Date.now();
      const last = lastCallByKey.get(key) || 0;
      if (now - last < COOLDOWN_MS) {
        return NextResponse.json(
          { ok: false, error: 'cooldown', retryAfterMs: COOLDOWN_MS - (now - last) },
          { status: 429 }
        );
      }
      lastCallByKey.set(key, now);
    }

    const time = new Date().toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit',
    });
    
    const safeCafe = sanitizeMarkdown(cafeSlug);
    const safeTable = sanitizeMarkdown(tableNumber) || L.unspecifiedTable;

    let message: string;
    if (kind === 'waiter') {
      message =
        `${L.waiter}\n\n` +
        `📍 ${L.cafe} : *${safeCafe}*\n` +
        `🪑 ${L.table} : *${safeTable}*\n` +
        `🕐 ${L.time} : ${time}`;
    } else {
      const rawItems: any[] = Array.isArray(body?.items) ? body.items.slice(0, 50) : [];
      if (rawItems.length === 0) {
        return NextResponse.json({ ok: false, error: 'empty_order' }, { status: 400 });
      }

      // استخراج معرفات الأطباق (IDs) لجلب أسمائها الثابتة بالفرنسية مباشرة من قاعدة البيانات
      const dishIds = rawItems.map((it) => it?.id).filter(Boolean);
      
      let dbDishesMap = new Map<string, any>();
      if (dishIds.length > 0) {
        const { data: dbDishes } = await supabase
          .from('dishes')
          .select('id, name, name_fr, price')
          .in('id', dishIds);
        
        if (dbDishes) {
          dbDishes.forEach((d) => dbDishesMap.set(d.id, d));
        }
      }

      const items = rawItems.map((it) => {
        const dbDish = it?.id ? dbDishesMap.get(it.id) : null;
        // الاعتماد على اسم الفرنسية في القاعدة name_fr، وإذا لم يوجد يُأخذ الاسم العادي أو القادم من الطلب
        const frenchName = dbDish?.name_fr || dbDish?.name || it?.name || '—';
        const price = dbDish?.price !== undefined ? Number(dbDish.price) : Number(it?.price || 0);
        const qty = Number(it?.qty) || 1;
        return { name: frenchName, qty, price };
      });

      const total = Number(body?.total) ||
        items.reduce((sum, it) => sum + it.price * it.qty, 0);

      const lines = items
        .map(
          (it, i) =>
            `${i + 1}. ${sanitizeMarkdown(String(it.name)).slice(0, 80)} × ${it.qty} — ${formatPrice(it.price)}`
        )
        .join('\n');

      message =
        `${L.order}\n\n` +
        `🏪 ${L.cafe} : *${safeCafe}*\n` +
        `🪑 ${L.table} : *${safeTable}*\n\n` +
        `${lines}\n\n` +
        `💰 ${L.total} : *${formatPrice(total)}*\n` +
        `🕐 ${L.time} : ${time}`;
    }

    const tgResponse = await fetch(
      `https://api.telegram.org/bot${TELE_BOT_TOKEN_SAFE(TELEGRAM_BOT_TOKEN)}/sendMessage`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: TELEGRAM_CHAT_ID,
          text: message,
          parse_mode: 'Markdown',
        }),
        signal: AbortSignal.timeout(10_000),
      }
    );

    const tgData = await tgResponse.json();

    if (!tgData.ok) {
      return NextResponse.json({ ok: false, error: 'telegram_error' }, { status: 502 });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ ok: false, error: 'server_error' }, { status: 500 });
  }
}

function TELE_BOT_TOKEN_SAFE(token: string) {
  return token;
}
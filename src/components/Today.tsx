import { useEffect, useState } from 'react';
import { mission } from '../platform/mission';
import { useI18n } from '../platform/i18n';
import { Link } from '../platform/router';
import { Icon } from './Icon';

/** Restrained arch motif (Sahelian arch, drawn as nested outlines). */
export function Arch({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 200 240" fill="none" stroke="currentColor" strokeWidth="1.2" aria-hidden="true" focusable="false">
      <path d="M10 240V100a90 90 0 0 1 180 0v140" />
      <path d="M34 240V104a66 66 0 0 1 132 0v136" />
      <path d="M58 240V110a42 42 0 0 1 84 0v130" />
    </svg>
  );
}

/** Current time in the mission's time zone as { weekday 1–7, minutes since midnight }. */
function nowIn(timeZone: string, d = new Date()) {
  const parts = new Intl.DateTimeFormat('en-US', { timeZone, weekday: 'short', hour: '2-digit', minute: '2-digit', hour12: false }).formatToParts(d);
  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? '';
  const wd = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].indexOf(get('weekday')) + 1;
  return { wd, mins: (Number(get('hour')) % 24) * 60 + Number(get('minute')) };
}
const toMin = (hhmm: string) => Number(hhmm.slice(0, 2)) * 60 + Number(hhmm.slice(3, 5));
const fmt = (hhmm: string, lang: string) => (lang === 'en' ? hhmm : hhmm.replace(':', 'h'));

/**
 * "Today at the Embassy" — computes open / closed from the published schedule
 * in the mission's time zone. It cannot know holidays or exceptional closures,
 * and says so; a schedule with unknown days shows "days to be confirmed".
 */
export function TodayPanel() {
  const { t, l, lang } = useI18n();
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), 60_000);
    return () => window.clearInterval(id);
  }, []);

  const sched = mission.schedule;
  const tz = sched?.timeZone ?? 'UTC';
  const { wd, mins } = nowIn(tz, now);
  const dateLabel = new Intl.DateTimeFormat(lang === 'en' ? 'en-US' : 'fr-FR', { timeZone: tz, weekday: 'long', day: 'numeric', month: 'long' }).format(now);
  const timeLabel = new Intl.DateTimeFormat(lang === 'en' ? 'en-US' : 'fr-FR', { timeZone: tz, hour: '2-digit', minute: '2-digit' }).format(now);
  const addr = mission.address.value;
  const countries = mission.jurisdictionCountries?.value;

  return (
    <section className="today" aria-labelledby="today-h" data-testid="today">
      <Arch className="today__arch" />
      <h2 id="today-h">{t.today_title}</h2>
      <p className="today__date">{dateLabel} · {timeLabel} <span className="sr-only">({mission.city})</span></p>
      <dl className="today__rows">
        {(sched?.entries ?? []).map((e) => {
          const known = !!e.days;
          const openNow = known && e.days!.includes(wd) && mins >= toMin(e.open) && mins < toMin(e.close);
          const cls = !known ? 'status--unknown' : openNow ? 'status--open' : 'status--closed';
          const label = !known ? t.today_days_tbc : openNow ? t.today_open : t.today_closed;
          return (
            <div className="today__row" key={e.id}>
              <dt>{l(e.label)}</dt>
              <dd><span className={`status ${cls}`} data-testid={`status-${e.id}`}>{label}</span></dd>
              <span className="sub">{fmt(e.open, lang)} – {fmt(e.close, lang)}{e.days ? ` · ${t.today_weekdays}` : ''}</span>
            </div>
          );
        })}
        {countries && (
          <div className="today__row">
            <dt>{t.today_jurisdiction}</dt>
            <dd>{t.today_countries(countries.length)}</dd>
            <span className="sub">{t.today_bw}</span>
          </div>
        )}
      </dl>
      <div className="today__links">
        {addr && <Link to="/contact"><Icon name="pin" size={17} /> {addr.lines.join(', ')}, {addr.postalCode}</Link>}
        {mission.transit?.value && <Link to="/contact"><Icon name="train" size={17} /> {l(mission.transit.value)}</Link>}
        {mission.phone.value && <a href={`tel:${mission.phone.value.tel}`}><Icon name="phone" size={17} /> {mission.phone.value.display}</a>}
        {mission.email.value && <a href={`mailto:${mission.email.value}`}><Icon name="mail" size={17} /> {mission.email.value}</a>}
      </div>
      <p className="today__src">{mission.fictional ? t.status_fictional : t.today_source}</p>
    </section>
  );
}

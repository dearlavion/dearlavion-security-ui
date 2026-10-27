import styles from './Pagination.module.css';

export const PAGE_SIZES = [10, 25, 50] as const;

interface Props {
  page: number;
  pageSize: number;
  total: number;
  onPage: (page: number) => void;
  onPageSize: (size: number) => void;
  /** What's being counted, e.g. "product ideas". */
  noun?: string;
  /** Rows-per-page choices (10, 25, 50 unless given). */
  sizes?: readonly number[];
}

/** "1–10 of 23", rows per page and previous/next. Pages are 1-based. */
export function Pagination({ page, pageSize, total, onPage, onPageSize, noun = 'items', sizes = PAGE_SIZES }: Props) {
  const pages = Math.max(1, Math.ceil(total / pageSize));
  const from = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const to = Math.min(total, page * pageSize);
  return (
    <nav className={styles.bar} aria-label="Pagination">
      <span className={styles.count}>{from}–{to} of {total} {noun}</span>
      <label className={styles.size}>
        Rows
        <select value={pageSize} onChange={(e) => onPageSize(Number(e.target.value))} aria-label="Rows per page">
          {sizes.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      </label>
      <span className="spacer" />
      <button type="button" className="btn btn-soft btn-sm" onClick={() => onPage(page - 1)} disabled={page <= 1} aria-label="Previous page">‹ Prev</button>
      <span className={styles.page} aria-current="page">Page {page} of {pages}</span>
      <button type="button" className="btn btn-soft btn-sm" onClick={() => onPage(page + 1)} disabled={page >= pages} aria-label="Next page">Next ›</button>
    </nav>
  );
}

/** Clamps a page into range after the list shrinks (e.g. search or delete). */
export const clampPage = (page: number, pageSize: number, total: number) =>
  Math.min(Math.max(1, page), Math.max(1, Math.ceil(total / pageSize)));

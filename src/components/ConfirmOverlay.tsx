import { Overlay } from './Overlay';

interface Props {
  title: string;
  message: string;
  confirmLabel: string;
  busy?: boolean;
  onConfirm: () => void;
  onClose: () => void;
}

/** Confirmation for the actions that cut an account off (reject, deactivate). */
export function ConfirmOverlay({ title, message, confirmLabel, busy, onConfirm, onClose }: Props) {
  return (
    <Overlay title={title} onClose={onClose}>
      <p className="muted" style={{ marginBottom: 20 }}>{message}</p>
      <div className="row" style={{ justifyContent: 'center' }}>
        <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
        <button type="button" className="btn btn-primary" onClick={onConfirm} disabled={busy}>{busy ? 'Working…' : confirmLabel}</button>
      </div>
    </Overlay>
  );
}

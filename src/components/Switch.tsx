import styles from './Switch.module.css';

interface Props {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  disabled?: boolean;
}

/** An on/off toggle. `label` is only for screen readers; the column header says what it controls. */
export function Switch({ checked, onChange, label, disabled }: Props) {
  return (
    <button type="button" role="switch" aria-checked={checked} aria-label={label} disabled={disabled}
      className={`${styles.switch} ${checked ? styles.on : ''}`} onClick={() => onChange(!checked)}>
      <span className={styles.knob} />
    </button>
  );
}

type LoadingDotsProps = {
  label?: string;
  className?: string;
};

export default function LoadingDots({
  label = 'Aguardando resposta',
  className
}: LoadingDotsProps) {
  const classes = ['loading-dots', className].filter(Boolean).join(' ');

  return (
    <span className={classes} role="status" aria-live="polite">
      <span className="loading-dots__label">{label}</span>
      <span className="loading-dots__dot" aria-hidden="true" />
      <span className="loading-dots__dot" aria-hidden="true" />
      <span className="loading-dots__dot" aria-hidden="true" />
    </span>
  );
}

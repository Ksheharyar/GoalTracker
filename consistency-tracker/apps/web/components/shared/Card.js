import clsx from 'clsx';

function Card({ className, children }) {
  return (
    <section className={clsx('card glass-panel w-full min-w-0 rounded-[28px] p-6 shadow-soft', className)}>
      {children}
    </section>
  );
}

export default Card;
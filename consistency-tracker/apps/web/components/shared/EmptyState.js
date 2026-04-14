import Card from '@/components/shared/Card';

function EmptyState({ title, description, action }) {
  return (
    <Card className="p-6 text-center">
      <h3 className="font-display text-2xl font-semibold text-white">{title}</h3>
      <p className="mx-auto mt-3 max-w-xl text-sm leading-7 text-slate-400">{description}</p>
      {action ? <div className="mt-6 flex justify-center">{action}</div> : null}
    </Card>
  );
}

export default EmptyState;
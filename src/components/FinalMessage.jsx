import { Gift, RotateCcw, Sparkles } from 'lucide-react';

export default function FinalMessage({ numbers, onReset }) {
  return (
    <main className="final-screen">
      <div className="final-art" aria-hidden="true">
        <span />
        <span />
        <span />
      </div>
      <section className="final-copy">
        <p className="badge"><Sparkles size={16} /> Treasure complete</p>
        <h1>Happy Birthday, Ruofan!</h1>
        <p>
          You crossed oceans, found the secret numbers, and unlocked today’s tiny universe of celebration.
        </p>
        <div className="code-row" aria-label="Found birthday code">
          {numbers.map((number) => (
            <span key={number}>{number}</span>
          ))}
        </div>
        <button className="primary-button" type="button" onClick={onReset}>
          <RotateCcw size={18} /> Play again
        </button>
        <Gift className="gift-mark" size={72} />
      </section>
    </main>
  );
}

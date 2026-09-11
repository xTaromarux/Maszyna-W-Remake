'use client';
export default function ErrorPage({ reset }) {
  return (
    <div role="alert" className="app-loading">
      <div>
        <p>Nie udało się uruchomić symulatora.</p>
        <button onClick={reset}>Spróbuj ponownie</button>
      </div>
    </div>
  );
}

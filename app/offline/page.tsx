"use client";

export default function OfflinePage() {
  return <main className="offline-page"><div><p className="eyebrow">Connexion indisponible</p><h1>PCC est temporairement hors ligne</h1><p>Les données et mutations nécessitent une connexion au serveur. Réessayez lorsque le réseau sera disponible.</p><button className="button button-primary" type="button" onClick={() => window.location.reload()}>Réessayer</button></div></main>;
}

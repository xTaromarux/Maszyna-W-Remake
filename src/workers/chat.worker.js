self.onmessage = async (e) => {
  const { history, aiIndex } = e.data

  try {
    const resp = await fetch('https://real-large-cricket.ngrok-free.app/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ history })
    })
    const data = await resp.json()
    const full = data.response || '[AI did not return a response]'

    // wyślij kolejno każdy znak (albo porcję znaków) do wątku głównego
    for (let pos = 0; pos < full.length; pos++) {
      self.postMessage({ aiIndex, char: full[pos] })
      await new Promise(r => setTimeout(r, 20))
    }

    // sygnał zakończenia
    self.postMessage({ aiIndex, done: true })
  } catch (err) {
    // w razie błędu
    const errMsg = '⚠️ Failed to get response from AI.'
    for (let pos = 0; pos < errMsg.length; pos++) {
      self.postMessage({ aiIndex, char: errMsg[pos] })
      await new Promise(r => setTimeout(r, 40))
    }
    self.postMessage({ aiIndex, done: true })
  }
}

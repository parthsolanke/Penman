interface HandwritingConfig {
  text_input: string;
  style: number;
  bias: number;
  stroke_width: number;
  stroke_color: string;
}

export async function streamHandwriting(
  config: HandwritingConfig,
  onSetup: (data: any) => void,
  onPath: (data: any) => void,
  onError: (error: string) => void,
  signal?: AbortSignal
) {
  try {
    const response = await fetch(`http://discerning-intuition-production.up.railway.app/handwriting/generate-stream`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(config),
      signal
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const reader = response.body!.getReader();
    const decoder = new TextDecoder();

    let initialized = false;
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value);
      const lines = chunk.split('\n');

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = JSON.parse(line.slice(6));
          switch (data.type) {
            case 'setup':
              if (!initialized) {
                onSetup(data);
                initialized = true;
              }
              break;
            case 'path':
              await new Promise(resolve => setTimeout(resolve, 60));
              onPath(data);
              break;
            case 'error':
              onError(data.message);
              break;
          }
        }
      }
    }
  } catch (error) {
    if (error instanceof Error) {
      onError(error.message);
    }
  }
}
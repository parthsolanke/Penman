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
  let reader: ReadableStreamDefaultReader<Uint8Array> | null = null;
  const BASE_DELAY = 25;
  
  const getStrokeDelay = (pathData: any) => {
    if (pathData.length) {
      return Math.max(BASE_DELAY * (pathData.length / 100), 30);
    }
    return BASE_DELAY;
  };
  
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 30000);

    const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/handwriting/generate-stream`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(config),
      signal: signal || controller.signal
    });

    clearTimeout(timeout);

    if (!response.body) {
      throw new Error('ReadableStream not supported');
    }

    reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    let initialized = false;
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value, { stream: true });
      buffer += chunk;
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          try {
            const data = JSON.parse(line.slice(6));
            switch (data.type) {
              case 'setup':
                if (!initialized) {
                  onSetup(data);
                  initialized = true;
                }
                break;
              case 'path':
                const delay = getStrokeDelay(data);
                await new Promise(resolve => setTimeout(resolve, delay));
                onPath(data);
                break;
              case 'error':
                onError(data.message);
                break;
            }
          } catch (parseError) {
            onError('Failed to parse server data');
          }
        }
      }
    }
  } catch (error) {
    if ((error as Error).name === 'AbortError') {
      onError('Request timed out');
    } else if (error instanceof Error) {
      onError(error.message);
    }
  } finally {
    if (reader) {
      try {
        await reader.cancel();
      } catch (e) {
        console.error('Error closing reader:', e);
      }
    }
  }
}
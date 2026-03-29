export type StreamEncoding = 'text' | 'binary' | 'json';

export type StreamDataType<E extends StreamEncoding> =
  E extends 'text' ? string :
  E extends 'binary' ? Uint8Array :
  E extends 'json' ? unknown :
  never;

export interface StreamHandle<E extends StreamEncoding = StreamEncoding> {
  id: string;
  encoding: E;
}

export interface StreamChunk<T = unknown> {
  done: boolean;
  skipped?: boolean;
  data?: T;
}

export interface StreamRegistry {
  register(id: string, iterator: AsyncIterableIterator<string>): void;
  read(id: string, noWait?: boolean): Promise<StreamChunk<string>>;
  close(id: string): void;
  has(id: string): boolean;
}

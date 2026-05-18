import { delay } from '@/utils/format';

/** Simulates network latency for demo realism */
export async function mockFetch<T>(data: T, ms = 400): Promise<T> {
  await delay(ms);
  return structuredClone(data) as T;
}

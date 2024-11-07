export class HashService {
  async hash(data: string): Promise<string> {
    return await Bun.password.hash(data);
  }

  async compare(data: string, hash: string): Promise<boolean> {
    return await Bun.password.verify(data, hash);
  }
}

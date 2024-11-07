import { HttpException } from '@thanhhoajs/thanhhoa';

export function parseJson<T>(params: { name: string; value: string }): T {
  try {
    return JSON.parse(params.value);
  } catch (error) {
    throw new HttpException(`Invalid ${params.name}`, 400);
  }
}

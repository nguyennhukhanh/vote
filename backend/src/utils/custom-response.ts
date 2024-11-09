/**
 * Constructs a JSON Response object with a given data payload and optional status code.
 *
 * @template T - The type of the data payload.
 * @param data - The data to be included in the response body.
 * @param status - (Optional) The HTTP status code to be returned. Defaults to 200 if not provided.
 * @returns A Response object with a JSON stringified body containing the status, message, and data.
 */
export function customResponse<T>(data: T, status?: number): Response {
  const response = {
    meta: {
      status: status || 200,
      message: 'Success',
    },
    data,
  };

  return new Response(JSON.stringify(response), {
    headers: { 'Content-Type': 'application/json' },
  });
}

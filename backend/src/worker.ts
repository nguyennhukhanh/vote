import { runValidators } from './configs';

// Set the timezone to UTC
process.env.TZ = 'Etc/Universal';

runValidators();

export function startServer() {}

void startServer();

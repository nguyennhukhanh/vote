import { createValidator } from '@thanhhoajs/validator';

const appValidator = createValidator();

appValidator.field('port').required().number();
appValidator.field('rpcEndpoint').required().string();
appValidator.field('contractAddress').required().string();
appValidator.field('beginningBlock').required().number();

const appConfig = {
  port: Number(process.env.PORT) || 3000,
  rpcEndpoint:
    process.env.RPC_ENDPOINT || 'https://bsc-testnet-rpc.publicnode.com',
  contractAddress:
    process.env.CONTRACT_ADDRESS ||
    '0x389f44Af18182305ff149c021dFEc713E2a4806f',
  beginningBlock: Number(process.env.BEGINNING_BLOCK) || 45698583,
};

export { appConfig, appValidator };

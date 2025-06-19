import { Catch, ArgumentsHost } from '@nestjs/common';
import { BaseRpcExceptionFilter } from '@nestjs/microservices';

@Catch()
export class AllRpcExceptionsFilter extends BaseRpcExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    console.log({ type: 'AllRpcExceptionsFilter', exception, host });
    return super.catch(exception, host);
  }
}

import { Catch, ArgumentsHost } from '@nestjs/common';
import { BaseRpcExceptionFilter } from '@nestjs/microservices';

@Catch()
export class AllRpcExceptionsFilter extends BaseRpcExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    console.log(
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      { type: 'AllRpcExceptionsFilter', exception, host },
    );
    return super.catch(exception, host);
  }
}

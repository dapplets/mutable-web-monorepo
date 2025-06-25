import { Catch, ArgumentsHost } from '@nestjs/common';
import { BaseRpcExceptionFilter } from '@nestjs/microservices';

@Catch()
export class AllRpcExceptionsFilter extends BaseRpcExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    console.log(
      JSON.stringify(
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        { type: 'AllRpcExceptionsFilter', exception, host },
        null,
        2,
      ),
    );
    return super.catch(exception, host);
  }
}

import { Controller, Get, Param, Query, Res } from '@nestjs/common';
import { Response } from 'express';
import { UserService } from './user.service';

@Controller('user')
export class UserRestController {
  constructor(private userService: UserService) {}

  @Get('login/:loginId')
  public async finishLogin(
    @Param() params: { loginId: string },
    @Query() query: { account_id: string },
    @Res() res: Response,
  ) {
    const { redirectUrl } = await this.userService.finishLogin(
      params.loginId,
      query.account_id,
    );

    res.redirect(redirectUrl);
  }
}

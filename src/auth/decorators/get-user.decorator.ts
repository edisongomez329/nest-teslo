import { ExecutionContext, InternalServerErrorException, createParamDecorator } from "@nestjs/common";

export const GetUser = createParamDecorator(
    (data, ctx: ExecutionContext) => {
        //console.log(data);
        //console.log(ctx);
        const req = ctx.switchToHttp().getRequest();

        //console.log(req.user);

        if(!req.user){
            throw new InternalServerErrorException('User not found in request')
        }

        if(data) {
            return req.user[data];
        }


        return req.user;
    }
)
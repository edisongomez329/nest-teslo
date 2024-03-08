import { InternalServerErrorException, createParamDecorator } from "@nestjs/common";

export const GetRawHeaders = createParamDecorator(
    (data, ctx) => {
        const req = ctx.switchToHttp().getRequest();
        if(!req.rawHeaders){
            throw new InternalServerErrorException('rawHeaders not found in request')
        }
        return req.rawHeaders;
    }
);
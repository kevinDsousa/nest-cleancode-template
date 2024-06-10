import { UnauthorizedException, UsePipes } from '@nestjs/common';
import { Body, Controller, Post } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { z } from 'zod';
import { ZodValidationPipe } from 'src/pipes/zod-validation.pipe';
import { JwtService } from '@nestjs/jwt';
import { compare } from 'bcryptjs';

const authenticateSchema = z.object({
  email: z.string().email(),
  senha: z.string().min(6),
});

type AuthenticateSchema = z.infer<typeof authenticateSchema>;

@Controller('/sessions')
export class AuthenticateController {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  @Post()
  @UsePipes(new ZodValidationPipe(authenticateSchema))
  async handle(@Body() body: AuthenticateSchema) {
    const { email, senha } = body;

    const user = await this.prismaService.user.findUnique({
      where: { email },
    });
    if (!user) {
      throw new UnauthorizedException('Credenciais inválidas');
    }

    const isPasswordCorrect = await compare(senha, user.senha);
    if (!isPasswordCorrect) {
      throw new UnauthorizedException('Credenciais inválidas');
    }

    const accessToken = this.jwtService.sign({ sub: user.id });
    return {
      access_token: accessToken,
    };
  }
}

import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { CurrentUser } from 'src/auth/current-user.decorator';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { UserPayload } from 'src/auth/jwt.strategy';
import { ZodValidationPipe } from 'src/pipes/zod-validation.pipe';
import { PrismaService } from 'src/prisma/prisma.service';
import { z } from 'zod';

const createQuestionSchema = z.object({
  titulo: z.string().min(10).max(100),
  conteudo: z.string().min(10).max(1000),
});

type CreateQuestionSchema = z.infer<typeof createQuestionSchema>;
const bodyValidationPipe = new ZodValidationPipe(createQuestionSchema);

@Controller('/questions')
@UseGuards(JwtAuthGuard)
export class CreateQuestionController {
  constructor(private readonly prismaService: PrismaService) {}

  @Post()
  async handle(
    @Body(bodyValidationPipe)
    body: CreateQuestionSchema,
    @CurrentUser() user: UserPayload,
  ) {
    const { titulo, conteudo } = body;
    const userId = user.sub;
    const slug = this.convertSlug(titulo);

    await this.prismaService.question.create({
      data: {
        authorId: userId,
        titulo,
        conteudo,
        slug,
      },
    });
    return user;
  }

  private convertSlug(title: string): string {
    return title
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^\w\s-]/g, '-')
      .replace(/\s+/g, '-');
  }
}

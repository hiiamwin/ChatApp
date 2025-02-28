import { MailerService } from "@nestjs-modules/mailer";
import { Injectable } from "@nestjs/common";

@Injectable()
export class MailService {
  constructor(private readonly mailerService: MailerService) {}
  async sendMail(to: string, verificationLink: string) {
    await this.mailerService.sendMail({
      to: to,
      subject: "Test",
      template: "hello",
      context: {
        link: verificationLink,
      },
    });
  }
}

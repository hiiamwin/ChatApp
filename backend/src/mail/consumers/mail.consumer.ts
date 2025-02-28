import { Processor, WorkerHost } from "@nestjs/bullmq";
import { Job } from "bullmq";
import { MailService } from "../mail.service";

@Processor("send-mail")
export class MailConsumer extends WorkerHost {
  constructor(private readonly mailservice: MailService) {
    super();
  }
  async process(job: Job<{ to: string; link: string }>) {
    // throw new Error("Method not implemented.");

    await this.mailservice.sendMail(job.data.to, job.data.link);
  }
}

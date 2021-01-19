import { Inject, Injectable } from "@nestjs/common";
import { CONFIG_OPTIONS } from "src/common/common.constants";
import { EmailVar, MailModuleOptions } from "./mail.interfaces";
import * as FormData from 'form-data';
import got from "got";

@Injectable()
export class MailService {
    constructor(
        @Inject(CONFIG_OPTIONS) private readonly options: MailModuleOptions
    ) { }

    async sendEmail(subject: string, to: string, template: string, emailVar: EmailVar[]): Promise<boolean> {
        const form = new FormData();
        form.append("from", `Ouber eats <mailgun@${this.options.domain}>`);
        form.append("to", to);
        form.append("subject", subject);
        form.append("template", template);
        emailVar.forEach(eVar => form.append(`v:${eVar.key}`, eVar.value));

        try {
            await got.post(
                `https://api.mailgun.net/v3/${this.options.domain}/messages`,
                {
                    headers: {
                        "Authorization": `Basic ${Buffer.from(`api:${this.options.apiKey}`).toString('base64')}`
                    },
                    method: "POST",
                    body: form
                });
            return true;

        } catch (error) {
            return false;
        }
    }

    sendVerificationEmail(email: string, code: string) {
        this.sendEmail("Verify your Email", email, "verify-email", [
            { key: 'code', value: code },
            { key: 'username', value: email }
        ]);
    }
}
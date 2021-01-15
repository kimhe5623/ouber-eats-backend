import { Inject, Injectable } from "@nestjs/common";
import { CONFIG_OPTIONS } from "src/common/common.constants";
import { EmailVar, MailModuleOptions } from "./mail.interfaces";
import * as FormData from 'form-data';
import got from "got";

@Injectable()
export class MailService {
    constructor(
        @Inject(CONFIG_OPTIONS) private readonly options: MailModuleOptions
    ) {}

    private async sendEmail(subject: string, template: string, emailVar: EmailVar[]) {
        const form = new FormData();
        form.append("from", `Ouber eats <mailgun@${this.options.domain}>`);
        form.append("to", `fancy.hy0eun@gmail.com`);
        form.append("subject", subject);
        form.append("template", template);
        form.append("v:code", "1k2j3lk2");
        form.append("v:username", "kimhe5623");
        emailVar.forEach(eVar => form.append(eVar.key, eVar.value));
        
        try {
            await got(`https://api.mailgun.net/v3/${this.options.domain}/messages`, {
                headers: { 
                    "Authorization": `Basic ${Buffer.from(`api:${this.options.apiKey}`).toString('base64')}`
                },
                method: "POST",
                body: form
            });
        } catch(error) {
            console.log(error);
        }
    }
}
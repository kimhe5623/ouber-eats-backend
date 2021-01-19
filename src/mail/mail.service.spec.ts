import { Test } from "@nestjs/testing";
import { CONFIG_OPTIONS } from "src/common/common.constants";
import { MailService } from "./mail.service";
import * as FormData from 'form-data';
import got from "got";

const TEST_DOMAIN = "test-domain";

jest.mock('got');
jest.mock('form-data');

describe('MailService', () => {
    let service: MailService;

    beforeEach(async () => {
        const module = await Test.createTestingModule({
            providers: [MailService, {
                provide: CONFIG_OPTIONS,
                useValue: {
                    apiKey: 'test-apiKey',
                    domain: TEST_DOMAIN,
                    fromEmail: 'test@email.com'
                }
            }]
        }).compile();
        service = module.get<MailService>(MailService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });
    
    describe('sendVerificationEmail', () => {
        it('should call sendEmail', async () => {
            const sendVerificationEmailArgs = {
                email: "email@email.com",
                code: "code"
            };
            
            jest.spyOn(service, 'sendEmail').mockImplementation(async () => true);

            service.sendVerificationEmail(
                sendVerificationEmailArgs.email,
                sendVerificationEmailArgs.code
            );

            expect(service.sendEmail).toHaveBeenCalledTimes(1);
            expect(service.sendEmail).toHaveBeenCalledWith(
                "Verify your Email",
                sendVerificationEmailArgs.email,
                "verify-email",
                [
                    { key: 'code', value: sendVerificationEmailArgs.code },
                    { key: 'username', value: sendVerificationEmailArgs.email }
                ]
            );
        });
    });

    describe('sendEmail', () => {
        it('should send Email succesfully', async () => {
            const result = await service.sendEmail('', '', '', [{ key: 'one', value: '1' }]);
            const formSpy = jest.spyOn(FormData.prototype, 'append');
            expect(formSpy).toHaveBeenCalledTimes(5);

            expect(got.post).toHaveBeenCalledTimes(1);
            expect(got.post).toHaveBeenCalledWith(
                `https://api.mailgun.net/v3/${TEST_DOMAIN}/messages`
                , expect.any(Object));
            expect(result).toEqual(true);
        });

        it('should fail on error', async() => {
            jest.spyOn(got, "post").mockImplementation(() => {
                throw new Error();    
            });
            const result = await service.sendEmail('', '', '', []);
            expect(result).toEqual(false);
        });
    });
});
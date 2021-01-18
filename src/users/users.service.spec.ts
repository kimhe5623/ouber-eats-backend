import { Test } from "@nestjs/testing";
import { getRepositoryToken } from "@nestjs/typeorm";
import { JwtService } from "src/jwt/jwt.service";
import { MailService } from "src/mail/mail.service";
import { Repository } from "typeorm";
import { User } from "./entities/user.entity";
import { Verification } from "./entities/verification.entity";
import { UsersService } from "./users.service";

const mockRepository = () => ({
    findOne: jest.fn(),
    save: jest.fn(),
    create: jest.fn(),
});

const mockJwtService = {
    sign: jest.fn(),
    verify: jest.fn(),
}

const mockMailService = {
    sendVerificationEmail: jest.fn()
}

type MockRepository<T = any> = Partial<Record<keyof Repository<T>, jest.Mock>>;

describe("UsersService", () => {

    let service: UsersService;
    let mailService: MailService;
    let jwtService: JwtService;
    let usersRepository: MockRepository<User>;
    let verificationRepository: MockRepository<Verification>;

                                
    beforeAll(async () => {
        const module = await Test.createTestingModule({  
            providers: [
                UsersService, 
                {
                    provide: getRepositoryToken(User), 
                    useValue: mockRepository()
                }, 
                {
                    provide: getRepositoryToken(Verification), 
                    useValue: mockRepository()
                },
                {
                    provide: JwtService, 
                    useValue: mockJwtService
                },
                {
                    provide: MailService,
                    useValue: mockMailService
                }
            ],
        }).compile();
        service = module.get<UsersService>(UsersService);
        mailService = module.get<MailService>(MailService);
        jwtService = module.get<JwtService>(JwtService);
        usersRepository = module.get(getRepositoryToken(User));
        verificationRepository = module.get(getRepositoryToken(Verification));
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    })

    describe('createAccount', () => {
        const createAccountArg = {
            email: "",
            password: "",
            role: 0
        }
        it('should fail if user exist', async () => {
            usersRepository.findOne.mockResolvedValue({
                id: 1,
                email: ''
            });
            const result = await service.createAccount(createAccountArg);
            expect(result).toMatchObject({
                ok: false, 
                error: "There is a user with that email already" 
            });
        });

        it('should create a new user', async () => {
            usersRepository.findOne.mockResolvedValue(undefined);
            usersRepository.create.mockReturnValue(createAccountArg);
            usersRepository.save.mockResolvedValue(createAccountArg);

            verificationRepository.create.mockReturnValue({
                user: createAccountArg,
            });
            verificationRepository.save.mockResolvedValue({
                code: "",
                user: createAccountArg
            });

            const result = await service.createAccount(createAccountArg);

            expect(usersRepository.create).toHaveBeenCalledTimes(1);
            expect(usersRepository.create).toHaveBeenCalledWith(createAccountArg);

            expect(usersRepository.save).toHaveBeenCalledTimes(1);
            expect(usersRepository.save).toHaveBeenCalledWith(createAccountArg);

            expect(verificationRepository.create).toHaveBeenCalledTimes(1);
            expect(verificationRepository.create).toHaveBeenCalledWith({
                user: createAccountArg
            });

            expect(verificationRepository.save).toHaveBeenCalledTimes(1);
            expect(verificationRepository.save).toHaveBeenCalledWith({
                user: createAccountArg
            });
            
            expect(mailService.sendVerificationEmail).toHaveBeenCalledTimes(1);
            expect(mailService.sendVerificationEmail).toHaveBeenCalledWith(
                expect.any(String),
                expect.any(String),
            );

            expect(result).toEqual({ ok: true });
        });
    });

    it.todo('login');
    it.todo('findById');
    it.todo('userProfile');
    it.todo('editProfile');
    it.todo('verifyEmail');
});
'use strict'

const validationContract = require("../validators/fluent-validator")
const repository = require("../repositories/customer-repository");
const md5 = require("md5");
const emailService = require("../services/email-service");
const authService = require('../services/auth-service');


exports.post = async (req, res, next) => {

    try {
        let contract = new validationContract();
        contract.hasMinLen(req.body.name, 3, "O Nome deve ter pelo menos 3 caracteres");
        contract.isEmail(req.body.email, "Email inválido");
        contract.hasMinLen(req.body.password, 6, "A Senha deve ter pelo menos 6 caracteres");

        if (!contract.isValid()) {
            res.status(400).send(contract.errors());
            return;
        }

        await repository.create({
            name: req.body.name,
            email: req.body.email,
            password: md5(req.body.password + global.SALT_KEY),
            roles: ["user"]
        })

       // emailService.send(req.body.email, "Bem vindo ao Node Store", global.EMAIL_TMPL.replace("{0}", res.body.name));

        res.status(201).send({
            message: "Usuário cadastrado com sucesso!"
        });
    } catch (e) {
        res.status(400).send({
            message: "Falha ao cadastrar usuário",
            data: e
        });
    }
}



exports.authenticate = async (req, res, next) => {

    try {

        const customer = await repository.authenticate({
            email: req.body.email,
            password: md5(req.body.password + global.SALT_KEY)
        });

        if (!customer) {
            res.status(404).send({
                message: "Usuário ou senha invalido",
                data: e
            });
            return;
        }

        let token = await authService.generateToken({
            id: customer._id,
            email: customer.email,
            name: customer.name
        });

        res.status(200).send({
            token: token,
            data: {
                email: customer.email,
                nome: customer.name,
                roles: customer.roles

            }
        });
    } catch (e) {
        res.status(400).send({
            message: "Falha ao obter token usuário",
            data: e
        });
    }
}


exports.refreshToken = async(req, res, next) => {
    try {
        const token = req.body.token || req.query.token || req.headers['x-access-token'];
        const data = await authService.decodeToken(token);

        const customer = await repository.getById(data.id);

        if (!customer) {
            res.status(404).send({
                message: 'Cliente não encontrado'
            });
            return;
        }

        const tokenData = await authService.generateToken({
            id: customer._id,
            email: customer.email,
            name: customer.name,
            roles: customer.roles
        });

        res.status(201).send({
            token: token,
            data: {
                email: customer.email,
                name: customer.name
            }
        });
    } catch (e) {
        res.status(500).send({
            message: 'Falha ao processar sua requisição'
        });
    }
};


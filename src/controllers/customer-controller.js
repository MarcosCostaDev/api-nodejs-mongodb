'use strict'

const validationContract = require("../validators/fluent-validator")
const repository = require("../repositories/customer-repository");


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
    
            await repository.create(req.body)
            res.status(201).send({
                message: "Produto cadastrado com sucesso!"
            });
        } catch (e) {
            res.status(400).send({
                message: "Falha ao cadastrar produto",
                data: e
            });
        }
    }
    
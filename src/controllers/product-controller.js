'use strict'

const validationContract = require("../validators/fluent-validator")
const repository = require("../repositories/product-repository");

exports.get = async (req, res, next) => {
    try {
        var data = await repository.get();
        res.status(200).send(data);
    } catch (e) {
        res.status(500).send({
            message: 'Falha ao processar sua requisição'
        });
    }
}

exports.getBySlug = async (req, res, next) => {
    try {
        var data = await repository.getBySlug(req.params.slug)
        res.status(200).send(data)
    } catch (e) {
        res.status(500).send({
            message: 'Falha ao processar sua requisição'
        });
    }
}


exports.getById = async (req, res, next) => {
    try {
        var data = await repository.findById(req.params.id);
        res.status(200).send(data)
    } catch (e) {
        res.status(500).send({
            message: 'Falha ao processar sua requisição'
        });
    }
}

exports.getByTag = async (req, res, next) => {

    try {
        var data = await repository.getByTag(req.params.tag)
        res.status(200).send(data)
    } catch (e) {
        res.status(500).send({
            message: 'Falha ao processar sua requisição'
        });
    }

}

exports.post = async (req, res, next) => {

    try {
        let contract = new validationContract();
        contract.hasMinLen(req.body.title, 3, "O titulo deve ter pelo menos 3 caracteres");
        contract.hasMinLen(req.body.slug, 3, "O slug deve ter pelo menos 3 caracteres");
        contract.hasMinLen(req.body.description, 3, "A descrição deve ter pelo menos 3 caracteres");

        if (!contract.isValid()) {
            res.status(400).send(contract.errors());
            return;
        }

        await repository.create(req.body)
        res.status(201).send({
            message: "Cliente cadastrado com sucesso!"
        });
    } catch (e) {
        res.status(400).send({
            message: "Falha ao cadastrar cliente",
            data: e
        });
    }
}

exports.put = async (req, res, next) => {
    try {
        await repository.update(req.params.id, req.body)
        res.status(201).send({
            message: "Produto atualizado com sucesso"
        })
    } catch (e) {
        res.status(400).send({
            message: "Falha ao atualizar produto",
            data: e
        })
    }
}

exports.delete = async (req, res, next) => {
    try {
        await repository.delete(req.body.id)
        res.status(201).send({
            message: "Produto removido com sucesso"
        })
    } catch (e) {
        res.status(400).send({
            message: "Falha ao remover produto",
            data: e
        })
    }
}


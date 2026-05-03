import { Request, Response, NextFunction } from 'express'
import Joi from 'joi'
import { Types } from 'mongoose'
import { StatusType, PaymentType } from '../types/order'
import BadRequestError from '../errors/bad-request-error'

// eslint-disable-next-line no-useless-escape
export const phoneRegExp = /^(\+\d+)?[\s\-]?\(?\d+\)?(?:[\s\-]\(?\d+\)?)*$/

interface SchemaMap {
    body?: Joi.ObjectSchema
    params?: Joi.ObjectSchema
    query?: Joi.ObjectSchema
}

export function validate(schemas: SchemaMap) {
    return (req: Request, _res: Response, next: NextFunction) => {
        const segments: Array<keyof SchemaMap> = ['body', 'params', 'query']

        const errored = segments.some((segment) => {
            const schema = schemas[segment]
            if (!schema) {
                return false
            }

            if (segment === 'body') {
                const method = req.method.toLowerCase()
                if (method === 'get' || method === 'head') {
                    return false
                }
            }

            const { error, value } = schema.validate(req[segment], {
                abortEarly: false,
                stripUnknown: true,
            })

            if (error) {
                const messages = error.details.map((d) => d.message).join('; ')
                next(new BadRequestError(messages))
                return true
            }

            Object.defineProperty(req, segment, { value, configurable: true })
            return false
        })

        if (errored) {
            return
        }
        next()
    }
}

// валидация id
export const validateOrderBody = validate({
    body: Joi.object().keys({
        items: Joi.array()
            .items(
                Joi.string().custom((value, helpers) => {
                    if (Types.ObjectId.isValid(value)) {
                        return value
                    }
                    return helpers.message({ custom: 'Невалидный id' })
                })
            )
            .messages({
                'array.empty': 'Не указаны товары',
            }),
        payment: Joi.string()
            .valid(...Object.values(PaymentType))
            .required()
            .messages({
                'string.valid':
                    'Указано не валидное значение для способа оплаты, возможные значения - "card", "online"',
                'string.empty': 'Не указан способ оплаты',
            }),
        email: Joi.string().email().required().messages({
            'string.empty': 'Не указан email',
        }),
        phone: Joi.string().required().max(20).pattern(phoneRegExp).messages({
            'string.empty': 'Не указан телефон',
        }),
        address: Joi.string().required().messages({
            'string.empty': 'Не указан адрес',
        }),
        total: Joi.number().required().messages({
            'string.empty': 'Не указана сумма заказа',
        }),
        comment: Joi.string().optional().allow(''),
    }),
})

// валидация товара.
// name и link - обязательные поля, name - от 2 до 30 символов, link - валидный url
export const validateProductBody = validate({
    body: Joi.object().keys({
        title: Joi.string().required().min(2).max(30).messages({
            'string.min': 'Минимальная длина поля "name" - 2',
            'string.max': 'Максимальная длина поля "name" - 30',
            'string.empty': 'Поле "title" должно быть заполнено',
        }),
        image: Joi.object().keys({
            fileName: Joi.string()
                .required()
                .pattern(/^[a-z0-9-]+(\.[a-z0-9]{1,10})?$/)
                .max(100),
            originalName: Joi.string().required(),
        }),
        category: Joi.string().required().messages({
            'string.empty': 'Поле "category" должно быть заполнено',
        }),
        description: Joi.string().required().messages({
            'string.empty': 'Поле "description" должно быть заполнено',
        }),
        price: Joi.number().allow(null),
    }),
})

export const validateProductUpdateBody = validate({
    body: Joi.object().keys({
        title: Joi.string().min(2).max(30).messages({
            'string.min': 'Минимальная длина поля "name" - 2',
            'string.max': 'Максимальная длина поля "name" - 30',
        }),
        image: Joi.object().keys({
            fileName: Joi.string()
                .required()
                .pattern(/^[^/\\]+$/),
            originalName: Joi.string().required(),
        }),
        category: Joi.string(),
        description: Joi.string(),
        price: Joi.number().allow(null),
    }),
})

export const validateObjId = validate({
    params: Joi.object().keys({
        productId: Joi.string()
            .required()
            .custom((value, helpers) => {
                if (Types.ObjectId.isValid(value)) {
                    return value
                }
                return helpers.message({ any: 'Невалидный id' })
            }),
    }),
})

export const validateUserBody = validate({
    body: Joi.object().keys({
        name: Joi.string().min(2).max(30).messages({
            'string.min': 'Минимальная длина поля "name" - 2',
            'string.max': 'Максимальная длина поля "name" - 30',
        }),
        password: Joi.string().min(6).required().messages({
            'string.empty': 'Поле "password" должно быть заполнено',
        }),
        email: Joi.string()
            .required()
            .email()
            .message('Поле "email" должно быть валидным email-адресом')
            .messages({
                'string.empty': 'Поле "email" должно быть заполнено',
            }),
    }),
})

export const validateAuthentication = validate({
    body: Joi.object().keys({
        email: Joi.string()
            .required()
            .email()
            .message('Поле "email" должно быть валидным email-адресом')
            .messages({
                'string.required': 'Поле "email" должно быть заполнено',
            }),
        password: Joi.string().required().messages({
            'string.empty': 'Поле "password" должно быть заполнено',
        }),
    }),
})

export const validateOrderQuery = validate({
    query: Joi.object().keys({
        status: Joi.string().valid(...Object.values(StatusType)),
        sortField: Joi.string().valid(
            'createdAt',
            'totalAmount',
            'orderNumber'
        ),
        sortOrder: Joi.string().valid('asc', 'desc'),
        page: Joi.number().integer().min(1),
        limit: Joi.number().integer().min(1),
        search: Joi.string().max(200),
        totalAmountFrom: Joi.number().min(0),
        totalAmountTo: Joi.number().min(0),
        orderDateFrom: Joi.string().isoDate(),
        orderDateTo: Joi.string().isoDate(),
    }),
})

export const validateOrderCurrentUserQuery = validate({
    query: Joi.object().keys({
        search: Joi.string().max(200),
        page: Joi.number().integer().min(1),
        limit: Joi.number().integer().min(1),
    }),
})

export const validateCustomerQuery = validate({
    query: Joi.object().keys({
        search: Joi.string().max(200),
        page: Joi.number().integer().min(1),
        limit: Joi.number().integer().min(1),
        sortField: Joi.string().valid(
            'createdAt',
            'totalAmount',
            'orderCount',
            'lastOrderDate',
            'name'
        ),
        sortOrder: Joi.string().valid('asc', 'desc'),
        registrationDateFrom: Joi.string().isoDate(),
        registrationDateTo: Joi.string().isoDate(),
        lastOrderDateFrom: Joi.string().isoDate(),
        lastOrderDateTo: Joi.string().isoDate(),
        totalAmountFrom: Joi.number().min(0),
        totalAmountTo: Joi.number().min(0),
        orderCountFrom: Joi.number().integer().min(0),
        orderCountTo: Joi.number().integer().min(0),
    }),
})

export const validateCustomerUpdateBody = validate({
    body: Joi.object().keys({
        name: Joi.string().min(2).max(30).messages({
            'string.min': 'Минимальная длина поля "name" - 2',
            'string.max': 'Максимальная длина поля "name" - 30',
        }),
        email: Joi.string()
            .email()
            .message('Поле "email" должно быть валидным email-адресом'),
    }),
})

export const validateUserUpdateBody = validateCustomerUpdateBody

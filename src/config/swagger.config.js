import swaggerJsdoc from 'swagger-jsdoc';

const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Electronics Store API',
            version: '1.0.0',
            description: 'A comprehensive REST API for an electronics store with multi-language support, dynamic product attributes, and complete order management',
            contact: {
                name: 'API Support',
                email: 'support@example.com'
            },
            license: {
                name: 'ISC',
                url: 'https://opensource.org/licenses/ISC'
            }
        },
        servers: [
            {
                url: 'http://localhost:3000/api/v1',
                description: 'Development server'
            },
            {
                url: 'http://localhost:5000/api/v1',
                description: 'Production server'
            }
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                    description: 'Enter JWT token obtained from login endpoint'
                }
            },
            schemas: {
                BilingualText: {
                    type: 'object',
                    properties: {
                        en: {
                            type: 'string',
                            description: 'English text'
                        },
                        ar: {
                            type: 'string',
                            description: 'Arabic text'
                        }
                    },
                    required: ['en', 'ar']
                },
                Error: {
                    type: 'object',
                    properties: {
                        success: {
                            type: 'boolean',
                            example: false
                        },
                        message: {
                            type: 'string',
                            example: 'Error message'
                        },
                        errors: {
                            type: 'array',
                            items: {
                                type: 'string'
                            }
                        }
                    }
                },
                Success: {
                    type: 'object',
                    properties: {
                        success: {
                            type: 'boolean',
                            example: true
                        },
                        message: {
                            type: 'string'
                        },
                        data: {
                            type: 'object'
                        }
                    }
                },
                Banner: {
                    type: 'object',
                    properties: {
                        _id: {
                            type: 'string',
                            format: 'objectId'
                        },
                        images: {
                            type: 'array',
                            items: {
                                type: 'object',
                                properties: {
                                    _id: {
                                        type: 'string'
                                    },
                                    imageUrl: {
                                        type: 'string',
                                        format: 'uri'
                                    },
                                    title: {
                                        $ref: '#/components/schemas/BilingualText'
                                    },
                                    subtitle: {
                                        $ref: '#/components/schemas/BilingualText'
                                    },
                                    linkUrl: {
                                        type: 'string',
                                        format: 'uri'
                                    },
                                    displayOrder: {
                                        type: 'number',
                                        default: 0
                                    },
                                    isActive: {
                                        type: 'boolean',
                                        default: true
                                    }
                                },
                                required: ['imageUrl']
                            }
                        },
                        isActive: {
                            type: 'boolean',
                            default: true
                        },
                        createdAt: {
                            type: 'string',
                            format: 'date-time'
                        },
                        updatedAt: {
                            type: 'string',
                            format: 'date-time'
                        }
                    }
                },
                User: {
                    type: 'object',
                    properties: {
                        _id: {
                            type: 'string'
                        },
                        firstName: {
                            type: 'string'
                        },
                        lastName: {
                            type: 'string'
                        },
                        email: {
                            type: 'string',
                            format: 'email'
                        },
                        phone: {
                            type: 'string'
                        },
                        role: {
                            type: 'string',
                            enum: ['user', 'admin'],
                            default: 'user'
                        },
                        addresses: {
                            type: 'array',
                            items: {
                                type: 'object'
                            }
                        }
                    }
                },
                Brand: {
                    type: 'object',
                    properties: {
                        _id: {
                            type: 'string'
                        },
                        name: {
                            $ref: '#/components/schemas/BilingualText'
                        },
                        image: {
                            type: 'string',
                            format: 'uri'
                        },
                        isActive: {
                            type: 'boolean',
                            default: true
                        }
                    }
                },
                Product: {
                    type: 'object',
                    properties: {
                        _id: {
                            type: 'string'
                        },
                        name: {
                            $ref: '#/components/schemas/BilingualText'
                        },
                        description: {
                            $ref: '#/components/schemas/BilingualText'
                        },
                        price: {
                            type: 'number'
                        },
                        images: {
                            type: 'array',
                            items: {
                                type: 'string',
                                format: 'uri'
                            }
                        },
                        brand: {
                            type: 'string'
                        },
                        category: {
                            type: 'string'
                        },
                        stock: {
                            type: 'number'
                        },
                        attributes: {
                            type: 'object',
                            additionalProperties: {
                                type: 'string'
                            }
                        },
                        isFeatured: {
                            type: 'boolean'
                        },
                        isActive: {
                            type: 'boolean'
                        }
                    }
                }
            }
        },
        tags: [
            {
                name: 'Authentication',
                description: 'User authentication and authorization'
            },
            {
                name: 'Users',
                description: 'User profile and address management'
            },
            {
                name: 'Brands',
                description: 'Product brand management'
            },
            {
                name: 'Categories',
                description: 'Product category management with dynamic attributes'
            },
            {
                name: 'Products',
                description: 'Product catalog with filtering and search'
            },
            {
                name: 'Cart',
                description: 'Shopping cart operations'
            },
            {
                name: 'Orders',
                description: 'Order creation and management'
            },
            {
                name: 'Offers',
                description: 'Promotional offers and discounts'
            },
            {
                name: 'Payment Methods',
                description: 'Payment method configuration'
            },
            {
                name: 'Banner',
                description: 'Homepage banner/slider management'
            },
            {
                name: 'Home',
                description: 'Home page data aggregation'
            }
        ]
    },
    apis: ['./src/routes/*.js'] // Path to the API routes
};

const swaggerSpec = swaggerJsdoc(options);

export default swaggerSpec;

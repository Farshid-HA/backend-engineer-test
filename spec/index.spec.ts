import Fastify from 'fastify';
import http from 'http';
import { port } from '../src/configuration/server'

let fastify: any;

beforeAll(async () => {
    fastify = Fastify();

    try {
        await fastify.listen({
            port: port,
            host: '0.0.0.0',
        });
    } catch (err) {
        fastify.log.error(err);
        process.exit(1);
    }
});

afterAll(async () => {
    await fastify.close();
});

describe('Fastify Server', () => {

    it('it should start without errors', async () => {
        expect(fastify).toBeDefined();
    });

    it('it should respond to a basic request', async () => {
        const options = {
            hostname: 'localhost',
            port: port,
            path: '/',
            method: 'GET',
        };

        return new Promise<void>((resolve) => {
            const req = http.request(options, (res) => {
                expect(res.statusCode).toBe(404);
                resolve();
            });

            req.on('error', (e) => {
                fastify.log.error(e);
            });

            req.end();
        });
    });

    it('it should be 404 when the :address is not defined', async () => {
        const options = {
            hostname: 'localhost',
            port: port,
            path: '/balance',
            method: 'GET',
        };
        return new Promise<void>((resolve) => {
            const req = http.request(options, (res) => {
                expect(res.statusCode).toBe(404);
                resolve();
            });

            req.on('error', (e) => {
                fastify.log.error(e);
            });

            req.end();
        });
    })

    it('it should return 200 after the block is posted', async () => {
        const content = {
            id: "d1582b9e2cac15e170c39ef2e85855ffd7e6a820550a8ca16a2f016d366503dc",
            height: 1,
            transactions: [
                {
                    "id": "tx1",
                    "inputs": [],
                    "outputs": [
                        {
                            "address": "addr1",
                            "value": 10
                        }
                    ]
                }
            ]
        };

        const options = {
            hostname: 'localhost',
            port: port,
            path: '/blocks',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(JSON.stringify(content))
            }
        };

        return new Promise<void>((resolve, reject) => {
            const req = http.request(options, (res) => {
                let data = '';
                res.on('data', (chunk) => {
                    data += chunk;
                });

                res.on('end', () => {
                    expect(res.statusCode).toBe(200);
                    expect(data).toBe('{"success":true}');
                    resolve();
                });
            });

            req.on('error', (e) => {
                fastify.log.error(e);
                reject(e);
            });

            req.write(JSON.stringify(content));
            req.end();
        });
    });

    it('it should be 10 when the :address is addr1 ', async () => {
        const options = {
            hostname: 'localhost',
            port: port,
            path: '/balance/:addr1',
            method: 'GET',
        };
        return new Promise<void>((resolve, reject) => {
            const req = http.request(options, (res) => {
                let data = '';

                res.on('data', (chunk) => {
                    data += chunk;
                    expect(res.statusCode).toBe(200);
                    expect(JSON.parse(data).balance.value).toBe('10');
                    resolve();
                });

            });

            req.on('error', (e) => {
                fastify.log.error(e);
                reject(e);
            });

            req.end();
        });
    })

    it('it should return 400 after the block is duplicated', async () => {
        const content = {
            id: "d1582b9e2cac15e170c39ef2e85855ffd7e6a820550a8ca16a2f016d366503dc",
            height: 1,
            transactions: [
                {
                    "id": "tx1",
                    "inputs": [],
                    "outputs": [
                        {
                            "address": "addr1",
                            "value": 10
                        }
                    ]
                }
            ]
        };

        const options = {
            hostname: 'localhost',
            port: port,
            path: '/blocks',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(JSON.stringify(content))
            }
        };

        return new Promise<void>((resolve, reject) => {
            const req = http.request(options, (res) => {
                let data = '';
                res.on('data', (chunk) => {
                    data += chunk;
                });

                res.on('end', () => {
                    expect(res.statusCode).toBe(400);
                    expect(JSON.parse(data)).toEqual({
                        error: "duplicate key value violates unique constraint \"blocks_pkey\""
                    });
                    resolve();
                });
            });

            req.on('error', (e) => {
                fastify.log.error(e);
                reject(e);
            });

            req.write(JSON.stringify(content));
            req.end();
        });
    });

    it('it should return 200 after the second block is posted', async () => {
        const content = {
            id: "c4701d0bfd7179e1db6e33e947e6c718bbc4a1ae927300cd1e3bda91a930cba5",
            height: 2,
            transactions: [
                {
                    id: "tx2",
                    inputs: [
                        {
                            txId: "tx1",
                            index: 0
                        }
                    ],
                    outputs: [
                        {
                            address: "addr2",
                            value: 4
                        },
                        {
                            address: "addr3",
                            value: 6
                        }
                    ]
                }
            ]
        };

        const options = {
            hostname: 'localhost',
            port: port,
            path: '/blocks',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(JSON.stringify(content))
            }
        };

        return new Promise<void>((resolve, reject) => {
            const req = http.request(options, (res) => {
                let data = '';
                res.on('data', (chunk) => {
                    data += chunk;
                });

                res.on('end', () => {
                    expect(res.statusCode).toBe(200);
                    resolve();
                });
            });

            req.on('error', (e) => {
                fastify.log.error(e);
                reject(e);
            });

            req.write(JSON.stringify(content));
            req.end();
        });
    });

    it('it should be 4 when the :address is addr2 ', async () => {
        const options = {
            hostname: 'localhost',
            port: port,
            path: '/balance/:addr2',
            method: 'GET',
        };
        return new Promise<void>((resolve, reject) => {
            const req = http.request(options, (res) => {
                let data = '';

                res.on('data', (chunk) => {
                    data += chunk;
                    expect(res.statusCode).toBe(200);
                    expect(JSON.parse(data).balance.value).toBe('4');
                    resolve();
                });

            });

            req.on('error', (e) => {
                fastify.log.error(e);
                reject(e);
            });

            req.end();
        });
    })

    it('it should return 200 after the third block is posted', async () => {
        const content = {
            id: "4e5f22a2abacfaf2dcaaeb1652aec4eb65028d0f831fa435e6b1ee931c6799ec",
            height: 3,
            transactions: [
                {
                    id: "tx3",
                    inputs: [
                        {
                            txId: "tx2",
                            index: 1
                        }
                    ],
                    outputs: [
                        {
                            address: "addr4",
                            value: 2
                        },
                        {
                            address: "addr5",
                            value: 2
                        },
                        {
                            address: "addr6",
                            value: 2
                        }
                    ]
                }
            ]
        };

        const options = {
            hostname: 'localhost',
            port: port,
            path: '/blocks',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(JSON.stringify(content))
            }
        };

        return new Promise<void>((resolve, reject) => {
            const req = http.request(options, (res) => {
                let data = '';
                res.on('data', (chunk) => {
                    data += chunk;
                });

                res.on('end', () => {
                    expect(res.statusCode).toBe(200);
                    resolve();
                });
            });

            req.on('error', (e) => {
                fastify.log.error(e);
                reject(e);
            });

            req.write(JSON.stringify(content));
            req.end();
        });
    });

    it('it should be 0 when the :address is addr3 ', async () => {
        const options = {
            hostname: 'localhost',
            port: port,
            path: '/balance/:addr3',
            method: 'GET',
        };
        return new Promise<void>((resolve, reject) => {
            const req = http.request(options, (res) => {
                let data = '';

                res.on('data', (chunk) => {
                    data += chunk;
                    expect(res.statusCode).toBe(200);
                    expect(JSON.parse(data).balance.value).toBe('0');
                    resolve();
                });

            });

            req.on('error', (e) => {
                fastify.log.error(e);
                reject(e);
            });

            req.end();
        });
    })

});



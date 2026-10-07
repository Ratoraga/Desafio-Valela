import frontend from "./index.html"
import { db } from "./db"

const srv = Bun.serve({
    port: 3000,
    routes: {
        "/": frontend,
        "/user": {
            GET: () => {
                const query = db.query(`SELECT * FROM users`)
                const data = query.all()
                return Response.json(data)
            },

            POST: async (req) => {
                let body
                try {
                    body = await req.body?.json()
                } catch (error: any) {
                    return Response.json({
                        message: "JSON mal formado",
                        parseError: error
                    }, { status: 400 })
                }
                if (!body.username)
                    return Response.json({ message: "Falta da informação: username" }, { status: 400 })
                if (!body.email)
                    return Response.json({ message: "Falta da informação: email" }, { status: 400 })
                if (!body.password)
                    return Response.json({ message: "Falta da informação: password" }, { status: 400 })
                const query = db.query(`
                    INSERT INTO users(username, email, password)
                    VALUES(:username, :email, :password)
                `)
                try {
                    const dbResp = query.run({
                        ':username': body.username,
                        ':email': body.email,
                        ':password': body.password
                    })
                    return Response.json({
                        "message": "deu boa mlk!",
                        dbResp
                    })
                } catch (e: any) {
                    if (e.code == "SQLITE_CONSTRAINT_UNIQUE") {
                        return Response.json({
                            message: "Username e Email precisam ser únicos",
                            code: "UNIQUE:CONSTRAINT"
                        }, { status: 400 })
                    }
                    return Response.json({
                        message: "Erro ao inserir no banco de dados",
                        dbError: e
                    }, { status: 500 })
                }
            },
        },

        "/user/:id": {
            GET: (req) => {
                const id = req.params.id
                const query = db.query(`SELECT * FROM users WHERE id=:id`)
                const data = query.get({ ':id': id })
                return Response.json(data)
            },

            PUT: async(req) => {
                let body
                try {
                    body = await req.body?.json()
                } catch (error: any) {
                    return Response.json({
                        message: "JSON mal formado",
                        parseError: error
                    }, { status: 400 })
                }
                if (!body.username)
                    return Response.json({ message: "Falta da informação: username" }, { status: 400 })
                if (!body.email)
                    return Response.json({ message: "Falta da informação: email" }, { status: 400 })
                if (!body.password)
                    return Response.json({ message: "Falta da informação: password" }, { status: 400 })
                const query = db.query(`UPDATE users SET username = :username, email = :email, password = :password WHERE id = :id`)
                try {
                    const dbResp = query.run({
                        ':username': body.username,
                        ':email': body.email,
                        ':password': body.password,
                        ':id': req.params.id
                    })
                    return Response.json({
                        "message": "deu boa mlk!",
                        dbResp
                    })
                } catch (e: any) {
                    if (e.code == "SQLITE_CONSTRAINT_UNIQUE") {
                        return Response.json({
                            message: "Username e Email precisam ser únicos",
                            code: "UNIQUE:CONSTRAINT"
                        }, { status: 400 })
                    }
                    return Response.json({
                        message: "Erro ao inserir no banco de dados",
                        dbError: e
                    }, { status: 500 })
                }
            },

            DELETE: (req) => {
                const query = db.query(`DELETE FROM users WHERE id=:id`)
                const data = query.run({ ':id': req.params.id })
                return Response.json(data)
            }
        }
    }
})
console.log(`Servidor em ${srv.url}`)
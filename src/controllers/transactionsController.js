import { ObjectId } from "mongodb"
import { db } from "../database/database.connection.js"
import dayjs from "dayjs"

export async function checkTransactions(req, res) {
    const {authorization} = req.headers
    const token = authorization?.replace("Bearer ", "")
    try {
        const userFind = await db.collection("login").findOne({token})
        const transactions = await db.collection("transactions").find({userId: userFind.userId}).toArray()
        const response = {transactions: transactions.reverse(), name: userFind.name}
        res.send(response)
    } catch (err) {
        console.log(err.message)
    }
}

export async function postTransactions(req, res) {
    const {authorization} = req.headers
    const token = authorization?.replace("Bearer ", "")
    const {value, description, type} = req.body
    let value2 = parseFloat(value).toFixed(2)

    if(!token) return res.status(401).send("Login não detectado! Faça login novamente.")
    const date = dayjs().format("DD/MM")

    try {
        const findUser = await db.collection("login").findOne({token})
        await db.collection("transactions").insertOne({
            date, description, type, value: value2, userId: findUser.userId
        })
        res.status(201).send("Transação criada")
    } catch (err) {
        console.log(err.message)
    }
}

export async function deleteTransaction(req, res) {
    const {authorization, id} = req.headers
    if(!authorization) return res.sendStatus(401)

    try {
        const result = await db.collection("transactions").deleteOne({ _id: new ObjectId(id) })
        if(result.deletedCount === 0) return res.send("Não há registro dessa transação")
        res.sendStatus(200)
    } catch (err) {
        console.log(err.message)
    }
}
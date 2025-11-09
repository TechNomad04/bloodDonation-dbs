const {User, Donor, Patient} = require('../schema/users.schema')
const Bank = require('../schema/bank.schema')
const Superadmin = require('../schema/superadmin.schema')

const signup = async(req, res) => {
    try{ 
        const {name, contact, usertype} = req.body;

        if(!name || !contact || ! usertype)
            return res.status(400).json({status: true, message: "Missing fields"})

        let user = await User.findOne({contact, usertype})
        if(user)
            return res.status(409).json({status: false, message: "User already exists"})

        if(usertype == 'Donor')
            user = new Donor({name, contact})
        else if(usertype == 'Patient')
            user = new Patient({name, contact})
        await user.save()

        return res.status(200).json({status: true, user})
    } catch (err) {
        console.log(err)
        return res.status(500).json({status: false, message: "Internal server error"})
    }
}

const login = async(req, res) => {
    try {
        const {name, contact, usertype} = req.body

        if(!name || !contact || !usertype)
            return res.status(400).json({status: false, message: "Missing fields"})

        const user = await User.findOne({name, contact, __t: usertype})
        if(!user)
            return res.status(404).json({status: false, message: "User not found"})

        return res.status(200).json({status: true, user})
    } catch (err) {
        console.log(err)
        return res.status(500).json({status: false, message: "Internal server error"})
    }
}

const adlogin = async(req, res) => {
    try {
        const {name, city} = req.body

        if(!name || !city) 
            return res.status(400).json({status: false, message: "Missing fields"})

        const bank = await Bank.findOne({name, city})
        return res.status(200).json({status: true, bank})
    } catch (err) {
        console.log(err)
        return res.status(500).json({status: false, message: "Internal server error"})
    }
}

const superadlog = async(req, res) => {
    try {
        const {name, email} = req.body
        if(!name || !email) 
            return res.status(400).json({status: false, message: "Missing fields"})

        const user = await Superadmin.findOne({name, email})
        if(!user)
            return res.status(404).json({status: false, message: "User not found"})
        return res.status(200).json({status:  true, user})
    } catch (err) {
        console.log(err)
        return res.status(500).json({status: false, message: "Internal server error"})
    }
}

const superadadd = async (req, res) => {
    try {
        const {name, email} = req.body
        const supeerad = new Superadmin({name, email})
        await supeerad.save()
        return res.status(200).json({status: true, supeerad})
    } catch (err) {
        console.log(err.message)
        return res.status(500).json({status: false, message: "Internal server error"})
    }
}

module.exports = {
    signup,
    login,
    adlogin,
    superadlog,
    superadadd
}
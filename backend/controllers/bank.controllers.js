const {Bank} = require('../schema/bank.schema')

const addbank = async(req, res) => {
    try {
        const {name, addressline1, addressline2, pincode, city, state} = req.body
        if(!name || !addressline1 || !addressline2 || !pincode || !city || !state)
            return res.status(400).json({status:false, message: "Missing fields"})

        let bank = await Bank.findOne({name, city, state})

        if(bank)
            return res.status(409).json({status: false, message: "Aleady exists"})

        bank = new Bank({name, addressline1, addressline2, pincode, city, state})
        await bank.save()

        return res.status(200).json({status: true, bank})
    } catch (err) {
        console.log(err)
        return res.status(500).json({status: false, message: "Internal server error"})
    }
}

const fetchbanks = async (req, res) => {
    try {
        const banks = await Bank.find()
        return res.status(200).json({status: true, banks})
    } catch (err) {
        console.log(err)
        return res.status(500).json({status: false, message: "Internal server error"})
    }
}

module.exports = {
    addbank,
    fetchbanks
}
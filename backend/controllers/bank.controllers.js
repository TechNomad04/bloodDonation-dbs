const {Bank} = require('../schema/bank.schema')

const addbank = async(req, res) => {
    try {
        const {name, addressline1, addressline2, pincode, city, state} = req.body
        if(!name || !addressline1 || !addressline2 || !pincode || !city || !state)
            return res.status(400).json({status:false, message: "Missing fields"})

        const bank = new Bank({name, addressline1, addressline2, pincode, city, state})
        await bank.save()

        return res.status(200).json({status: true, bank})
    } catch (err) {
        console.log(err)
        return res.status(500).json({status: false, message: "Internal server error"})
    }
}

module.exports = addbank
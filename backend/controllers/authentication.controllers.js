const User = require('../schema/users.schema')

const signup = async(req, res) => {
    try{ 
        const {name, contact, usertype} = req.body;

        if(!name || !contact || ! usertype)
            return res.status(400).json({status: true, message: "Missing fields"})

        const user = new User({name, contact, usertype})
        await user.save()

        return res.status(200).json({status: true, user})
    } catch (err) {
        console.log(err)
        return res.status(500).json({status: false, message: "Internal server error"})
    }
}

module.exports = {
    signup
}
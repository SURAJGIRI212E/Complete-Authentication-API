import jwt from 'jsonwebtoken'
import UserModel from '../models/User.js'
import dotenv from 'dotenv'
dotenv.config()

var checkUserAuth =async(req,res,next)=>{
    let token
    const {authorization}=req.headers
    if(authorization && authorization.startsWith('Bearer')){
        try{ 
            //get token from header
            token=authorization.split(' ')[1]
            console.log(token)
    
            //Verify token
            const {userID}=  jwt.verify(token,process.env.JWT_SECRET_KEY)
           
            //get user from token
            req.user=await UserModel.findById(userID).select('-password');
            next()
        }catch(error){ 
            console.log(error)
         res.status(401).send({"status":"failed","mssg":"unauthrized"})   
        }
    }
    if (!token){
        res.status(401).send({"status":"failed","mssg":"unauthrized user, no token"})   
    }
}

export default checkUserAuth
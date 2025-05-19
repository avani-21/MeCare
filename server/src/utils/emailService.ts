import nodemailer from "nodemailer"
import dotenv from "dotenv"

dotenv.config()

const transporter=nodemailer.createTransport({
    service:"Gmail",
    auth:{
        user:process.env.EMAIL_USER,
        pass:process.env.EMAIL_PASS
    }
})

const sendOtpEmail=async (email:string,otp:string)=>{
  console.log(otp)
    try{
      await transporter.sendMail({
        from:process.env.EMAIL_USER,
        to:email,
        subject:"Your OTP for account verification",
        text: `Your OTP is: ${otp}. It will expire in 10 minutes.`,
      })
    }catch(error){
     console.error("failed to send otp email",error);
     throw new Error("Failed to send OTP email")
    }

}

export default sendOtpEmail
import {z} from 'zod';

//1st method to check schema -if we have to check 
// first method

//no need to of object
export const usernameValidation=z
  .string()
  .min(2,"user name must atleast 2 character")
  .max(20,"username must not be more than 20 character more")
  .regex(/^[a-zA-Z0-9]+$/,"username must not contain special characetr")


//need of object as we have to check more than two scehema
export const signUpSchema=z.object({
    username:usernameValidation,
    email:z.string().email({message:"invalid email address"}),
    password:z.string().min(6,{message:"password must be atleast 6 character"})
})  



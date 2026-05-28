//zod library is very popular library

*it is typescript first schema validation
//it reduce dedicated schema content needed in the project

//example
 const User=z.object({
    username:z.string(),
 })

 User.parse{{username:"Ludwig"}};

 //what does zod do?
 //

 conmmon syntax of zod

 const schema_name=z.
  string(),
  min(),
  .
  .
  .
  so on.
  
  or

  const schema_name=z.object({
     key1:z. ...
     key2:z. ...
     key3:z.  ...
  })
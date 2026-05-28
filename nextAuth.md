User clicks Login

↓

NextAuth verifies credentials/provider

↓

Session/JWT created

↓

User stays logged in

↓

Protected pages become accessible

//it has certain components

1.provider
 ways user authenticate

2.
session
 store loggged-in state
 const session = await getServerSession(authOptions);
 
3.jwt

json web token
 has three part -meta data,payload and signature
 can store information for internal routing and monitoring

4.adapters
Connect auth to database



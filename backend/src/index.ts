import { Hono } from 'hono'
import { PrismaClient } from '@prisma/client/edge'
import {sign,verify} from 'hono/jwt'
import { jwt } from 'hono/jwt'
import { withAccelerate } from '@prisma/extension-accelerate';

const app = new Hono<{
  Bindings: {
      DATABASE_URL: string
      JWT_SECRET: string,
  },
  Variables : {
    userId: string
  }
}>()


//* means this route and anything dynamic after that
app.use('/api/v1/blog/*', async (c, next) => {
  app.use('/api/v1/blog/*', async (c, next) => {
    const jwt = c.req.header('Authorization');
    if (!jwt) {
      c.status(401);
      return c.json({ error: "unauthorized" });
    }
    const token = jwt.split(' ')[1];
    const payload = await verify(token, c.env.JWT_SECRET);
    if (!payload) {
      c.status(401);
      return c.json({ error: "unauthorized" });
    }
    c.set('userId', payload.id);
    await next()
  })
})

app.post('/api/v1/signup', async(c) => {
  const prisma = new PrismaClient({
    datasourceUrl: c.env.DATABASE_URL,
  }).$extends(withAccelerate())
  const body= await c.req.json();
  try{
  const user = await prisma.user.create({
    data:{
      email: body.email,
      password: body.password
    }
  })
  const jwt = await sign({ id: user.id }, c.env.JWT_SECRET);
		 return c.json({ jwt });
    
}
catch(e) {
   c.status(403)
   return c.json({error: "error while signing up"})
}
})
app.post('/api/v1/user/signin' , async (c) => {
  const prisma = new PrismaClient({
    datasourceUrl: c.env.DATABASE_URL,
  }).$extends(withAccelerate())
  const body = await c.req.json();
  const user = await prisma.user.findUnique({
    where: {
      email: body.email
    }
  })
  if(!user) {
    c.status(403)
    return c.json({
      error: "Specified user does not exists"
    })
  }
  const jwt = await sign({id: user.id},c.env.JWT_SECRET)
  return c.json({jwt})
})
app.post('/api/v1/blog' , (c) => {
  return c.text('')
})
app.put('/api/v1/blog' , (c)=> {
  return c.text('')
})
app.get('/api/v1/blog/:id' , (c) => {
  return c.text('')
})
app.get('/api/v1/blog/bulk' , (c) => {
  return c.text('')
})



export default app

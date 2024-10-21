const {PrismaClient}= require('@prisma/client')

const prisma = new PrismaClient()

async function main(){
    // await prisma.post.delete({
    //     where:{
    //         id:1
    //     }
    // })
}

main().then(async()=>{
    await prisma.$disconnect()
}).catch(async(e)=>{
    console.log(e)
    await prisma.$disconnect()
    process.exit(1)
})
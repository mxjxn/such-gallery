// clearDb.js

import { PrismaClient }  from '@prisma/client';

const prisma = new PrismaClient();

const deleteAllData = async () => {
  await prisma.curatedCollectionNFT.deleteMany({});
  
  await prisma.nFT.deleteMany({});
  
  await prisma.curatedCollection.deleteMany({});
  
  await prisma.user.deleteMany({});
  
  await prisma.nFTCollection.deleteMany({});
};

deleteAllData()
  .then(() => console.log('All data deleted'))
  .catch((e) => console.error(e))
  .finally(async () => await prisma.$disconnect());

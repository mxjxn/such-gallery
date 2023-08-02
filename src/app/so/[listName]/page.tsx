import prisma from "@/prisma";

async function getList(listName: string) {
  "use server";
  return await prisma.curatedCollection.findUnique({
    where: {
      name: listName,
    },
    include: {
      nfts: {
        nft: true,
      },
    },
  });
}

export default function Page({ params }: { params: { listName: string } }) {
  // take listName, do a prisma lookup
	const list = await getList(params.listName);

  return (
    <div>
      <p>Post: {params.listName}</p>
    </div>
  );
}

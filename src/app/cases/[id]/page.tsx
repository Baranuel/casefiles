

type CasePageProps =  {
    params: Promise<{id: string}>
  }

export default async function CasePage({params}:CasePageProps ) {
    const {id} = await params
    
    return (
        <div className="flex flex-col gap-4">
        <h1 className="text-4xl lg:text-6xl font-bold text-primary-800">ID is {id}</h1>
        <p className="text-lg text-primary-800/70">Details about the case will go here.</p>
        </div>
    );
}
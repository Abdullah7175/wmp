import UpdateMilestoneForm from "./components/UpdateMilestoneForm";

export default async function EditMilestonePage({ params }) {
  const { id } = await params; 

  return (
    <div className="container mx-auto py-6">
      <UpdateMilestoneForm id={id} />
    </div>
  );
}
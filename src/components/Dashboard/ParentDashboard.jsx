//import ChoreList from "./ChoreList";
//import AddChoreForm from "./AddChoreForm";
import LogoutButton from "../LogoutButton";

const ParentDashboard = () => {
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold">Parent Dashboard</h1>
     {/* <AddChoreForm />
      <ChoreList role="Parent" />*/}
      <LogoutButton />
    </div>
  );
};

export default ParentDashboard;

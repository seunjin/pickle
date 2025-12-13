export default function AdminDashboardPage() {
  return (
    <div>
      <h1 className="font-bold text-2xl">Admin Dashboard</h1>
      <p className="mt-4 text-gray-600">
        Restricted area. Only users with 'admin' or 'super_admin' roles can see
        this.
      </p>
    </div>
  );
}

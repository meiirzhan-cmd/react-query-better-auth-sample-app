import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";
import { logout } from "@/app/(auth)/logout/action";

export default async function IndexPage() {
  // Get session on the server using Better Auth
  const session = await getSession();

  // Redirect if not authenticated
  if (!session) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <form action={logout}>
            <button
              type="submit"
              className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
            >
              Logout
            </button>
          </form>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">
            Welcome, {session.user.name}!
          </h2>
          <div className="space-y-2 text-gray-700">
            <p>
              <span className="font-medium">Email:</span> {session.user.email}
            </p>
            <p>
              <span className="font-medium">User ID:</span> {session.user.id}
            </p>
            <p>
              <span className="font-medium">Email Verified:</span>{" "}
              {session.user.emailVerified ? "Yes" : "No"}
            </p>
            <p>
              <span className="font-medium">Session Expires:</span>{" "}
              {new Date(session.session.expiresAt).toLocaleString()}
            </p>
          </div>
        </div>

        <div className="mt-8 bg-gray-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-3">Session Details</h3>
          <pre className="bg-gray-800 text-green-400 p-4 rounded text-sm overflow-auto">
            {JSON.stringify(session, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  );
}

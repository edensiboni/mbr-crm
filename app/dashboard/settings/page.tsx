import { Settings } from "lucide-react";

export default function SettingsPage() {
  return (
    <div className="p-8 max-w-2xl">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-9 h-9 bg-gray-100 rounded-xl flex items-center justify-center">
          <Settings className="w-5 h-5 text-gray-600" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
      </div>

      <div className="space-y-4">
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <h2 className="font-semibold text-gray-900 mb-4">Engineer Credentials</h2>
          <div className="space-y-3 text-sm text-gray-600">
            <div className="flex justify-between py-2 border-b border-gray-50">
              <span>Username</span><span className="font-mono font-medium text-gray-900">engineer</span>
            </div>
            <div className="flex justify-between py-2">
              <span>Password</span><span className="font-mono font-medium text-gray-900">mbr2025</span>
            </div>
          </div>
          <p className="text-xs text-gray-400 mt-4">To change credentials, edit <code className="bg-gray-100 px-1 rounded">app/page.tsx</code> login handler.</p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <h2 className="font-semibold text-gray-900 mb-4">AI Agent</h2>
          <p className="text-sm text-gray-600 mb-3">The AI Agent requires an Anthropic API key to function.</p>
          <div className="bg-gray-50 rounded-xl p-3 font-mono text-xs text-gray-600">
            ANTHROPIC_API_KEY=your-key-here
          </div>
          <p className="text-xs text-gray-400 mt-2">Set this in your <code className="bg-gray-100 px-1 rounded">.env</code> file and restart the server.</p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <h2 className="font-semibold text-gray-900 mb-2">Database</h2>
          <p className="text-sm text-gray-600">SQLite database stored at <code className="bg-gray-100 px-1 rounded text-xs">prisma/dev.db</code></p>
          <p className="text-xs text-gray-400 mt-2">Run <code className="bg-gray-100 px-1 rounded">npx prisma studio</code> to browse data directly.</p>
        </div>
      </div>
    </div>
  );
}

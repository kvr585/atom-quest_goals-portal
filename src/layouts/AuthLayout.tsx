import { Outlet } from 'react-router-dom';
import { Atom } from 'lucide-react';

export function AuthLayout() {
  return (
    <div className="flex min-h-screen">
      <div className="hidden flex-1 flex-col justify-between bg-gradient-to-br from-blue-600 to-blue-800 p-12 text-white lg:flex">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20">
            <Atom className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xl font-bold">AtomQuest</p>
            <p className="text-sm text-blue-200">Goals Portal</p>
          </div>
        </div>
        <div>
          <h1 className="text-4xl font-bold leading-tight">
            Enterprise Goal Setting &amp; Tracking
          </h1>
          <p className="mt-4 max-w-md text-lg text-blue-100">
            Align teams, track performance, and drive organizational excellence with our modern HR performance management platform.
          </p>
          <div className="mt-8 grid grid-cols-3 gap-4">
            {['20+ Employees', '5 Managers', 'Real-time Analytics'].map((stat) => (
              <div key={stat} className="rounded-lg bg-white/10 p-4 text-center text-sm font-medium">
                {stat}
              </div>
            ))}
          </div>
        </div>
        <p className="text-sm text-blue-200">© 2026 AtomQuest Inc. All rights reserved.</p>
      </div>
      <div className="flex flex-1 items-center justify-center p-6">
        <Outlet />
      </div>
    </div>
  );
}
